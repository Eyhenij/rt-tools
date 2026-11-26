#!/usr/bin/env bash
# rt-kit v0.41.0 · hooks/epic-stop-guard.sh · a138197ec7ab · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/observe.sh, hooks/epic-over.sh, checks/epic-table.github.mjs
# Guard of the stop at the end of an epic. PreToolUse on a call that takes new work.
#
# An epic used to end with the session taking the next piece of work. The owner learned that the
# epic was over from an ordinary report, mixed in with everything else, and had nowhere to give an
# order about its outcome: by the time they read it, the branch for the next work was already
# created.
#
# The guard stands on the call, not on the end of the turn: a turn ends with text, and a guard that
# took to reading text would refuse by mood. Taking work is a call — a created task or a branch by a
# task number.
#
# The decision is the owner's, and the guard asks them for it: the answer is `ask`, and the host
# shows the owner a window to allow or forbid this very command. The guard reads no record of the
# conversation. It once looked for the owner's consent there by words, and both misses came of it:
# a real «yes» given in other words was not found, and the owner was asked the same thing three
# times; an unrelated «yes» was taken for consent. Where nobody can answer the window — a subagent,
# a run without a person — the host hands the reason to the model, and the call does not go.
#
# A column moved to the working one is not judged: it follows the branch of the same work, and a
# window on it would ask the owner a second time about the decision they have just given.
#
# The state of the epic is asked by the same command that prints the table for the owner. A reader
# of its own would diverge from the printed table in silence: it would ask about work the table
# itself calls unfinished.
#
# FAIL-OPEN: no `jq`, no `node`, no command, an epic that cannot be asked, any error of its own —
# the call is ALLOWED. A guard that jams the work when the network is gone is switched off on the
# first day, and the price of a miss here is one turn of the owner's attention.

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

# What counts as taking new work: a created task or a branch by a task number, and only where the
# command itself is run. The body of a heredoc is a text for another program, and an argument of a
# reader is a file name: a script that edits this very guard and a `sed` over the creating command
# named the command and took no work, and both were refused on 13.11.2026. The command is cut into
# its pieces by the shell separators; a piece is judged by its head, after the assignments of
# variables and the options of git.
heads() {
    printf '%s\n' "$1" | perl -e '
        my $text = do { local $/; <STDIN> };
        $text =~ s/<<-?\s*([\x27"]?)(\w+)\1[^\n]*\n.*?\n\s*\2[ \t]*(?:\n|$)/\n/sg;
        for my $piece (split /&&|\|\||[;|\n]/, $text) {
            $piece =~ s/^\s+//;
            $piece =~ s/^(?:\w+=(?:\x27[^\x27]*\x27|"[^"]*"|\S*)\s+)+//;
            print "$piece\n" if length $piece;
        }
    ' 2>/dev/null
}
takes_work=no
while IFS= read -r piece; do
    if printf '%s' "$piece" | grep -qE '^git([[:space:]]+-[cC][[:space:]]+[^[:space:]]+)*[[:space:]]+(checkout|switch)[[:space:]]+(-[A-Za-z]+[[:space:]]+)*-(b|c)[[:space:]]+[A-Za-z]+-[0-9]+-'; then
        takes_work=yes
    fi
    if printf '%s' "$piece" | grep -qE '^(npm|pnpm|yarn)[[:space:]]+(run[[:space:]]+)?(-s[[:space:]]+)?task:new([[:space:]]|$)|^node[[:space:]]+[^[:space:]]*task-new(\.github)?\.mjs'; then
        takes_work=yes
    fi
done <<EOF
$(heads "$cmd")
EOF
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

# The window is counted apart from the refusals: an unanswered window in a run without a person is
# a refusal by its effect, and a count of refusals alone would not see it.
# shellcheck disable=SC1090
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/observe.sh" 2>/dev/null || true
command -v rt_note >/dev/null 2>&1 && rt_note guard-ask guard="$RT_GUARD_NAME" sid="$(printf '%s' "$input" | jq -r '.session_id // empty' 2>/dev/null)"

# The decision and the words come from the decision table; the class of the call is found by the
# decider from the call itself, and a run of the task script it does not know is taking a task.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 || exit 0
rt_decide epic-stop-guard.sh "?task_new" '{"epic_over":"yes"}' "$(jq -cn --arg c "$checks" '{checks:$c}')" PreToolUse "$input"
exit 0
