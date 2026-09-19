#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/git-guard-delivery-tree.sh · 7d9cd99583d6 · правится надстройкой, не здесь
# The tree a command runs in, for the delivery guard: the form of a branch name is judged by the
# profile of that tree, not of the tree the session was started from.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The delivery guard
# sources it — one tier of its verdict, moved out when the guard reached its length limit.
#
# Why exactly so. A session works in a neighbouring tree by the direct word of the owner: the task
# is created there, the number and the short name are right, and the branch name is lawful by that
# tree's key. The guard used to compare it with the key of the tree the session stands in and
# refused — a refusal with no lawful move at all, and the work stopped whole: neither a branch nor a
# commit. The same refusal caught an edit of an outside file: it was enough for a neighbouring
# tree's branch name to reach the command text as a line of a document.
#
# The directory of execution is taken from the command itself — from the move into it. The directory
# did not differ from the session's tree — everything goes as before. A tree with no profile of its own is not judged at all: a foreign tree is not accountable
# to this guard, and a refusal on a lawful name has no bypass.
#
# FAIL-OPEN: no move in the command, no profile in the tree it moves to — the form is not judged.

# Where the command runs, if it says so itself — the move at the start of the call. Prints the tree
# root or stays silent.
rt_delivery_exec_dir() {
    named="$(printf '%s' "$cmd" | sed -nE 's/.*(^|[;&|[:space:]])cd[[:space:]]+([^[:space:];&|]+).*/\2/p' | head -1)"
    named="${named%\'}"; named="${named#\'}"
    named="${named%\"}"; named="${named#\"}"
    [ -z "$named" ] && return 0
    [ -d "$named" ] || return 0
    git -C "$named" rev-parse --show-toplevel 2>/dev/null
}

# Is the branch name lawful. The tree of execution answers; where it is the session's own tree, or
# says nothing of itself, the answer comes from the profile already loaded.
rt_delivery_branch_form_ok() {
    named="$1"
    other="$(rt_delivery_exec_dir)"
    if [ -n "$other" ] && [ "$other" != "$root" ]; then
        [ -f "$other/.claude/rt-kit/project.sh" ] || return 0
        (
            for profile in "$other/.claude/rt-kit/defaults/project.sh" "$other/.claude/rt-kit/project.sh"; do
                # shellcheck disable=SC1090
                [ -f "$profile" ] && . "$profile" 2>/dev/null
            done
            command -v rt_task_branch_ok >/dev/null 2>&1 || exit 0
            rt_task_branch_ok "$named"
        )
        return $?
    fi
    rt_task_branch_ok "$named"
}
