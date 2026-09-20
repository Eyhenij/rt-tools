#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/tree-assignment-guard.sh · 3be53fe0faeb · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh, checks/tree-assignment.mjs
# Guard of the assignment of an epic to a working copy. PreToolUse on a call that takes new work
# past the branch: creating a task under an epic and moving a card into the working column.
#
# The branch is judged by the delivery guard — there the epic of the task comes from the queue, and
# the base is judged along with it. But work is taken by three calls, not one, and the other two go
# past that guard entirely: a task created under someone else's epic and a card moved into work are
# both work taken, and both were silent.
#
# What this cost. A session found the freshest epic of the open list, decided it was its own and
# worked the whole day on it: a branch, a task folder, a plan, a written agreement — the owner
# stopped that, not a check, and said plainly they had never given that epic into work.
#
# FAIL-OPEN: no `jq`, no `node`, no reading command, an unreadable table — the call is ALLOWED. A
# guard that jams the work when a file is missing is switched off on the first day, and the price of
# a miss here is one turn of the owner's attention.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=tree-assignment-guard

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

root="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -n "$root" ] || exit 0
cd "$root" 2>/dev/null || exit 0

checks="$(jq -r '.layout.checks // "tools"' ".claude/rt-kit.json" 2>/dev/null)"
[ -n "$checks" ] && [ "$checks" != null ] || checks=tools
reader="${checks}/tree-assignment.mjs"
[ -f "$reader" ] || exit 0

# What is judged, and what the epic of the work is taken from. Creating a task names its epic in the
# call itself; a card moved into work does not name it at all, and for that the table alone answers:
# a copy with no assignment takes no work whatever epic it belongs to.
takes_work() {
    printf '%s' "$cmd" | grep -qE '(task:new|task-new\.mjs)' 2>/dev/null && return 0
    printf '%s' "$cmd" \
        | grep -qE '(task:move|board\.mjs[[:space:]]+move)([^|;&]*)in-progress' 2>/dev/null
}

# Creating an epic is not taking work: it is the owner's order written down, and the assignment for
# it is given after, by the owner, in the table.
creates_epic() {
    printf '%s' "$cmd" \
        | grep -qE '(task:new|task-new\.mjs)[^|;&]*--epic([[:space:]]|$)' 2>/dev/null
}

takes_work || exit 0
creates_epic && exit 0

epic="$(printf '%s' "$cmd" | sed -nE 's/.*--epic-of[[:space:]]+([0-9]+).*/\1/p' | head -1)"

said="$(node "$reader" --fault "$epic" 2>/dev/null)"
[ -n "$said" ] || exit 0

reason="Refused: this call takes work, and ${said}."

# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"This copy has no assignment: work is not taken by guesswork."}}\n'

exit 0
