#!/usr/bin/env bash
# Delivery conditions about the task folder. NOT a guard: it has no `rt-hook:` declaration and it
# hooks into no agent event. The delivery guard sources it — the same way it sources the refusal
# tail and the observation record.
#
# Why a file of its own. There are two conditions about the folder, and they live at different call
# sites: one at opening the PR, the other at the merge. Together with the command parsing, the
# signature, the base and the work queue they outgrew the file length limit, and the guard cannot
# be split by event — it is one whole, and its command parsing is shared. It is split by subject
# instead: the task folder is a subject of its own, with its own bypass and its own record in the
# archive.
#
# WHAT IS HERE. Three calls, and all three are called from the delivery guard, where `deny`,
# `fault` and the profile variables are already declared: `tasks_dir`, `archive_dir`,
# `main_branch`, `folder_skip_re`, `root`. The helper has none of its own — it reads neither the
# input nor the settings.

# Is the task folder in the branch. We look at the content of the branch, not at the working tree:
# if the folder was deleted but not committed, the check would pass and the folder would travel
# into the main branch all the same. The branch name is substituted whole, slash included: for a
# branch like `chore/312-slug` the folder lies in a nested directory.
rt_folder_in_branch() {
    git ls-tree -d --name-only HEAD -- "$1" 2>/dev/null | head -1
}

# Was there a task folder in this branch at all. Asked of the branch that deleted it: otherwise the
# demand for a record in the archive would catch work that never had a folder.
rt_folder_was_in_branch() {
    _base="$1"
    _folder="$2"
    _had="$(git ls-tree -d --name-only "$_base" -- "$_folder" 2>/dev/null | head -1)"
    [ -z "$_had" ] && _had="$(git log "$_base..HEAD" --diff-filter=A --name-only --pretty=format: -- "$_folder" 2>/dev/null | head -1)"
    [ -n "$_had" ]
}

# Condition for opening the PR: the folder is taken apart, and a record from the branch has arrived
# in the archive. The refusal accumulates together with the other delivery conditions and is
# printed all at once.
#
# Taking the folder apart stands here, not at the merge. It used to be the other way round: the
# folder was held to be needed on disk for the whole review, because an edit after remarks without
# a plan is refused by the progress guard. But the owner merges as soon as he sees green, and no
# room is left for a closing commit — three times in a row the folder travelled into the main
# branch without being taken apart, and the merge guard did not see it at all: the button is
# pressed by a person on the hosting, and the guard does not reach him. After the cleanup the
# progress guard takes the plan from the history of the branch, not from disk.
rt_delivery_open_folder() {
    [ -n "$tasks_dir" ] || return 0
    printf '%s' "$cmd" | grep -qiE "$folder_skip_re" && return 0

    _folder="$tasks_dir/$branch"
    _lying="$(rt_folder_in_branch "$_folder")"
    if [ -n "$_lying" ]; then
        fault "the branch carries the task folder «${_lying}» — a request is opened after the tidying, not before it. Move to «${archive_dir:-archive}» what explains the decisions taken, delete the rest, commit it by the last commit and repeat. If the work is merged in parts, put the comment «# Task-folder-skip: <reason>» into the command."
        return 0
    fi

    [ -n "$archive_dir" ] || return 0
    _base="$(git merge-base "$main_branch" HEAD 2>/dev/null)"
    [ -z "$_base" ] && return 0
    rt_folder_was_in_branch "$_base" "$_folder" || return 0

    _gained="$(git diff --name-only --diff-filter=A "$_base" HEAD -- "$archive_dir" 2>/dev/null | head -1)"
    [ -z "$_gained" ] \
        && fault "the task folder was deleted, but the branch added nothing to «${archive_dir}». Deleting is cheaper than taking apart — and together with the folder the analysis of the request is gone, the only record of the words of the owner. Move what explains the decisions taken as one file with a telling name and repeat."
}

# Condition for leaving draft: the same subject between opening and merging. The owner reads a PR
# out of draft as an invitation to merge, and presses the button without waiting for the cleanup
# commit: the merge guard does not reach here at all — a person on the hosting presses it. Three
# pieces of work in a row travelled into the main branch exactly that way, and the body of each PR
# carried a promise to remove the folder after approval.
#
# The function asks for the branch itself: on this turn the guard has not worked it out yet.
rt_delivery_ready_folder() {
    [ -n "$tasks_dir" ] || return 0
    printf '%s' "$cmd" | grep -qiE "$folder_skip_re" && return 0

    _branch="$(git branch --show-current 2>/dev/null)"
    [ -z "$_branch" ] && return 0
    rt_task_branch_ok "$_branch" || return 0   # no folder stands behind a branch without a task

    _lying="$(rt_folder_in_branch "$tasks_dir/$_branch")"
    [ -n "$_lying" ] \
        && fault "the branch carries the task folder «${_lying}» — a lifted draft reads as «ready to merge», and merging it there is not allowed. The button is pressed by a person on the hosting, and the folder reaches main before their hand does. Move to «${archive_dir:-archive}» what explains the decisions taken, delete the rest, commit and repeat. If the work is merged in parts, put the comment «# Task-folder-skip: <reason>» into the command."
}

# Condition for the merge: the same subject as a second line. It catches a merge going by command —
# the one the guard does reach. From here we leave only by a refusal or by silence: the merge is
# decided whole.
rt_delivery_merge_folder() {
    [ -n "$tasks_dir" ] || exit 0   # the tree keeps no work by a folder

    _branch="$(git branch --show-current 2>/dev/null)"
    [ -z "$_branch" ] && exit 0
    rt_task_branch_ok "$_branch" || exit 0   # no folder stands behind a branch without a task

    _folder="$tasks_dir/$_branch"

    # First we look for the bypass in the command itself — that works without a network too. If
    # only the PR body were read, then without a network the guard would refuse a merge whose
    # reason is written in that very body.
    printf '%s' "$cmd" | grep -qiE "$folder_skip_re" && exit 0

    _number="$(printf '%s' "$cmd" | sed -nE 's/.*(pr|mr)[[:space:]]+(merge|update)[[:space:]]+([0-9]+).*/\3/p' | head -1)"
    if [ -n "$_number" ] && rt_needs rt_report_body git-guard-delivery; then
        _body="$(cd "$root" && rt_report_body "$_number" 2>/dev/null)"
        [ -n "$_body" ] && printf '%s' "$_body" | grep -qiE "$folder_skip_re" && exit 0
    fi

    _lying="$(rt_folder_in_branch "$_folder")"
    [ -n "$_lying" ] \
        && deny "BLOCKED: the task folder «${_lying}» is left in the branch — it will travel into main. There will be nobody to take it apart later: the work moves on to the next task, and this request closes. Move to «${archive_dir:-archive}» what explains the decisions taken, delete the rest and repeat. If the work is merged in parts, put the line «Task-folder-skip: <reason>» into the body of the request."

    [ -n "$archive_dir" ] || exit 0
    _base="$(git merge-base "$main_branch" HEAD 2>/dev/null)"
    [ -z "$_base" ] && exit 0
    rt_folder_was_in_branch "$_base" "$_folder" || exit 0

    _gained="$(git diff --name-only --diff-filter=A "$_base" HEAD -- "$archive_dir" 2>/dev/null | head -1)"
    [ -z "$_gained" ] \
        && deny "BLOCKED: the task folder was deleted, but the branch added nothing to «${archive_dir}». Deleting is cheaper than taking apart — and together with the folder the analysis of the request is gone, the only record of the words of the owner. Move what explains the decisions taken as one file with a telling name and repeat."

    exit 0
}
