#!/usr/bin/env bash
# rt-kit v0.41.0 · hooks/rerun-guard.sh · 15f31f31941d · правится надстройкой, не здесь
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
RT_GUARD_RULE=testing

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

# The rerun call: the rerun word as a separate word next to the word for a run. The GitLab client
# retries a job instead — `glab ci retry <id>` — and reads its log by `glab ci trace <id>`; a guard
# waiting only for `run rerun` let such a retry through unread.
host_cli="${RT_HOST_CLI:-gh}"
retry_re='(^|[[:space:]])ci[[:space:]]+retry([[:space:]]|$)'
printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}(${host_cli}|glab)([[:space:]]|\$)" || exit 0
if printf '%s' "$cmd" | grep -qE "$retry_re"; then
    log_cmd="glab ci trace"
else
    printf '%s' "$cmd" | grep -qE '(^|[[:space:]])(run|workflow)([[:space:]]|$)' || exit 0
    printf '%s' "$cmd" | grep -qE '(^|[[:space:]])rerun([[:space:]]|$)' || exit 0
    log_cmd="${host_cli} run view"
fi

# The run number. Not named — the guard stays silent: there is nothing to judge.
run_id="$(printf '%s' "$cmd" | grep -oE '(^|[[:space:]])[0-9]{6,}([[:space:]]|$)' | tr -d ' ' | head -1)"
[ -z "$run_id" ] && exit 0

# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null
transcript="$(rt_fact_transcript "$input")"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# Was the log of THIS run read on the same turn. The turn is the calls after the owner's last
# remark: a log read yesterday says nothing about today's state of the run.
seen="$(jq -s -r --arg id "$run_id" '
    [.[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")
       | ((.input.command // "") | tostring)] as $used
    | (($used | join("\n")) | test("run[[:space:]]+view[^\\n]*" + $id + "|" + $id + "[^\\n]*--log|ci[[:space:]]+(trace|view)[^\\n]*" + $id)) as $read
    | if $read then "read" else "not-read" end
' "$transcript" 2>/dev/null)"

[ "$seen" = "read" ] && exit 0

# The decision and the words come from the decision table; the hook names the run and how its output
# is read.
log="${log_cmd} ${run_id}$([ "$log_cmd" = "glab ci trace" ] || printf ' --log-failed')"
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 || exit 0
rt_decide rerun-guard.sh rerun_run '{"run_log_read":"no"}' \
    "$(jq -cn --arg r "$run_id" --arg l "$log" '{run_id:$r, log:$l}')" PreToolUse "$input"
exit 0
