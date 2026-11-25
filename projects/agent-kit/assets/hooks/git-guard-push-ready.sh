#!/usr/bin/env bash
# Whether a PR of the checked-out branch would open, asked before the push set starts. NOT a guard: it
# has no `rt-hook:` declaration and hooks into no agent event. The run ahead
# (`git-guard-push-ahead.sh`) sources it and calls `rt_push_ready_unmet <the base of the set>`.
#
# A PR used to learn what it lacks after the set: a missing end-to-end test, a moved branch of the
# epic, a task folder that cannot be taken apart. The fix changes the tree, and the set ran again.
#
# The epic and the rules of the tree are judged by the code the opening of a PR is judged by, not by a
# list of its own: the functions of `git-guard-delivery-epic.sh` with an `unmet` that prints, and the
# guards the tree names in `RT_PUSH_READY_HOOKS`, each called with a `gh pr create` into the base of the
# future PR; a refusal is the `deny` an agent reads. A moved main branch outside an epic repeats the
# words of the delivery guard. The folder is judged by `flow-ready.mjs`, with the measurers of the flow.
#
# What is judged depends on what lies in the head:
#   - any task branch            — the guards of the tree;
#   - its own task folder        — the folder and the base as well; once the folder is taken apart, a
#                                  fix after a review of the PR is not held by a moved base;
#   - a card with the epic label — the task folders left in the branch of the epic.
#
# Not judged: the body and the title of the PR — before the set there is none, and the set is not run
# again for them; the rerun of the steps; a conflicting PR of one's own — the set is what its fix goes
# through.
#
# FAIL-OPEN: no branch, no number in its name, no profile functions, a silent hosting, no engine — the
# condition is not judged, and the opening of the PR judges it.
#
# Requires: hooks/facts.sh, hooks/git-guard-delivery-epic.sh, checks/flow-ready.mjs

# The base of the future PR by the base of the set: a task of an epic goes into the branch below it in
# a chain, and into the branch of the epic otherwise. The base of the set answers with the main branch
# where the epic moved by a plain commit, and a PR into it would be judged by the whole epic.
#   rt_push_ready_base <name of the base of the set> <branch of the epic, or empty>
rt_push_ready_base() {
    if [ -n "$2" ] && [ "$1" = "$main_branch" ]; then
        printf '%s' "$2"
    else
        printf '%s' "$1"
    fi
}

# The reason a guard refuses the opening of a PR with, or nothing.
#   rt_push_ready_ask <file of the guard> <root> <base of the PR>
rt_push_ready_ask() {
    jq -cn --arg c "gh pr create --base $3" --arg d "$2" \
        '{session_id:"push-ready", tool_name:"Bash", tool_input:{command:$c}, cwd:$d}' \
        | CLAUDE_PROJECT_DIR="$2" bash "$1" 2>/dev/null \
        | jq -r --arg h "${1##*/}" 'select(.hookSpecificOutput.permissionDecision == "deny")
            | [(.hookSpecificOutput.permissionDecisionReason // "") | split("\n")[] | select(test("\\S"))][0]
            // ($h + " refuses the opening of the PR")' 2>/dev/null
}

# Every unmet condition of the future PR, a line each. A subshell: the names it declares — `unmet`, the
# profile variables of the delivery guard — are not those of the caller.
#   rt_push_ready_unmet <the base of the set, as `rt_push_base` names it>
rt_push_ready_unmet() (
    command -v jq >/dev/null 2>&1 || exit 0
    root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
    rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    # What a hook around the run was given is not the input of the guards asked here.
    # shellcheck disable=SC2086
    unset ${!RT_HOOK_@}
    # shellcheck disable=SC1091
    command -v rt_fact_branch >/dev/null 2>&1 || . "$rt_hooks_dir/facts.sh" 2>/dev/null
    branch="$(rt_fact_branch 2>/dev/null)"
    [ -n "$branch" ] || exit 0
    command -v rt_task_branch_ok >/dev/null 2>&1 && rt_task_branch_ok "$branch" || exit 0
    command -v rt_task_branch_number >/dev/null 2>&1 || exit 0
    number="$(rt_task_branch_number "$branch")"
    [ -n "$number" ] || exit 0

    # The names the functions of the delivery guard read.
    main_branch="${RT_MAIN_BRANCH:-main}"
    tasks_dir="${RT_TASKS_DIR:-docs/tasks}"
    epic_label="${RT_BOARD_EPIC_LABEL:-}"
    # The words of a refusal end with a mark the decider fills; there is no decider here.
    unmet() { printf '%s\n' "${3%\{first\}}"; }
    unmet_class() { :; }
    fact() { :; }
    # shellcheck disable=SC1091
    . "$rt_hooks_dir/git-guard-delivery-epic.sh" 2>/dev/null

    state=''
    command -v rt_task_state >/dev/null 2>&1 && state="$(cd "$root" && rt_task_state "$number" 2>/dev/null)"
    # A card the hosting does not know is no answer about its epic: it is read as silence.
    printf '%s' "$state" | jq -e '.exists == true' >/dev/null 2>&1 || state=''
    epic="$(printf '%s' "$state" | jq -r '.epic // empty' 2>/dev/null)"
    epic_branch=''
    [ -n "$epic" ] && command -v rt_epic_branch >/dev/null 2>&1 && epic_branch="$(rt_epic_branch "$epic")"
    case "$epic_branch" in *' '*) epic_branch='' ;; esac
    base="$(rt_push_ready_base "${1#origin/}" "$epic_branch")"

    if [ -n "$(git ls-tree -d --name-only HEAD -- "$tasks_dir/$branch" 2>/dev/null)" ]; then
        for engine in "$rt_hooks_dir/../checks/flow-ready.mjs" "$root/tools/flow-ready.mjs"; do
            [ -f "$engine" ] || continue
            said="$(cd "$root" && node "$engine" 2>/dev/null)"
            case $? in
                0) ;;
                1)
                    if [ -n "$said" ]; then
                        printf '%s\n' "$said"
                    else
                        printf 'push ahead: the task folder is not judged: %s ended with no answer\n' "${engine##*/}" >&2
                    fi
                    ;;
                *) printf 'push ahead: %s\n' "${said:-the task folder is not judged}" >&2 ;;
            esac
            break
        done
        if [ -n "$epic" ]; then
            command -v rt_epic_pull_base >/dev/null 2>&1 && rt_epic_pull_base "$epic" "gh pr create --base $base"
        elif [ -n "$state" ] && git rev-parse --verify --quiet "refs/remotes/origin/$main_branch" >/dev/null 2>&1 \
            && ! git merge-base --is-ancestor "origin/$main_branch" HEAD 2>/dev/null; then
            behind="$(git rev-list --count "HEAD..origin/$main_branch" 2>/dev/null)"
            # The words of the delivery guard, letter by letter: a scenario compares the two.
            unmet branch_has_main_tip no "«${main_branch}» has moved ahead by ${behind:-several} commits and is not merged into the branch. A PR from a diverged branch shows the reviewer the edit mixed with someone else, and the checks on it run from a stale base. Merge it in and repeat: git fetch origin && git merge origin/${main_branch} — by the block of the pattern git-workflow-merge, which keeps conflict markers out of the guards; the resolving of the conflict is there too."
        fi
    fi

    command -v rt_epic_own_pull >/dev/null 2>&1 && rt_epic_own_pull "$state"

    for hook in ${RT_PUSH_READY_HOOKS:-}; do
        [ -f "$rt_hooks_dir/$hook" ] && rt_push_ready_ask "$rt_hooks_dir/$hook" "$root" "$base"
    done
    exit 0
)
