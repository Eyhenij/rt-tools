#!/usr/bin/env bash
# rt-hook: UserPromptSubmit
# rt-hook: PreToolUse .*
# Requires: checks/task-flow-script.mjs, hooks/decide.sh, hooks/hook-input.sh
#
# The guard of calls after the owner's stop. While the stop of the owner stands, a turn that a notice
# of a task, a line of `Monitor` or a message of another session opened does no work: every call in
# it is refused except the take-down of own background. A turn the owner opened by a bare stop —
# Esc, «стоп», `/stop` — is the same. A turn the owner opened by any other word carries it out.
#
# Why. On 24 November 2026 the owner pressed Esc at 03:54:34, and the lines of a `Monitor` already in
# the queue woke 14 turns over 116 seconds; the push set and the monitor started before the stop ran
# on, and nothing in those turns refused a call. The host calls this event on every prompt, a notice
# included, and could keep the turn from starting; but it shows the owner a line for each kept turn,
# so the guard lets the turn start and refuses its calls instead.
#
# How. The engine is asked by `stop-call`, and its answer is written as a mark: `refuse`, `pass` while
# the stop stands, `idle` with no stop; the place in the record, the place of the stop, the own tasks.
# A mark answers while nothing the owner said came after its place — a queued word, a queued command,
# the Esc mark, a menu answer — and a clean scan moves the place on. A notice reuses a `refuse` or
# `idle` mark; a word of the owner skips the engine when neither it nor what came after an `idle` mark
# (the tail of the record without one) holds a stop. A refusing turn gets the line of context naming
# `TaskStop <id>` for own background started before the stop, once per task and stop.
#
# FAIL-OPEN: no input, no record, no jq or node, a broken engine or one past 10 seconds — the call
# passes, and the next branches of the dispatcher judge it. The take-down calls pass always.

RT_GUARD_NAME=owner-stop-call-guard
RT_GUARD_RULE=turn-conduct

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$here/utf8.sh" 2>/dev/null || true
. "$here/hook-input.sh" 2>/dev/null || exit 0
rt_hook_read
input="$RT_HOOK_INPUT"
[ -n "$input" ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0

# A unit separator keeps an empty field in its place: a tab would be folded by `read`.
# One jq for all fields; the prompt goes last, as it may hold new lines.
fields="$(printf '%s' "$input" | jq -r '[.hook_event_name // "", .transcript_path // "", .session_id // "", .tool_name // "", .prompt // ""] | join("\u001f")' 2>/dev/null)"
IFS=$'\x1f' read -r -d '' event record sid tool prompt <<<"$fields"
[ -f "$record" ] || exit 0

# The take-down of own background passes always, before any reading.
case "$tool" in
    TaskStop | KillShell | KillBash | CronDelete | CronList | ToolSearch | TaskOutput) exit 0 ;;
esac

marks="${TMPDIR:-/tmp}/claude-stop-call"
mkdir -p "$marks" 2>/dev/null || exit 0
mark="$marks/${sid:-unknown}"
size() { wc -c <"$record" 2>/dev/null | tr -d ' '; }
# The bytes of the record from the place $1 to the place $2.
since() { [ "$2" -gt "$1" ] 2>/dev/null && tail -c +"$(($1 + 1))" "$record" 2>/dev/null | head -c "$(($2 - $1))"; }
# The lines in which the owner said something: a queued word, not a notice; a queued command; Esc; a menu answer.
SAID='/"operation":"enqueue"/ && !/"content":"(\\n)*<(task-notification|agent-message)/ || /"text":"\[Request interrupted by user|"answers":/ || /"queued_command"/ && /"kind":"human"/'
# The stems of the stop words of the description, `words.stop` and `words.stopInside`, from the start of a word.
STOP_STEMS='(^|[^[:alpha:]])(стоп|стой|хват|прекрат|останов|подожд|погод|жди|пауз|отбой|перерыв|не сейчас|на сегодня|не двига|stop|wait|pause|not now)'

engine="${RT_FLOW_ENGINE:-}"
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
# Among the checks of the package, next to the laid-out hooks, then by the tree a session names.
[ -n "$engine" ] || for candidate in "$here/../checks/task-flow-script.mjs" "$here/../../tools/task-flow-script.mjs" "$root/tools/task-flow-script.mjs"; do
    [ -f "$candidate" ] && engine="$candidate" && break
done

# Asks the engine and writes the mark; prints the answer, empty when the engine did not answer.
ask() {
    [ -f "$engine" ] && command -v node >/dev/null 2>&1 && command -v perl >/dev/null 2>&1 || return 0
    local answer at
    # A mark of an earlier turn never outlives an engine that did not answer: the next call asks again.
    rm -f "$mark"
    at="$(size)"
    answer="$(printf '%s' "$input" | perl -e 'alarm shift; exec @ARGV' "${RT_STOP_CALL_LIMIT:-10}" node "$engine" stop-call 2>/dev/null)"
    printf '%s' "$answer" | jq -e 'has("refuseCalls")' >/dev/null 2>&1 || return 0
    printf '%s' "$answer" | jq -r --arg at "$at" '"\(if .refuseCalls then "refuse" elif .stands then "pass" else "idle" end) \($at) \(.since // "-") \([.background[]?.task] | join(","))"' >"$mark" 2>/dev/null
    printf '%s' "$answer"
}

# Reads the mark into `verdict place stop tasks`; `verdict` is emptied when the owner said something after
# its place or the record is shorter than it, else the place moves on to `now`.
verdict="" place="" stop="" tasks=""
[ -f "$mark" ] && read -r verdict place stop tasks <"$mark"
was="$verdict" from="$place" now="$(size)"
if [ -z "$place" ] || ! [ "$now" -ge "$place" ] 2>/dev/null || since "$place" "$now" | LC_ALL=C awk "$SAID { said = 1; exit } END { exit !said }"; then
    verdict=""
elif [ "$now" -gt "$place" ]; then
    printf '%s %s %s %s\n' "$verdict" "$now" "$stop" "$tasks" >"$mark"
fi

if [ "$event" = UserPromptSubmit ]; then
    case "${prompt#"${prompt%%[![:space:]]*}"}" in
        '<task-notification>'* | '<agent-message'* | 'Another Claude session sent a message'* | 'Background (from the session'*)
            [ "$verdict" = refuse ] || [ "$verdict" = idle ] || { verdict=""; ask >/dev/null; read -r verdict place stop tasks <"$mark" 2>/dev/null; } ;;
        *)
            # A word of the owner with no stop stem, and no stop after an `idle` mark or in the tail.
            [ "$was" = idle ] && [ "$now" -ge "${from:-0}" ] 2>/dev/null || from=$((now > 200000 ? now - 200000 : 0))
            if ! printf '%s' "$prompt" | grep -qiE "$STOP_STEMS" &&
                ! since "$from" "$now" | LC_ALL=C awk "$SAID" | grep -qiE "\[Request interrupted by user|\"content\":\"/stop|$STOP_STEMS"; then
                printf '%s %s - \n' "$([ "$was" = idle ] && echo idle || echo pass)" "$now" >"$mark"
                exit 0
            fi
            verdict=""; ask >/dev/null
            read -r verdict place stop tasks <"$mark" 2>/dev/null ;;
    esac
    [ "$verdict" = refuse ] || exit 0
    named="$mark.named" moves=""
    for task in $(printf '%s' "$tasks" | tr ',' ' '); do
        grep -qxF "$stop $task" "$named" 2>/dev/null || { printf '%s %s\n' "$stop" "$task" >>"$named"; moves="${moves}TaskStop $task; "; }
    done
    context="The owner's stop stands: every call of this turn is refused except the take-down of own background. A turn a notice opened ends with no words."
    [ -n "$moves" ] && context="$context Take down own background started before the stop: ${moves%; }."
    jq -cn --arg c "$context" '{hookSpecificOutput:{hookEventName:"UserPromptSubmit", additionalContext:$c}}'
    exit 0
fi

[ "$event" = PreToolUse ] || exit 0
if [ -z "$verdict" ]; then
    [ -n "$(ask)" ] || exit 0
    read -r verdict place stop tasks <"$mark"
fi
[ "$verdict" = refuse ] || exit 0

moves="$(printf '%s' "$tasks" | tr ',' '\n' | sed '/^$/d; s/^/TaskStop /' | paste -sd ';' - | sed 's/;/; /g')"
# shellcheck disable=SC1091
. "$here/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 || exit 0
rt_decide owner-stop-call-guard.sh owner_stop_call '{}' "$(jq -cn --arg t "${moves:-nothing — own background is down}" '{task_stop:$t}')" PreToolUse "$input"
exit 0
