#!/usr/bin/env bash
# rt-hook: Stop
# Requires: hooks/hook-input.sh, hooks/turn-exit-patterns.sh, hooks/deny-tail.sh, checks/epic-table.github.mjs
# The guard of the open epic: while the epic has an unfinished task, a turn does not end without a
# lawful reason. Stop. This tree's own guard — it is not laid out from the package.
#
# Why it exists. The turn-exit guard judges one turn and releases it in two cases this guard does
# not: a turn that ended with work, and a second pass over the same turn. Both are stops all the
# same: the work stands where it stood, and the owner sees the executor standing still with the
# epic open. The owner said it outright — until the epic is closed, the executor has no right to
# stop on its own — and the ban is held by the machine, not by memory.
#
# What releases a turn — the lawful exits of the rule, and nothing else:
#   1. A question to the owner through the question tool.
#   2. A refusal of a guard in this turn.
#   3. The session handover is written — the window has run out.
#   4. The owner's word about stopping — in this turn, or standing in the progress: the line
#      «Waiting for the owner» quotes their word in « ».
#   5. The epic is over: not one of its tasks is left unfinished. The end of an epic is a stop.
#
# The state of the epic is asked by the same command that prints the table for the owner, and only
# on the way to a refusal: the call goes to the hosting and costs seconds.
#
# FAIL-OPEN: no `jq`, no `node`, no turn record, no epic behind the branch, no way to ask the
# hosting — the turn is ALLOWED (exit 0). A broken guard has no right to jam the conversation.

# Its own name in the observations: the refusal is written by the shared deny tail.
RT_GUARD_NAME=work-continues-guard

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$here/utf8.sh" 2>/dev/null || true
. "$here/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v node >/dev/null 2>&1 || exit 0

# A second pass over the same turn IS judged here, unlike in the turn-exit guard: the work is still
# unfinished on the second pass, and a stop let through on it is a stop. The loop is broken by the
# lawful exits above, not by the count of passes.

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
root="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -z "$root" ] && exit 0

branch="$(git branch --show-current 2>/dev/null)"
tasks_dir="${RT_TASKS_DIR:-docs/tasks}"
progress=""
[ -n "$branch" ] && [ -f "$root/$tasks_dir/$branch/progress.md" ] && progress="$root/$tasks_dir/$branch/progress.md"

# 3. The handover is written: the session closes by the rule of the window.
if [ -n "$progress" ] && grep -qE '^## (Handover of the session|Передача захода)' "$progress" 2>/dev/null; then
    exit 0
fi

# 4a. The owner's standing word. The line quotes it in « »: the guard reads their word, not a
# retelling, and a line without a quote does not release the turn.
if [ -n "$progress" ]; then
    waiting="$(sed -nE 's/^[[:space:]]*[-*][[:space:]]*\*\*(Waiting for the owner|Ждём владельца|Ждём от владельца):\*\*[[:space:]]*(.*)/\2/p' "$progress" 2>/dev/null | head -1)"
    if printf '%s' "$waiting" | grep -q '«[^»]\{3,\}»' 2>/dev/null; then
        exit 0
    fi
fi

# 1, 2, 4b. The turn record: a question by the tool, a refusal of a guard, a written handover and
# the owner's word in this turn. The turn is cut from the last owner's input; a loaded rule comes
# back as a user message too, marked as meta, and it is not an input — cut there, the turn lost
# everything before the load, and the owner's words were read out of the rule's text. The shared
# patterns are taken from the turn-exit guard's file, the parsing is not: a refusal of a guard ends
# the turn only as its LAST action — a refusal lifted by loading the rule and answered by the next
# call is the middle of the turn, and read as an exit it released a turn that ended with a report.
# A line of the hook's own feedback is not the owner's word either: it quotes the progress, and the
# progress may hold the owner's word about a stop from yesterday.
. "$here/turn-exit-patterns.sh" 2>/dev/null || exit 0
[ -n "${standing_work_re:-}" ] || exit 0
turn="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -c '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and ((.isMeta // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);
    def text_of:
        .message.content
        | if type == "string" then . elif type == "array"
          then (map(if type == "object" then (.text // "") else "" end) | join("\n")) else "" end;
    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")] as $uses
    | ($uses | map(.name // "") | any(test("AskUserQuestion"))) as $asked
    | ($uses | map(.input.command // "") | join("\n")) as $ran
    | ([$turn[] | select(.type == "user") | .message.content // [] | select(type == "array") | .[]
          | select(.type == "tool_result") | .content
          | if type == "string" then .
            elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
            else tostring end] | last // "") as $last_out
    | ($last_out | test("BLOCKED by|Refused by the rules gate|Отбито гейтом")) as $denied
    | ($ran | test("handoff")) as $handed
    | ([$turn[] | select(is_input) | text_of
          | select(test("^\\s*(Stop hook feedback|\\[Request interrupted)") | not)] | join("\n")) as $said
    | {asked: $asked, denied: $denied, handed: $handed, said: $said}
' 2>/dev/null)"
[ -z "$turn" ] && exit 0
asked="$(printf '%s' "$turn" | jq -r '.asked // false' 2>/dev/null)"
denied="$(printf '%s' "$turn" | jq -r '.denied // false' 2>/dev/null)"
handed="$(printf '%s' "$turn" | jq -r '.handed // false' 2>/dev/null)"
said="$(printf '%s' "$turn" | jq -r '.said // ""' 2>/dev/null)"
if [ "$asked" = "true" ] || [ "$denied" = "true" ] || [ "$handed" = "true" ]; then
    exit 0
fi

# The owner's word about stopping: the shared forms and the ones the shared pattern does not know —
# «не двигайся дальше» stopped the work for a day and matched nothing. Their standing word to work
# without stops is not a stop, whatever piece of it looks like one.
stop_re='останов|стоп|хватит|подожди|не надо|прерв|отложи|не двигайся|не продолжай|прекрати|стой([[:space:],.!]|$)|жди (моего|моей|команды|слова)|заверши (сессию|работу)|закончи (сессию|работу)|на сегодня (всё|все|хватит)'
if [ -n "$said" ] && printf '%s' "$said" | grep -qiE "$stop_re" 2>/dev/null \
    && ! printf '%s' "$said" | grep -qiE "$standing_work_re" 2>/dev/null; then
    exit 0
fi

# 5. The epic. The command prints the numbers of the unfinished tasks; an empty answer means the
# epic is over and the stop is lawful; a non-zero code means there is no epic behind this branch or
# no way to ask — nothing to judge by.
checks="$(jq -r '.layout.checks // "tools"' "$root/.claude/rt-kit.json" 2>/dev/null)"
if [ -z "$checks" ] || [ "$checks" = null ]; then
    checks=tools
fi
table="$root/$checks/epic-table.mjs"
[ -f "$table" ] || exit 0
unfinished="$(cd "$root" && node "$table" --unfinished 2>/dev/null)" || exit 0
unfinished="$(printf '%s' "$unfinished" | tr -s '[:space:]' ' ' | sed 's/^ //; s/ $//')"
[ -z "$unfinished" ] && exit 0

next_step=""
[ -n "$progress" ] && next_step="$(sed -nE 's/^[[:space:]]*[-*][[:space:]]*\*\*(Next step|Следующий шаг):\*\*[[:space:]]*(.*)/\2/p' "$progress" 2>/dev/null | head -1)"
[ -z "$next_step" ] && next_step="the next task of the epic — take it from the epic plan"

reason="BLOCKED by work-continues-guard: the epic is open — its unfinished tasks: ${unfinished} — and this turn ends without a lawful reason.

Until the epic is closed the executor does not stop on its own: the owner said so outright. A turn that ended with work is a stop all the same — the work stands where it stood. A turn ends in four ways and no others:
- a question to the owner through the question tool, when the work does not go without the answer;
- a refusal of a guard;
- the session handover written on window fill;
- the owner's word about stopping — said in this turn, or quoted in « » in the line «Waiting for the owner» of the progress.

The next step: ${next_step}

Do it in this same turn. The work of this task is done — take the next task of the epic. The owner said to stop — quote their word in the progress line, and the guard reads it."

# shellcheck disable=SC1090
[ -f "$here/deny-tail.sh" ] && . "$here/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
tail_text="$(rt_deny_tail "")"
[ -n "$tail_text" ] && reason="${reason}

${tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"work-continues-guard: the epic is open and the turn ends without a lawful reason."}\n'

exit 0
