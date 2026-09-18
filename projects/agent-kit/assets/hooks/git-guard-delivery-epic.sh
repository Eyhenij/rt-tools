#!/usr/bin/env bash
# Delivery conditions about the epic of a task. NOT a guard: it has no `rt-hook:` declaration and
# it hooks into no agent event. The delivery guard sources it — the same way it sources the task
# folder conditions and the signature.
#
# Why a file of its own. The subject is one — the epic a task hangs on — and it shows at two call
# sites: the base of a new branch and the base of the request. Together with the command parsing,
# the signature, the folder and the work queue it would take the guard past the file length limit,
# and the guard cannot be split by event: it is one whole, and its command parsing is shared.
#
# WHAT IS HERE. Two calls, both called from the delivery guard, where `fault`, `main_branch` and
# the profile calls are already declared. The helper reads neither the input nor the settings.
#
# The assignment of an epic to this working copy is read next to this: it judges the same subject
# one step earlier — whether this copy leads the epic at all — so its helper is sourced here. The
# guard calls it in the branch block before the base: a fresh base does not cure a branch of
# someone else's epic, and a refusal about the base would send the executor to fix what is in order.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/git-guard-tree-assignment.sh" ] && . "$rt_hooks_dir/git-guard-tree-assignment.sh" 2>/dev/null

# The branch of an epic by its number: the same form as a task branch — the profile pulls the
# number out of a name, and the epic branch is the one whose number is the epic's.
#
# The branch is looked for among the remote refs, not the local ones: a branch that exists only on
# somebody's machine is a base nobody else has, and the branches of the tasks are taken from it.
# Several matched — none is chosen: two branches of one epic is a discrepancy of its own, and a
# guess here would name a base at random.
rt_epic_branch() {
    _epic="$1"
    _found=''
    for _ref in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin 2>/dev/null); do
        _name="${_ref#origin/}"
        [ "$(rt_task_branch_number "$_name" 2>/dev/null)" = "$_epic" ] || continue
        _found="${_found}${_found:+ }${_name}"
    done
    printf '%s' "$_found"
}

# The base of a new task branch against the branch of its epic.
#
# The task branch is taken from the branch of the epic, and a branch taken from the main one leaves
# the epic half merged before its last task is done: the merge of the epic then carries nothing of
# that task. The guard used to judge the base against the main branch alone and let this through in
# silence.
#
# The freshness of the main branch is not dropped, it is moved: it is asked of the branch of the
# epic, and there it is fixed by one merge — while asked of the base of the task branch it made the
# executor either wait for the epic branch to catch up or take the base from the main one, that is,
# do exactly what this condition forbids.
#
# Arguments: the number of the epic, the ref the branch grows from, the name of the new branch.
rt_epic_base() {
    _epic="$1"
    _base_ref="$2"
    _branch="$3"
    [ -n "$_epic" ] || return 0

    _epic_branch="$(rt_epic_branch "$_epic")"
    case "$_epic_branch" in
        '')
            fault "the task belongs to the epic #${_epic}, and no branch of that epic is in the remote. The branch of the epic is taken before the first of its tasks and sent at once — a branch that exists only on one machine is a base nobody else has."
            return 0
            ;;
        *' '*)
            fault "the epic #${_epic} has more than one branch in the remote — ${_epic_branch}. There is no telling which of them the task branches from; leave one."
            return 0
            ;;
    esac

    git rev-parse --verify --quiet "origin/${_epic_branch}" >/dev/null 2>&1 || return 0

    if ! git merge-base --is-ancestor "origin/${_epic_branch}" "$_base_ref" 2>/dev/null; then
        fault "the branch will grow from a base that does not carry the branch of the epic «${_epic_branch}». A task branched from the main one leaves its epic half merged before the epic itself is handed in. Take the base from the epic: git fetch origin && git checkout -b ${_branch} origin/${_epic_branch}."
        return 0
    fi

    # The main branch is asked of the epic, not of the base: there it is fixed by one merge, and the
    # branches of all its tasks get it at once.
    if git rev-parse --verify --quiet "origin/${main_branch}" >/dev/null 2>&1 \
        && ! git merge-base --is-ancestor "origin/${main_branch}" "origin/${_epic_branch}" 2>/dev/null; then
        _behind="$(git rev-list --count "origin/${_epic_branch}..origin/${main_branch}" 2>/dev/null)"
        fault "the branch of the epic «${_epic_branch}» does not carry the tip of «${main_branch}» — it has moved ahead by ${_behind:-several} commits. The main branch is merged into the branch of the epic, not bypassed by taking the base from the main one: git checkout ${_epic_branch}, git merge origin/${main_branch}, and send the branch."
    fi

    return 0
}

# The base of a request about a task of an epic.
#
# A request of a task goes into the branch of its epic, and one opened into the main branch takes
# the task past the epic: the epic is then handed in without it, and the reviewer sees the edit
# next to everything that lies in the main branch and not in the epic. The guard let any base
# through and asked only that the main branch be merged in.
#
# The freshness asked here is of the epic, not of the main branch: the request goes into the epic,
# and it is the divergence with the epic that shows in the diff. The main branch reaches the task
# through the epic — that is the same order as at the creation of the branch.
#
# Arguments: the number of the epic and the text of the command.
rt_epic_pull_base() {
    _epic="$1"
    _cmd="$2"
    [ -n "$_epic" ] || return 0

    _epic_branch="$(rt_epic_branch "$_epic")"
    case "$_epic_branch" in
        '' | *' '*) return 0 ;;
    esac

    # The base named by the command. Absent — the hosting takes the default branch of the
    # repository, that is the main one: the very case this condition is about.
    _base=''
    if command -v perl >/dev/null 2>&1; then
        _base="$(printf '%s' "$_cmd" | perl -0ne '
            if (/(?:^|\s)(?:--base|-B)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(\S+))/s) {
                print defined $1 ? $1 : (defined $2 ? $2 : $3);
            }
        ' 2>/dev/null)"
    fi

    if [ "$_base" != "$_epic_branch" ]; then
        fault "the request of a task of the epic #${_epic} goes into the branch of the epic «${_epic_branch}», and the base here is ${_base:-the default branch of the repository}. A request into the main branch takes the task past its epic: the epic is handed in without it. Name the base: --base ${_epic_branch}."
        return 0
    fi

    if git rev-parse --verify --quiet "origin/${_epic_branch}" >/dev/null 2>&1 \
        && ! git merge-base --is-ancestor "origin/${_epic_branch}" HEAD 2>/dev/null; then
        _behind="$(git rev-list --count "HEAD..origin/${_epic_branch}" 2>/dev/null)"
        fault "the branch of the epic «${_epic_branch}» has moved ahead by ${_behind:-several} commits and is not merged into this branch. The reviewer would see the edit mixed with someone else's: git fetch origin && git merge origin/${_epic_branch}."
    fi

    return 0
}

# The request of an epic itself: it goes into the main branch, and it opens only when the folders
# of all its tasks are taken apart.
#
# The folder guard reads the folder of one task — by the name of the branch — and the branch of an
# epic has none of its own: every folder lying there belongs to a task of the epic whose work is
# not closed. Merged into the main branch, such an epic carries the folders of unfinished tasks
# there, and the reader of the main branch has no way to tell them from current work.
#
# The epic is recognised by the label of its card, not by the shape of the branch name: the branch
# of an epic and the branch of a task are named alike, and the label is the only thing that tells
# them apart. The tree has not named the label — the condition is not judged at all.
#
# Arguments: the state of the card of the current branch, as the work queue answered it.
rt_epic_own_pull() {
    _state="$1"
    [ -n "$epic_label" ] || return 0
    [ -n "$_state" ] || return 0
    [ -n "$tasks_dir" ] || return 0

    printf '%s' "$_state" | jq -e --arg l "$epic_label" '(.labels // []) | index($l)' >/dev/null 2>&1 || return 0

    _folders="$(git ls-tree -d --name-only HEAD -- "$tasks_dir" 2>/dev/null)"
    [ -n "$_folders" ] || return 0

    # What lies in the tasks directory of the branch, one level down: the sample and the index of
    # the directory are not folders of tasks and do not hold the request.
    _left=''
    for _entry in $(git ls-tree -d --name-only "HEAD:${tasks_dir}" 2>/dev/null); do
        case "$_entry" in
            _template | _draft-*) continue ;;
        esac
        _left="${_left}${_left:+, }${_entry}"
    done
    [ -n "$_left" ] || return 0

    fault "the branch of the epic still carries the folders of its tasks — ${_left}. The request of an epic opens when the last of its folders is taken apart: merged as it is, the epic takes the folders of unfinished work into the main branch, and the reader has no way to tell them from current work."

    return 0
}

