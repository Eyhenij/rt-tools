#!/usr/bin/env bash
# rt-kit v0.37.0 · hooks/epic-stop-guard.sh · eaea22d4bcf4 · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh, hooks/epic-over.sh, checks/epic-table.github.mjs
# Guard of the stop at the end of an epic. PreToolUse on a call that takes new work.
#
# An epic used to end with the session taking the next piece of work. The owner learned that the
# epic was over from an ordinary report, mixed in with everything else, and had nowhere to give an
# order about its outcome: by the time they read it, the branch for the next work was already
# created. The rule of the turn carried a line about this, and it was held the same way the line
# about the table of tasks was held before the command — by memory, that is, sometimes.
#
# The guard stands on the call, not on the end of the turn: a turn ends with text, and a guard that
# took to reading text would refuse by mood. Taking work is a call — a task, a branch by a number, a
# column.
#
# The state of the epic is asked by the same command that prints the table for the owner. A reader
# of its own would diverge from the printed table in silence: it would refuse work the table itself
# calls unfinished.
#
# FAIL-OPEN: no `jq`, no `node`, no command, an epic that cannot be asked, any error of its own —
# the call is ALLOWED. A guard that jams the work when the network is gone is switched off on the
# first day, and the price of a miss here is one turn of the owner's attention.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=epic-stop-guard
RT_GUARD_RULE=turn-conduct

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0
command -v node >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0

# The universal executor of the environment passes the real command as a nested string: it is the
# one to judge, not the wrapper.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

# The order of the owner travels in the call itself: the guard sees the call and does not see the
# conversation. An empty reason is not a bypass — the line then says nothing about who allowed it.
if printf '%s' "$cmd" | grep -qE 'Epic-stop-skip:[[:space:]]*[^[:space:]]' 2>/dev/null; then
    exit 0
fi

# What counts as taking new work: a branch by a task number, a created task, a column moved to the
# working one. Everything else — a commit, a push, reading the history — is not judged: the epic is
# closed by exactly these three, and a wider net would refuse the work of finishing it.
takes_work=no
if printf '%s' "$cmd" | grep -qE '(checkout|switch)[[:space:]]+(-[A-Za-z]+[[:space:]]+)*-(b|c)[[:space:]]+[A-Za-z]+-[0-9]+-' 2>/dev/null; then
    takes_work=yes
fi
if printf '%s' "$cmd" | grep -qE 'task:new|task-new\.mjs' 2>/dev/null; then
    takes_work=yes
fi
if printf '%s' "$cmd" | grep -qE '(task:move|board\.mjs[[:space:]]+move)([^|;&]*)in-progress' 2>/dev/null; then
    takes_work=yes
fi
[ "$takes_work" = yes ] || exit 0

# The reading of the end of an epic is shared with the two guards that judge the stop itself: written
# apart, the three readings would diverge and refuse each other's lawful moves. A non-zero answer
# means a task in work, no epic behind the branch or no way to ask — there is nothing to judge by,
# and the work goes on.
# shellcheck disable=SC1090
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/epic-over.sh" 2>/dev/null || exit 0
command -v rt_epic_over >/dev/null 2>&1 || exit 0
rt_epic_over || exit 0

# The word of the owner about this very work releases the call: their message or their answer to a
# menu that names the number the call takes. The line in the call was the only form before, and an
# owner who forbade writing it left the executor one way out — stopping the work they had just set.
# The number is read from the call; the words of the executor do not count.
taken="$(printf '%s' "$cmd" | sed -nE 's/.*(checkout|switch)[[:space:]]+(-[A-Za-z]+[[:space:]]+)*-(b|c)[[:space:]]+[A-Za-z]+-([0-9]+)-.*/\4/p; s/.*(task:move|board\.mjs[[:space:]]+move)[^0-9|;&]*([0-9]+).*/\2/p; s/.*--epic-of[[:space:]=]+([0-9]+).*/\1/p' | head -1)"
transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"

# The words of the owner are looked for among what the owner side wrote, not among the last lines
# of the record. A window of lines is spent by the work itself: every command adds two, and a
# «yes» given an hour of work ago fell out of it while the executor was fixing what refused it.
# Results of commands are dropped before the count, the answers to menus stay.
owner_side() {
    awk '/"type":"user"/ && (!/"tool_result"/ || /The user answered:|Your questions have been answered:/)' "$1" 2>/dev/null \
        | tail -n 400
}
if [ -n "$taken" ] && [ -n "$transcript" ] && [ -f "$transcript" ]; then
    # A menu answer comes in two forms, «The user answered:» and «Your questions have been answered:»,
    # followed by "question"="answer" pairs. Only the answers count: the question is written by the
    # executor, and a number in «take RT-N?» answered «no» is not the owner's word.
    named="$(owner_side "$transcript" | jq -s -r --arg n "$taken" '
        def menu_answers: if test("^(The user answered|Your questions have been answered):")
            then ([match("\"=\"([^\"]*)\""; "g") | .captures[0].string] | join("\n")) else "" end;
        [.[] | select(.type == "user")
            | select(((.isMeta // false) or (.isCompactSummary // false)) | not)
            | (.message.content // "")
            | if type == "string" then .
              elif type == "array" then (map(
                  if .type == "text" then (.text // "")
                  elif .type == "tool_result" then ((.content
                      | if type == "string" then . elif type == "array"
                        then (map(if type == "object" then (.text // "") else "" end) | join(" ")) else "" end)
                      | menu_answers)
                  else "" end) | join("\n"))
              else "" end]
        | map(test("(^|[^0-9])" + $n + "([^0-9]|$)")) | any
    ' 2>/dev/null)"
    [ "$named" = "true" ] && exit 0
fi

# A created task has no number yet, so no menu answer can name it, and the owner's answer to «create
# a task for these findings?» left the call refused. The word of the owner here is their latest
# answer to a menu: the answer agrees to a task — a word of a task, of creating it, or a plain
# «yes» — and it is not a refusal. Any answer was too wide: «not now» and an answer about a button
# colour passed alike. A new epic needs the word of an epic.
#
# The number after `--epic-of` names the epic, not the work taken: said by the owner, it releases
# the call above, and its absence from their answer refuses nothing here. Read as the number of the
# work, it left two answers «yes» in a row refused, and the owner was asked a third time.
#
# What stands after the answer is judged by who wrote it. A notice of a background command and the
# mark of an interrupted turn are written by no person and cancel nothing. A message of the owner
# cancels their answer only when it refuses — «stop», «wait», «no»: their other words after a «yes»
# are not a second decision.
if [ -n "$transcript" ] && [ -f "$transcript" ] \
    && printf '%s' "$cmd" | grep -qE 'task:new|task-new\.mjs' 2>/dev/null; then
    consent='задач|карточ|task|issue|заве|завод|созда|create|^\s*(да|yes|ок|ok)([^[:alpha:]]|$)'
    if printf '%s' "$cmd" | grep -qE -- '--epic([[:space:]=]|$)' 2>/dev/null; then
        consent='эпик|epic'
    fi
    refusal='^\s*(нет|не\s|нельзя|no\b|стоп|stop|отмен|cancel|подожд|wait|позже|later|пока ничего|ничего|nothing)'
    latest="$(owner_side "$transcript" | jq -s -r --arg consent "$consent" --arg refusal "$refusal" '
        [.[] | select(.type == "user")
            | select(((.isMeta // false) or (.isCompactSummary // false)) | not)
            | select((.origin.kind // "human") == "human")
            | (.message.content // "")
            | if type == "string" then {said: .}
              elif type == "array" then (map(
                  if .type == "text" then {said: (.text // "")}
                  elif .type == "tool_result" then ((.content
                      | if type == "string" then . elif type == "array"
                        then (map(if type == "object" then (.text // "") else "" end) | join(" ")) else "" end)
                      | if test("^(The user answered|Your questions have been answered):")
                        then {menu: ([match("\"=\"([^\"]*)\""; "g") | .captures[0].string] | first // "")}
                        else empty end)
                  else empty end) | .[])
              else empty end
            | select(((.said // "") | test("^\\s*\\[Request interrupted")) | not)]
        | (map(has("menu")) | rindex(true)) as $at
        | if $at == null then "no"
          else (.[$at].menu) as $menu
              | (.[$at + 1:] | map((.said // "") | test($refusal; "i")) | any) as $taken_back
              | if ($menu | test($consent; "i")) and (($menu | test($refusal; "i")) | not) and ($taken_back | not)
                then "yes" else "no" end
          end
    ' 2>/dev/null)"
    [ "$latest" = "yes" ] && exit 0
fi

root="$(git rev-parse --show-toplevel 2>/dev/null)"
checks="$(jq -r '.layout.checks // "tools"' "$root/.claude/rt-kit.json" 2>/dev/null)"
if [ -z "$checks" ] || [ "$checks" = null ]; then
    checks=tools
fi

reason="Refused: the epic is over — every task of it is merged or handed over by a request, and this call takes new work. The end of an epic is a stop: print the table by «npm run epic:table» (or «node $checks/epic-table.mjs»), tell the owner what was done on each task and what confirms it, and say outright that the session waits for their orders. New work is taken by their word, not by the count of what is left: their message or their answer to a menu that names the number of this work releases the call; a task being created has no number yet, and it is released by the latest answer of the owner to a menu when that answer agrees to a task and is not a refusal. A new epic the owner has declared needs the bypass line in the calls that create its card, its tasks and its branch; once the branch of the new epic is taken, the guard reads that epic and stops refusing."

# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "the line «Epic-stop-skip: <the word of the owner>» in the call itself; an empty reason is not accepted")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"The epic is over: the end of an epic is a stop, not the next task."}}\n'

exit 0
