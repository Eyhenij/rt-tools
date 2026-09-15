#!/usr/bin/env bash
# rt-kit v0.28.0 · hooks/rerun-guard.sh · 5f1d1fbbfd49 · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh
# Guard of the rerun: a fallen run is not rerun until its log has been read.
#
# Red on a run comes in two kinds, and from the side of the list they look the same: a refusal of
# the hosting at the preparation step — the runner did not download the action, an answer of `429`
# — and a defect of the branch itself. The first is cured by a rerun, the second is not cured by a
# rerun at all: the same branch falls in the same place, and the circle repeats until someone opens
# the log. Three runs of one day were rerun one after another exactly that way.
#
# The guard judges the ORDER, not the reason for the fall: the log before the rerun. What is written
# in the log it does not read and cannot read — red on its merits is judged by a person.
#
# The sign of reading is a call on the same turn that shows the log of this run: the run number in
# the command is the same as in the rerun. The number is compared, because a read log of a
# neighbouring run says nothing about ours, and in the list of runs they stand next to each other.
#
# FAIL-OPEN: no `jq`, no turn record, no run number named in the command, the call does not look
# like a rerun — pass. Without a number the guard does not undertake to judge: a rerun of the last
# fallen run is called without one too, and guessing which run is meant would mean refusing blindly.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=rerun-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"
case "$tool" in
    # The environment terminal and the universal executor put the command into the same field.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0

# The tree profile: first the package default, and over it the project override, if there is one.
# The name of the hosting client is named by the tree itself: each kind has its own, and a guessed
# one matches nothing.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# The rerun call: the rerun word as a separate word next to the word for a run.
host_cli="${RT_HOST_CLI:-gh}"
printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}${host_cli}([[:space:]]|\$)" || exit 0
printf '%s' "$cmd" | grep -qE '(^|[[:space:]])(run|workflow)([[:space:]]|$)' || exit 0
printf '%s' "$cmd" | grep -qE '(^|[[:space:]])rerun([[:space:]]|$)' || exit 0

# The run number. Not named — the guard stays silent: there is nothing to judge.
run_id="$(printf '%s' "$cmd" | grep -oE '(^|[[:space:]])[0-9]{6,}([[:space:]]|$)' | tr -d ' ' | head -1)"
[ -z "$run_id" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# Was the log of THIS run read on the same turn. The turn is the calls after the owner's last
# remark: a log read yesterday says nothing about today's state of the run.
seen="$(jq -s -r --arg id "$run_id" '
    [.[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")
       | ((.input.command // "") | tostring)] as $used
    | (($used | join("\n")) | test("run[[:space:]]+view[^\\n]*" + $id + "|" + $id + "[^\\n]*--log")) as $read
    | if $read then "read" else "not-read" end
' "$transcript" 2>/dev/null)"

[ "$seen" = "read" ] && exit 0

reason="BLOCKED by rerun-guard: a rerun of the run ${run_id} without its output read. Red on a run comes in two kinds, and in the list they look the same: a hosting refusal on the preparation step is cured by a rerun, a defect of the branch is not cured by it at all, and the circle repeats until the output is opened. Read the output of this run — ${host_cli} run view ${run_id} --log-failed — and repeat the call. The guard judges the order, not the cause of the fall: what is written in the output you judge yourself."

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the refusal reason stays as it is.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"rerun-guard: the output of the run was not read in this turn."}}\n'
exit 0
