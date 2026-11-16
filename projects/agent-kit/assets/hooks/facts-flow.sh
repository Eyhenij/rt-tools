#!/usr/bin/env bash
# The facts of the course of work for one edit. NOT a guard: it has no `rt-hook:` declaration and is
# not attached to any agent event. The work-conduct guards source it after `rt_task_flow_context`,
# and so does a guard whose refusal names an edit of another file: it asks these facts of that edit
# instead of running the work-conduct guards on it.
#
#   rt_fact_flow       {"facts":{…},"params":{…}} — the branch, the plan, the progress, the state
#                      and whether the task folder is in the history; empty when the edit is not
#                      judged: a merge conflict being resolved, or a folder already taken apart
#   rt_fact_agreement  {"facts":{…},"params":{…}} — whether the plan names the product agreement
#                      and whether it exists; empty when there is no plan
#   rt_fact_flow_of <tool> <tool input> <hook input>
#                      both of the above for a move another guard names, merged; empty when the
#                      work-conduct guards do not judge that move
#
# Both read the variables `rt_task_flow_context` sets. FAIL-OPEN: no jq, no git → empty answer, and
# the caller judges nothing.

# shellcheck disable=SC1091
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/profile-check.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

# Resolving a merge conflict is the merge itself, not an edit of the product. Main is merged into
# the epic branch while the work runs, and that branch carries no task folder by the rule. So a call
# passes while a merge stands and every code path it writes is still unmerged.
rt_flow_merge_conflict_only() {
    local seen=0 candidate
    git -C "$RT_TF_ROOT" rev-parse -q --verify MERGE_HEAD >/dev/null 2>&1 || return 1
    while IFS= read -r candidate; do
        [ -z "$candidate" ] && continue
        case "$candidate" in
            /*) ;;
            *) candidate="${rt_tf_askdir:-${CLAUDE_PROJECT_DIR:-.}}/$candidate" ;;
        esac
        rt_is_app_code "$candidate" || rt_tf_laid_out "$candidate" || continue
        [ -n "$(git -C "$RT_TF_ROOT" ls-files -u -- "$candidate" 2>/dev/null | head -1)" ] || return 1
        seen=1
    done <<EOF
${RT_TF_CANDIDATES:-$RT_TF_PATH}
EOF
    [ "$seen" = 1 ]
}

# The folder is gone from HEAD but stood at the base or was added by a commit of the branch: the
# work is handed in, and the plan is taken from the history.
rt_flow_folder_archived() {
    local base had
    [ -n "$(git -C "$RT_TF_ROOT" ls-tree -d --name-only HEAD -- "$RT_TF_TASKS_DIR/$RT_TF_BRANCH" 2>/dev/null | head -1)" ] && return 1
    base="$(git -C "$RT_TF_ROOT" merge-base "$RT_TF_MAIN_BRANCH" HEAD 2>/dev/null)"
    [ -z "$base" ] && return 1
    had="$(git -C "$RT_TF_ROOT" ls-tree -d --name-only "$base" -- "$RT_TF_TASKS_DIR/$RT_TF_BRANCH" 2>/dev/null | head -1)"
    [ -z "$had" ] && had="$(git -C "$RT_TF_ROOT" log "$base..HEAD" --diff-filter=A --name-only --pretty=format: -- "$RT_TF_TASKS_DIR/$RT_TF_BRANCH" 2>/dev/null | head -1)"
    [ -n "$had" ]
}

# The task folder travels into the branch by a commit, it does not live in one working copy: a folder
# never committed passes every check of the disk, while the sign of handed-over work is taken from the
# history. No git history — the folder counts as committed: there is nothing to ask it with.
rt_flow_in_tree() {
    [ -n "$(git -C "$RT_TF_ROOT" rev-parse --verify HEAD 2>/dev/null)" ] || return 0
    [ -n "$(git -C "$RT_TF_ROOT" ls-tree -d --name-only HEAD -- "$RT_TF_TASKS_DIR/$RT_TF_BRANCH" 2>/dev/null | head -1)" ]
}

# The mandatory action of a state in which code is not edited.
rt_flow_state_action() {
    case "$1" in
        просьба-не-разобрана) printf '%s' 'exploration over the tree, then questions to the owner' ;;
        разбор-закрыт) printf '%s' 'a product agreement or a named reason there is none' ;;
        договорённость-записана) printf '%s' 'create the task, the branch and the task folder' ;;
        задача-взята) printf '%s' 'write the plan' ;;
        замысел-записан) printf '%s' 'do the first stage' ;;
        папка-разобрана) printf '%s' 'the work queue audit, then open the PR' ;;
        влито) printf '%s' 'mark the task merged in the epic plan by the next task branch' ;;
        *) printf '%s' '' ;;
    esac
}

rt_fact_flow() {
    local progress state kind folder="yes"
    command -v jq >/dev/null 2>&1 || return 0
    rt_flow_merge_conflict_only && return 0
    if rt_needs rt_task_branch_ok task-flow-guard && ! rt_task_branch_ok "$RT_TF_BRANCH"; then
        printf '%s' '{"facts":{"branch":"other"},"params":{}}'
        return 0
    fi
    rt_flow_folder_archived && return 0
    if [ ! -f "$RT_TF_PLAN" ]; then
        printf '%s' '{"facts":{"branch":"task","plan":"no"},"params":{}}'
        return 0
    fi
    progress="$RT_TF_DIR/progress.md"
    if [ ! -f "$progress" ]; then
        printf '%s' '{"facts":{"branch":"task","plan":"yes","progress":"no"},"params":{}}'
        return 0
    fi
    state="$(sed -nE 's/^[[:space:]]*[-*][[:space:]]*\*\*(State|Состояние):\*\*[[:space:]]*`([^`]*)`.*/\2/p' "$progress" 2>/dev/null | head -1)"
    case "$state" in
        '') kind=none ;;
        # States in which the code is edited. The last three are not about the first session: a run
        # happens to be red and a review comes with remarks, and the fix goes into the same branch.
        этап-идёт | этапы-кончились | работа-отдана | разбор-кончился) kind=code ;;
        просьба-не-разобрана | разбор-закрыт | договорённость-записана | задача-взята | замысел-записан | папка-разобрана | влито) kind=other ;;
        *) kind=unknown ;;
    esac
    [ "$kind" = code ] && ! rt_flow_in_tree && folder=no
    jq -cn --arg k "$kind" --arg f "$folder" --arg s "$state" --arg a "$(rt_flow_state_action "$state")" \
        '{facts:({branch:"task", plan:"yes", progress:"yes", state:$k} + (if $k == "code" then {folder_committed:$f} else {} end)), params:{state:$s, state_action:$a}}'
}

rt_fact_agreement() {
    local draft draft_path domain_dir feature file
    command -v jq >/dev/null 2>&1 || return 0
    [ -f "$RT_TF_PLAN" ] || return 0
    if grep -qE '^\*\*(Behaviour|Поведение):\*\*[[:space:]]*(unchanged|не меняется)[[:space:]]*—[[:space:]]*\S' "$RT_TF_PLAN" 2>/dev/null; then
        printf '%s' '{"facts":{"agreement":"waived"},"params":{}}'
        return 0
    fi
    draft="$(sed -nE 's/^\*\*(Draft|Драфт):\*\*[[:space:]]*`([^`]*)`.*/\2/p' "$RT_TF_PLAN" 2>/dev/null | head -1)"
    [ -z "$draft" ] && draft="$(sed -nE 's/^\*\*(Spec|Спек):\*\*[[:space:]]*`([^`]*)`.*/\2/p' "$RT_TF_PLAN" 2>/dev/null | head -1)"
    if [ -z "$draft" ]; then
        printf '%s' '{"facts":{"agreement":"unnamed"},"params":{}}'
        return 0
    fi
    case "$draft" in
        /*) draft_path="$draft" ;;
        *) draft_path="$RT_TF_ROOT/$draft" ;;
    esac
    # On disk, in the history of the branch, or merged into the domain spec: a merged agreement does
    # not lock the branch.
    if [ -e "$draft_path" ] || git -C "$RT_TF_ROOT" log --oneline -1 -- "$draft" 2>/dev/null | grep -q .; then
        printf '%s' '{"facts":{"agreement":"exists"},"params":{}}'
        return 0
    fi
    case "$draft" in
        */proposed/*)
            domain_dir="${draft%%/proposed/*}"
            feature="${draft##*/proposed/}"
            feature="${feature%/}"
            if [ -n "$feature" ] && [ -d "$RT_TF_ROOT/$domain_dir" ] \
                && grep -rq -- "$feature" "$RT_TF_ROOT/$domain_dir" 2>/dev/null; then
                printf '%s' '{"facts":{"agreement":"exists"},"params":{}}'
                return 0
            fi
            ;;
    esac
    case "$draft_path" in
        */) file="${draft_path}spec.md" ;;
        *.md) file="$draft_path" ;;
        *) file="$draft_path/spec.md" ;;
    esac
    jq -cn --arg d "$draft" --arg f "$file" '{facts:{agreement:"missing"}, params:{draft:$d, agreement_file:$f}}'
}

# The facts of the course of work for a move another guard names. The parse runs in a subshell over
# the input of that move: the variables of the calling guard stay as they were.
rt_fact_flow_of() {
    (
        unset RT_HOOK_CMD RT_HOOK_CWD RT_HOOK_FILE RT_HOOK_PARSED RT_HOOK_TOOL
        RT_HOOK_INPUT="$(jq -cn --arg t "$1" --argjson i "$2" --argjson h "$3" '{tool_name:$t, tool_input:$i, cwd:($h.cwd // null), session_id:($h.session_id // null)}' 2>/dev/null)"
        export RT_HOOK_INPUT
        _rt_here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        # shellcheck disable=SC1091
        . "$_rt_here/task-flow-context.sh" 2>/dev/null || exit 0
        rt_task_flow_context </dev/null || exit 0
        _rt_flow="$(rt_fact_flow)"
        [ -n "$_rt_flow" ] || exit 0
        _rt_agreement="$(rt_fact_agreement)"
        [ -n "$_rt_agreement" ] || _rt_agreement='{"facts":{},"params":{}}'
        jq -cn --argjson f "$_rt_flow" --argjson a "$_rt_agreement" \
            '{facts:($f.facts + (if $f.facts.state == "code" and $f.facts.folder_committed == "yes" then $a.facts else {} end)), params:($f.params + $a.params)}'
    )
}
