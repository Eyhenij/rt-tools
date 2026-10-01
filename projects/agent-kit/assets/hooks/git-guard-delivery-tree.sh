#!/usr/bin/env bash
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
# The task itself is asked of the same tree. A branch created in another repository carries the
# number of a task of that repository; asked of the session's work queue, the number pointed to a
# task that does not exist or to a foreign one. A second copy of the same repository is not another
# tree: the shared `.git` directory is one, so the work queue and the profile are one too.
#
# FAIL-OPEN: no move in the command, no profile in the tree it moves to — neither the form nor the
# task is judged.

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

# The root of the tree of execution when it is another repository, or silence. Another repository
# is told by its shared `.git` directory, not by its root: a second copy of the same repository has
# a root of its own and the same work queue.
rt_delivery_foreign_root() {
    other="$(rt_delivery_exec_dir)"
    [ -n "$other" ] || return 0
    mine="$(git -C "$root" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
    theirs="$(git -C "$other" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
    [ -n "$theirs" ] && [ "$mine" != "$theirs" ] && printf '%s' "$other"
    return 0
}

# Runs one profile function in the tree of execution, with that tree's profile loaded over the
# package default. A tree with no profile of its own, or a profile without the function, answers
# with success and no output: a foreign tree is not accountable to this guard.
rt_delivery_in_tree() {
    tree="$1"; shift
    [ -f "$tree/.claude/rt-kit/project.sh" ] || return 0
    (
        cd "$tree" 2>/dev/null || exit 0
        # The session profile is loaded in this shell already: without the reset its function
        # would answer for a foreign tree that never declared one.
        unset -f "$1" 2>/dev/null
        for profile in "$tree/.claude/rt-kit/defaults/project.sh" "$tree/.claude/rt-kit/project.sh"; do
            # shellcheck disable=SC1090
            [ -f "$profile" ] && . "$profile" 2>/dev/null
        done
        command -v "$1" >/dev/null 2>&1 || exit 0
        "$@"
    )
}

# Is the branch name lawful. The tree of execution answers; where it is the session's own
# repository, or says nothing of itself, the answer comes from the profile already loaded.
rt_delivery_branch_form_ok() {
    other="$(rt_delivery_foreign_root)"
    if [ -n "$other" ]; then
        rt_delivery_in_tree "$other" rt_task_branch_ok "$1"
        return $?
    fi
    rt_task_branch_ok "$1"
}

# The state of the task, from the work queue of the tree of execution. The session's own repository
# answers by the profile already loaded, from the session root — as before.
rt_delivery_task_state() {
    other="$(rt_delivery_foreign_root)"
    if [ -n "$other" ]; then
        rt_delivery_in_tree "$other" rt_task_state "$1"
        return $?
    fi
    command -v rt_task_state >/dev/null 2>&1 || return 0
    (cd "$root" && rt_task_state "$1")
}

# The branch the command works on: of the tree of execution when it is another repository.
rt_delivery_current_branch() {
    other="$(rt_delivery_foreign_root)"
    git -C "${other:-.}" branch --show-current 2>/dev/null
}
