#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/epic-stop-guard.sh · 166209ca5f8b · правится надстройкой, не здесь
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

root="$(git rev-parse --show-toplevel 2>/dev/null)"
checks="$(jq -r '.layout.checks // "tools"' "$root/.claude/rt-kit.json" 2>/dev/null)"
if [ -z "$checks" ] || [ "$checks" = null ]; then
    checks=tools
fi

reason="Refused: the epic is over — every task of it is merged or handed over by a request, and this call takes new work. The end of an epic is a stop: print the table by «npm run epic:table» (or «node $checks/epic-table.mjs»), tell the owner what was done on each task and what confirms it, and say outright that the session waits for their orders. New work is taken by their word, not by the count of what is left."

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
