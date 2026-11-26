#!/usr/bin/env bash
# rt-kit v0.40.0 · hooks/owner-stop-call-guard.sh · 65f33cbe3a0a · правится надстройкой, не здесь
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
# How. On `UserPromptSubmit` the engine is asked by `stop-call` — on a notice always, on a word of the
# owner only when it looks like a stop or the tail of the record holds the Esc mark or `/stop` — and
# its answer is written as a mark with the size of the record: `refuse` or `pass`. A refusing turn gets
# the line of context naming `TaskStop <id>` for own background started before the stop, once per
# task. On `PreToolUse` the mark answers while nothing the owner said came after its place: a queued
# word, a queued command, the Esc mark or a menu answer makes it stale, and the engine is asked again.
#
# FAIL-OPEN: no input, no record, no jq or node, a broken engine or one past 5 seconds — the call
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

engine="${RT_FLOW_ENGINE:-}"
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
[ -n "$engine" ] || for candidate in "$here/../checks/task-flow-script.mjs" "$root/tools/task-flow-script.mjs"; do
    [ -f "$candidate" ] && engine="$candidate" && break
done

# Asks the engine and writes the mark — the verdict, the size of the record, the own tasks; prints the
# answer, empty when the engine did not answer.
ask() {
    [ -f "$engine" ] && command -v node >/dev/null 2>&1 && command -v perl >/dev/null 2>&1 || return 0
    local answer at
    # A mark of an earlier turn never outlives an engine that did not answer: the next call asks again.
    rm -f "$mark"
    at="$(size)"
    answer="$(printf '%s' "$input" | perl -e 'alarm shift; exec @ARGV' "${RT_STOP_CALL_LIMIT:-5}" node "$engine" stop-call 2>/dev/null)"
    printf '%s' "$answer" | jq -e 'has("refuseCalls")' >/dev/null 2>&1 || return 0
    printf '%s' "$answer" | jq -r --arg at "$at" '"\(if .refuseCalls then "refuse" else "pass" end) \($at) \([.background[]?.task] | join(","))"' >"$mark" 2>/dev/null
    printf '%s' "$answer"
}

if [ "$event" = UserPromptSubmit ]; then
    wake=no
    case "$prompt" in '<task-notification>'* | 'Another Claude session sent a message'* | 'Background (from the session'*) wake=yes ;; esac
    if [ "$wake" = no ] && ! printf '%s' "$prompt" | grep -qiE '(стоп|стой|хватит|прекрати|остановись|подожди|погоди|жди|пауза|отбой|stop|wait|pause)' &&
        ! tail -c 200000 "$record" 2>/dev/null | grep -qE '\[Request interrupted by user|"content":"/stop'; then
        printf 'pass %s\n' "$(size)" >"$mark"
        exit 0
    fi
    answer="$(ask)"
    [ "$(printf '%s' "$answer" | jq -r '.refuseCalls // false' 2>/dev/null)" = true ] || exit 0
    named="$mark.named"
    tasks="$(printf '%s' "$answer" | jq -r '.background[]?.task' 2>/dev/null | while read -r task; do grep -qxF "$task" "$named" 2>/dev/null || { printf '%s\n' "$task" >>"$named"; printf 'TaskStop %s; ' "$task"; }; done)"
    context="The owner's stop stands: every call of this turn is refused except the take-down of own background. Answer with no words."
    [ -n "$tasks" ] && context="$context Take down own background started before the stop: ${tasks%; }."
    jq -cn --arg c "$context" '{hookSpecificOutput:{hookEventName:"UserPromptSubmit", additionalContext:$c}}'
    exit 0
fi

[ "$event" = PreToolUse ] || exit 0
verdict="" place="" tasks=""
[ -f "$mark" ] && read -r verdict place tasks <"$mark"
# A mark is stale when the owner said something after its place, or the record is shorter than it.
fresh="$( [ -n "$place" ] && [ "$(size)" -ge "$place" ] 2>/dev/null && tail -c +"$((place + 1))" "$record" 2>/dev/null)" || verdict=""
if printf '%s' "$fresh" | grep -qE '"operation":"enqueue".*"content":"[^<]|\[Request interrupted by user|"answers":' ||
    printf '%s' "$fresh" | grep '"queued_command"' | grep -q '"kind":"human"'; then
    verdict=""
fi
if [ -z "$verdict" ]; then
    [ -n "$(ask)" ] || exit 0
    read -r verdict place tasks <"$mark"
fi
[ "$verdict" = refuse ] || exit 0

moves="$(printf '%s' "$tasks" | tr ',' '\n' | sed '/^$/d; s/^/TaskStop /' | paste -sd ';' - | sed 's/;/; /g')"
# shellcheck disable=SC1091
. "$here/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 || exit 0
rt_decide owner-stop-call-guard.sh owner_stop_call '{}' "$(jq -cn --arg t "${moves:-nothing — own background is down}" '{task_stop:$t}')" PreToolUse "$input"
exit 0
