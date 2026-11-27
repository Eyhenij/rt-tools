#!/usr/bin/env bash
# rt-kit v0.42.0 · hooks/monitor-stream-guard.sh · 802a3341e5f5 · правится надстройкой, не здесь
# rt-hook: PreToolUse Monitor
# Requires: checks/task-flow-script.mjs, checks/flow-monitor.mjs, hooks/decide.sh, hooks/hook-input.sh
#
# The guard of monitors over own background. A `Monitor` that prints a line on every step of a live own
# background task — `tail -f` of its output, or a loop that prints on every round over a file the task
# writes — is refused: the end of that task comes as a notice anyway, and every line wakes the turn.
#
# Why. On 24 November 2026 the executor started `tail -n 0 -f` over the output of the background push
# set and filtered it by `grep --line-buffered`. Its lines stood in the queue, and after the owner
# pressed Esc at 03:54:34 they woke 14 turns over 116 seconds. The notice of the end of the set would
# have come by itself. A wait that prints one line after its loop, a poll of a pull request and a timer
# follow no own background command and pass.
#
# How. A cheap filter first, with no node: a command with neither `tail` with a follow flag nor a loop
# with a print word passes. The rest asks the engine by `monitor-call`, which reads the record of the
# session and answers the task and the file; the refusal comes from the decision table.
#
# FAIL-OPEN: no input, no record, no jq or node, a broken engine or one past 10 seconds — the call
# passes, and the next branches of the dispatcher judge it.

RT_GUARD_NAME=monitor-stream-guard
RT_GUARD_RULE=turn-conduct

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$here/utf8.sh" 2>/dev/null || true
. "$here/hook-input.sh" 2>/dev/null || exit 0
rt_hook_read
input="$RT_HOOK_INPUT"
[ -n "$input" ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0

fields="$(printf '%s' "$input" | jq -r '[.tool_name // "", .transcript_path // ""] | join("\u001f")' 2>/dev/null)"
IFS=$'\x1f' read -r -d '' tool record <<<"$fields"
record="${record%$'\n'}"
[ "$tool" = Monitor ] || exit 0
[ -f "$record" ] || exit 0

# The cheap filter: a follow flag of `tail`, or a loop next to a word that prints.
command="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null)"
printf '%s' "$command" | grep -qE '(^|[^[:alnum:]_-])tail([[:space:]]+[^|;&]*)?[[:space:]](-[[:alnum:]]*[fF][[:alnum:]]*|--follow)([[:space:]=]|$)' ||
    { printf '%s' "$command" | grep -qE '(^|[^[:alnum:]_])(while|until|for)[[:space:]]' &&
        printf '%s' "$command" | grep -qE '(^|[^[:alnum:]_])(echo|printf|cat|head|tail|awk|sed|grep|egrep|cut|jq|sort|uniq|comm|tr|wc|column|diff|ls|stat|date|du|rg|nl)[[:space:]]'; } ||
    exit 0

engine="${RT_FLOW_ENGINE:-}"
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
[ -n "$engine" ] || for candidate in "$here/../checks/task-flow-script.mjs" "$here/../../tools/task-flow-script.mjs" "$root/tools/task-flow-script.mjs"; do
    [ -f "$candidate" ] && engine="$candidate" && break
done
[ -f "$engine" ] && command -v node >/dev/null 2>&1 && command -v perl >/dev/null 2>&1 || exit 0

answer="$(printf '%s' "$input" | perl -e 'alarm shift; exec @ARGV' "${RT_MONITOR_CALL_LIMIT:-10}" node "$engine" monitor-call 2>/dev/null)"
printf '%s' "$answer" | jq -e '.refuse == true' >/dev/null 2>&1 || exit 0

# shellcheck disable=SC1091
. "$here/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 || exit 0
rt_decide monitor-stream-guard.sh monitor_stream '{}' "$(printf '%s' "$answer" | jq -c '{task: .task, file: .file}')" PreToolUse "$input"
exit 0
