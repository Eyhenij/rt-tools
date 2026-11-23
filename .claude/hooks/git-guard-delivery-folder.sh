#!/usr/bin/env bash
# rt-kit v0.39.0 · hooks/git-guard-delivery-folder.sh · 2fd33ef9850b · правится надстройкой, не здесь
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
    git ls-tree -d --name-only "${2:-HEAD}" -- "$1" 2>/dev/null | head -1
}

# Was there a task folder in this branch at all. Asked of the branch that deleted it: otherwise the
# demand for a record in the archive would catch work that never had a folder.
rt_folder_was_in_branch() {
    _base="$1"
    _folder="$2"
    _had="$(git ls-tree -d --name-only "$_base" -- "$_folder" 2>/dev/null | head -1)"
    [ -z "$_had" ] && _had="$(git log "$_base..${3:-HEAD}" --diff-filter=A --name-only --pretty=format: -- "$_folder" 2>/dev/null | head -1)"
    [ -n "$_had" ]
}

# The branch and the tree the folder is judged by: sets `_branch` and `_tree`. A command that names
# a PR is judged by that PR's head: the lower PR of a stack is lifted from the upper branch, and the
# checked-out branch carries a folder the named PR does not have. The tree of the head is read from
# the remote ref. Without a head, or without its ref, the checked-out branch is judged, as before.
rt_delivery_folder_target() {
    _branch="$(rt_fact_branch)"
    _tree=HEAD
    [ -n "$1" ] && [ "$1" != "$_branch" ] || return 0
    git rev-parse --verify --quiet "refs/remotes/origin/$1" >/dev/null 2>&1 || return 0
    _branch="$1"
    _tree="refs/remotes/origin/$1"
}

# A sentence for a refusal whose fix is a commit in the branch the folder lies in. Two things refuse
# that commit next: a copy standing on another branch commits elsewhere — on the main one it is
# refused outright — and a contribution under a foreign signature refuses every commit until it is
# rewritten, and the neighbouring guards may want their own move first — the document pair, the
# exam. Each is named before the commit. Argument: the branch the folder lies in.
rt_folder_commit_where() {
    # The words go to `_where`, and the facts of that commit to the table: where the copy stands and
    # whether the contribution carries a foreign signature. What the neighbouring guards want before
    # the commit — the document pair, the exam — the decider names from their rows.
    _where=''
    _here="$(rt_fact_branch)"
    if [ -n "$1" ] && [ "$1" != "$_here" ]; then
        [ "$_here" = "$main_branch" ] && fact branch_is_main yes
        _where="$(printf ' The folder lies in the branch «%s», and the copy stands on «%s»: switch to it first — git checkout %s — and commit there.' "$1" "${_here:-a detached head}" "$1")"
        return 0
    fi
    command -v rt_signature_commit_note >/dev/null 2>&1 && _where="$(rt_signature_commit_note)"
    [ -n "$_where" ] && fact commits_signed_declared no
    # No foreign signature: the word of the neighbours the commit meets goes here, the decider puts it.
    [ -n "$_where" ] || _where='{first}'
    return 0
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
        rt_folder_commit_where "$branch" && unmet task_folder_in_branch yes "the branch carries the task folder «${_lying}» — a request is opened after the tidying, not before it. Move to «${archive_dir:-archive}» what explains the decisions taken, delete the rest, commit it by the last commit and repeat. If the work is merged in parts, put the comment «# Task-folder-skip: <reason>» into the command.${_where}"
        return 0
    fi

    _base="$(git merge-base "$main_branch" HEAD 2>/dev/null)"
    [ -z "$_base" ] && return 0

    # SC-AK-1249: a draft a plan of the branch named, still lying in the branch, would reach main
    # unmerged. SC-AK-1296: a request into an epic or into a lower branch does not reach main, and
    # the draft of an epic lives until its last task. The request of the epic is judged by the plans
    # of all its tasks.
    _into="$(rt_delivery_open_base)"
    if [ "${_into:-$main_branch}" = "$main_branch" ]; then
        while IFS= read -r _plan; do
            [ -n "$_plan" ] || continue
            _draft="$(rt_branch_plan_draft "${_plan%/plan.md}" "$_base")"
            [ -n "$_draft" ] && [ -n "$(git ls-tree -d --name-only HEAD -- "${_draft%/}" 2>/dev/null)" ] \
                && unmet draft_spec_merged no "the branch carries the unmerged agreement «${_draft}» its plan named — merge its rules and scenarios into the domain spec, remove the directory by a commit and repeat. If the work is merged in parts, put the comment «# Task-folder-skip: <reason>» into the command."
        done <<EOF
$(git log --format= --name-only "$_base..HEAD" -- "$tasks_dir/*/plan.md" 2>/dev/null | sort -u)
EOF
    fi

    [ -n "$archive_dir" ] || return 0
    rt_folder_was_in_branch "$_base" "$_folder" || return 0

    _gained="$(git diff --name-only --diff-filter=A "$_base" HEAD -- "$archive_dir" 2>/dev/null | head -1)"
    [ -z "$_gained" ] \
        && rt_folder_commit_where "$branch" && unmet archive_gained no "the task folder was deleted, but the branch added nothing to «${archive_dir}». Deleting is cheaper than taking apart — and together with the folder the analysis of the request is gone, the only record of the words of the owner. Move what explains the decisions taken as one file with a telling name, commit it and repeat.${_where}"
}

# The base the opening command names. Absent — the host takes the default branch: an empty answer.
rt_delivery_open_base() {
    command -v perl >/dev/null 2>&1 || return 0
    printf '%s' "$cmd" | perl -0ne '
        if (/(?:^|\s)(?:--base|-B)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(\S+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null
}

# The draft agreement the plan of the branch named by the line `**Draft:** \`path\``. The plan is
# read from the history: by the time the PR opens the folder is taken apart, and the last commit
# touching the plan is the one that removed it — then its parent still holds the plan.
rt_branch_plan_draft() {
    _commit="$(git log -1 --format=%H "$2..HEAD" -- "$1/plan.md" 2>/dev/null)"
    [ -n "$_commit" ] || return 0
    { git show "$_commit:$1/plan.md" 2>/dev/null || git show "$_commit^:$1/plan.md" 2>/dev/null; } \
        | sed -nE 's/^\*\*Draft:\*\*[[:space:]]*`([^`]+)`.*/\1/p' | head -1
}

# Condition for leaving draft: the same subject between opening and merging. The owner reads a PR
# out of draft as an invitation to merge, and presses the button without waiting for the cleanup
# commit: the merge guard does not reach here at all — a person on the hosting presses it. Three
# pieces of work in a row travelled into the main branch exactly that way, and the body of each PR
# carried a promise to remove the folder after approval.
#
# The function asks for the branch itself: on this turn the guard has not worked it out yet. The
# argument is the head branch of the named PR, empty when the PR state did not answer.
rt_delivery_ready_folder() {
    [ -n "$tasks_dir" ] || return 0
    printf '%s' "$cmd" | grep -qiE "$folder_skip_re" && return 0

    rt_delivery_folder_target "$1"
    [ -z "$_branch" ] && return 0
    rt_task_branch_ok "$_branch" || return 0   # no folder stands behind a branch without a task

    _lying="$(rt_folder_in_branch "$tasks_dir/$_branch" "$_tree")"
    [ -n "$_lying" ] \
        && rt_folder_commit_where "$_branch" && unmet task_folder_in_branch yes "the branch carries the task folder «${_lying}» — a lifted draft reads as «ready to merge», and merging it there is not allowed. The button is pressed by a person on the hosting, and the folder reaches main before their hand does. Move to «${archive_dir:-archive}» what explains the decisions taken, delete the rest, commit and repeat. If the work is merged in parts, put the comment «# Task-folder-skip: <reason>» into the command.${_where}"
}

# Condition for the merge: the same subject as a second line. It catches a merge going by command —
# the one the guard does reach. From here we leave only by a refusal or by silence: the merge is
# decided whole.
rt_delivery_merge_folder() {
    [ -n "$tasks_dir" ] || exit 0   # the tree keeps no work by a folder

    # First we look for the bypass in the command itself — that works without a network too. If
    # only the PR body were read, then without a network the guard would refuse a merge whose
    # reason is written in that very body.
    printf '%s' "$cmd" | grep -qiE "$folder_skip_re" && exit 0

    _number="$(printf '%s' "$cmd" | sed -nE 's/.*(pr|mr)[[:space:]]+(merge|update)[[:space:]]+([0-9]+).*/\3/p' | head -1)"
    _head=''
    if [ -n "$_number" ] && rt_needs rt_pull_state git-guard-delivery; then
        _head="$(cd "$root" && rt_pull_state "$_number" 2>/dev/null | jq -r '.branch // empty' 2>/dev/null)"
    fi
    rt_delivery_folder_target "$_head"
    [ -z "$_branch" ] && exit 0
    rt_task_branch_ok "$_branch" || exit 0   # no folder stands behind a branch without a task

    _folder="$tasks_dir/$_branch"

    if [ -n "$_number" ] && rt_needs rt_report_body git-guard-delivery; then
        _body="$(cd "$root" && rt_report_body "$_number" 2>/dev/null)"
        [ -n "$_body" ] && printf '%s' "$_body" | grep -qiE "$folder_skip_re" && exit 0
    fi

    _lying="$(rt_folder_in_branch "$_folder" "$_tree")"
    [ -n "$_lying" ] \
        && rt_folder_commit_where "$_branch" && fact task_folder_in_branch yes \
        && refuse pr_merge "$(jq -cn --arg l "$_lying" --arg a "${archive_dir:-archive}" --arg w "${_where%\{first\}}" '{lying:$l, archive_dir:$a, where:$w}')"

    [ -n "$archive_dir" ] || exit 0
    _base="$(git merge-base "$main_branch" "$_tree" 2>/dev/null)"
    [ -z "$_base" ] && exit 0
    rt_folder_was_in_branch "$_base" "$_folder" "$_tree" || exit 0

    _gained="$(git diff --name-only --diff-filter=A "$_base" "$_tree" -- "$archive_dir" 2>/dev/null | head -1)"
    [ -z "$_gained" ] \
        && rt_folder_commit_where "$_branch" && fact archive_gained no \
        && refuse pr_merge "$(jq -cn --arg a "$archive_dir" --arg w "${_where%\{first\}}" '{archive_dir:$a, where:$w}')"

    exit 0
}
