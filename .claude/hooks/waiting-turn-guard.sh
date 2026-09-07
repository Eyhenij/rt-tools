#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/waiting-turn-guard.sh · fbe0815367e0 · правится надстройкой, не здесь
# rt-hook: Stop
# Requires: hooks/deny-tail.sh
# Waiting guard: a turn that tells the owner about someone else's step does not end until it holds
# at least one action on the next task. Stop.
#
# Why this way. The article "waiting for a run is not what work is spent on" is held by the
# executor's memory, and held badly: the sample message to the owner ends with a phrase about the
# next task, and the phrase is carried out as a promise — the session says it and ends the turn. A
# turn in which nothing was done gives itself away by nothing: no file edit, no command — and the
# miss is seen only by the owner, only by the work not moving, and only when they ask directly.
#
# Someone else's step is known by two signs, and both are taken from the turn, not from the
# network. The first is a PR opened: the work is handed in, and from there the owner moves it. The
# second is a red run read: it has to be fixed, but a turn that read it and did nothing is the same
# emptiness. Reading the run is not a sign by itself: the end of a run is also read to go and fix
# it; the sign is a red answer, and it lies in the command output — in the same turn record.
#
# Asking the hosting would be more precise, but a network call at the end of a turn fails together
# with the connection and would refuse the work instead of the miss.
#
# What counts as an action: creating a task, creating a branch, moving the task to the work column,
# creating the task folder. Moving to the review column and removing the folder are not in it —
# those are steps of closing the previous work, not the start of the next. The set is open and
# grows by edits — its completeness is an open question, not a promise.
#
# What the guard does not judge. A turn that says nothing about someone else's step — here it stays
# silent: an empty turn cannot be told from a turn that had nothing to do. This is its known
# boundary. A green run it does not judge either: after it comes work of one's own — cleanup and
# lifting the draft — not someone else's step.
#
# FAIL-OPEN: on any error, missing `jq`, missing turn record or a repeated call on the same turn
# the turn is ALLOWED (exit 0). A broken guard has no right to jam the conversation.

# Its own name in observations: the refusal is written by the shared deny tail, not by the guard.
RT_GUARD_NAME=waiting-turn-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# A repeated call on the same turn is not judged: the guard said its word once and lets go.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# Opening a PR differs per hosting, and the guard moves between them whole: the set names all
# three forms, not the one this tree uses. Editing the PR body is not in it — it opens nothing.
opened_re='gh[^|;&]*pr[[:space:]]+create|api[^|;&]*-X[[:space:]]+POST[^|;&]*/pulls|glab[^|;&]*mr[[:space:]]+create|az[[:space:]]+repos[[:space:]]+pr[[:space:]]+create'

# Reading a run is the second case of someone else's step. By itself it means nothing: the end of
# a run is also read to go and fix it. The sign is a red answer, and it lies not in the command
# but in its output — in the same turn record, and no network is needed for that.
read_re='run[[:space:]]+(list|view|watch)|pipelines[[:space:]]+runs'
red_re='completed[[:space:]]+failure|"conclusion"[[:space:]]*:[[:space:]]*"failure"|conclusion:[[:space:]]*failure|completed with .failure.|run[[:space:]]+failed'

# The first action on the next task. Listed is what taking a task CAN BE, not what counts as an
# action: the list of work-closing steps is open and grows, while the list of actions on the next
# task is closed — a list of "what it can be" has no hole for a closing step.
#
# Moving the closed task to the review column and removing its folder are left out on purpose:
# both are mandatory steps of closing work, and both stand in the same turn that opened the PR.
# While the sign listed them alongside taking a task, it always matched, and the guard let through
# the very turn it was made for — work stopped three times in one session that way.
#
# A code edit in the branch of the same PR does not count as an action on the next task — it fixes
# the previous one and does not move the work on.
taken_re='task:new|checkout([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-b|task:move[^|;&]*in-progress|(cp|mkdir)[^|;&]*/tasks/'

# The task folder is also created without the shell: the file-editing tool writes its first file,
# and no command line stands behind that. So next to the commands the edit path is judged — with a
# pattern of its own, since no command name is in it.
taken_path_re='/tasks/'

# How the turn shows it carried the handed-in work to the end rather than leaving it a draft.
# Lifting the draft is the obvious case; reading the run is the one where there is nothing to lift
# yet, but the executor looked instead of saying "waiting". Two ready PRs stood as drafts precisely
# because the next task was taken instead of this, not on top of it.
ready_re='pr[[:space:]]+ready|run[[:space:]]+(list|view|watch)|pr[[:space:]]+checks|check-runs|check:board|board\.mjs'

# One's own named action. An empty turn that declared what it will do next gives itself away by
# nothing: it opened no PR, read no run, and both earlier signs are silent. It is caught by form —
# a set of future-tense patterns about one's own step — not by understanding the meaning; and no
# call may stand behind the words, otherwise the declaration was said along the work, not instead
# of it.
vow_re='дальше беру|дальше возьму|дальше иду|следующим шагом|следующий шаг:|затем сделаю|затем возьму|потом сделаю|после этого сделаю|далее беру'

# The turn is everything recorded after the owner's last real input. A tool result arrives under
# the same role, so lines with `tool_result` do not count as input.
#
# A 400-line tail: the turn record grows all session, and only the last turn is judged.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r \
    --arg opened "$opened_re" --arg taken "$taken_re" --arg taken_path "$taken_path_re" \
    --arg read "$read_re" --arg red "$red_re" --arg ready "$ready_re" --arg vow "$vow_re" '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")] as $uses
    | ($uses | map((.input.command // "")) | join("\n")) as $ran
    # The edit path is the second way to create a task folder. Only the writing tools are judged:
    # reading has the same path and is not work.
    | ($uses | map(select(.name == "Write" or .name == "Edit" or .name == "MultiEdit")
          | (.input.file_path // "")) | join("\n")) as $wrote
    # The tool result is taken as text, not as the JSON record: there a tab and a quote leave
    # escaped, and the pattern misses them entirely. It arrives both as a string and as a list of
    # blocks — both forms are brought to one text.
    | ([$turn[] | select(.type == "user") | .message.content // [] | select(type == "array") | .[]
          | select(.type == "tool_result") | .content
          | if type == "string" then .
            elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
            else tostring end] | join("\n")) as $out
    | ($ran | test($opened; "i")) as $opened_pr
    | (($ran | test($read; "i")) and ($out | test($red; "i"))) as $red_run
    | (($ran | test($taken; "i")) or ($wrote | test($taken_path; "i"))) as $went_on
    | ($ran | test($ready; "i")) as $checked
    | ([$turn[] | select(.type == "assistant") | (.message.content // [])[]
          | select(.type == "text") | .text] | join("\n")) as $said
    | ($said | test($vow; "i")) as $announced
    | ($uses | length) as $tools
    | if $opened_pr and ($went_on | not) and ($checked | not) then "owe:both"
      elif $opened_pr and ($went_on | not) then "owe:pr"
      elif $opened_pr and ($checked | not) then "owe:draft"
      elif $went_on then "pass"
      elif $red_run then "owe:run"
      elif $announced and $tools == 0 then "owe:vow"
      else "pass" end
' 2>/dev/null)"

# Neither of the two actions: the refusal names both at once. Before, it named only the first and
# was lifted by the first too — the executor took the next task, the open-PR sign left with the
# turn, and the second demand evaporated without ever sounding.
if [ "$verdict" = "owe:both" ]; then
    reason="BLOCKED by waiting-turn-guard: a PR was opened in this turn, and neither of the two actions was done about the handed-over work — its state was not asked, and the next task was not taken.

There are exactly two actions, and one of them does not lift the refusal: what was handed over is brought to a lifted draft by the one who handed it over, and the next task is taken on top of that, not instead. A taken next task carries the sign of the open request away with it — the second requirement will never sound after it.

    gh run list                                # состояние отданного
    npm run task:new -- <заголовок>            # следующая работа

The guard judges one turn: the next session is not refused."

    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    deny_tail_text="$(rt_deny_tail "")"
    [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

    jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"waiting-turn-guard: neither of the two actions was done about the handed-over work."}\n'
    exit 0
fi

# A turn that declared its next action and did nothing on it. The refusal names the declaration
# itself: an executor told "the turn is empty" will rewrite the words rather than take the step.
if [ "$verdict" = "owe:vow" ]; then
    reason="BLOCKED by waiting-turn-guard: not a single edit was made in the turn and not a single command was called, while the next action is named in words — «дальше беру», «следующим шагом», «затем сделаю».

An announcement of your own step is never work: it is more precise than any promise, and the emptiness behind it is visible to nobody. Do what is named in this same turn — or tell the owner what stops the work, and name exactly what.

The guard judges one turn: the next session is not refused."

    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    deny_tail_text="$(rt_deny_tail "")"
    [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

    jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"waiting-turn-guard: the next action is named in words, and nothing was done in the turn."}\n'
    exit 0
fi

# A draft left while the next task is taken is a separate refusal: there the demand is not about
# the next task but about carrying the handed-in one to the end.
if [ "$verdict" = "owe:draft" ]; then
    reason="BLOCKED by waiting-turn-guard: a PR was opened in this turn, the next task is taken, and the state of the handed-over work was asked by no command.

A draft is read by the owner as «the work is not finished»: its merge button is locked by the hosting itself, and in the list of requests the ready cannot be told from the unfinished — grey in both. Bringing what was handed over to a lifted draft is owed by the one who handed it over.

Ask the run on the tip in this same turn — `gh run list`, `gh pr checks` or the audit of the work queue — and lift the draft when it is green and the branch merges. The run is still going — then say so to the owner, naming its output.

The next task is taken on top of that, not instead: both ready requests stood as drafts on exactly this substitution.

The guard judges one turn: the next session is not refused."

    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    deny_tail_text="$(rt_deny_tail "")"
    [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

    jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"waiting-turn-guard: the handed-over work stayed a draft — ask the run and lift the draft."}\n'
    exit 0
fi

case "$verdict" in
    owe:pr) said="a PR was opened in this turn" ;;
    owe:run) said="a red run was read in this turn" ;;
    *) exit 0 ;;
esac

reason="BLOCKED by waiting-turn-guard: ${said}, and there is not a single action about the next task in it. Waiting for someone else's step is not what a session is spent on: the run, the review and the merge go on elsewhere and do not get faster from being watched.

Saying «беру следующую задачу» is not the same as taking it: the phrase lives to the end of the turn while the work does not move, and only the owner can notice that.

The first action about the next task is done in this same turn — creating the task, the branch or the folder:

    npm run task:new -- --title '<Что не так>' --slug <slug>
    git checkout -b <КЛЮЧ>-<номер>-<slug>

The end of a run is learned from the return of a background command, not from a look at the page.

The guard judges one turn: the next session is not refused."

# The shared deny tail: two lawful moves. The file may not be laid out — then there is no tail,
# and the reason for the refusal stays as it was.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"waiting-turn-guard: a PR is open — the next task is taken in the same turn."}\n'

exit 0
