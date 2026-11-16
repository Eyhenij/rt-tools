#!/usr/bin/env bash
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: checks/decide.mjs, hooks/decide.sh, hooks/facts.sh, hooks/task-flow-context.sh, hooks/profile-check.sh, hooks/deny-tail.sh
# PreToolUse guard for Edit|Write|MultiEdit: code is not written before the plan.
#
# Work runs over many sessions, and between them the executor remembers nothing. The plan lying on
# disk is the only thing that survives the break: by that moment the changes may be uncommitted, the
# PR not open, and the work queue shows the task as started and says nothing about what is done
# inside it.
#
# The guard demands three things and exactly those: a task folder named after the branch, a plan in
# it and a work state declared in the progress — one of those in which code is edited. It does not
# judge how complete the writing is — that is for the owner (the decisions are in the law
# `docs/constitution/work-conduct.md`).
#
# The product agreement has a guard of its own — `task-flow-draft-guard`, declared on the same
# events. They are kept apart so that a tree can drop one requirement and keep the second: while
# both travelled in one file, dropping the agreement requirement removed the task folder requirement
# along with it, and no tree ever asked to hold them together.
#
# The whole rule — rule `task-flow`.
#
# FAIL-OPEN: no jq, not a git repository, broken input, someone else's tool → pass. A broken guard
# must not get in the way of work.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=task-flow-guard
RT_GUARD_RULE=task-flow

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parsing the call — shared by both guards of the course of work. The file may not be laid out:
# then there is nothing to judge by, and the guard stays silent.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/task-flow-context.sh" ] && . "$rt_hooks_dir/task-flow-context.sh"
command -v rt_task_flow_context >/dev/null 2>&1 || exit 0

rt_task_flow_context || exit 0

branch="$RT_TF_BRANCH"
root="$RT_TF_ROOT"
tasks_dir="$RT_TF_TASKS_DIR"
main_branch="$RT_TF_MAIN_BRANCH"
dir="$RT_TF_DIR"
plan="$RT_TF_PLAN"

# The decision, the move and the text come from the decision table. Parameters: the facts of this
# guard, the tool and the input of the move its refusal names, the params of the text. The facts of
# the neighbours are those they judge that move by: the decider puts first what they want.
tf_decide() {
    # shellcheck disable=SC1091
    . "$rt_hooks_dir/facts.sh" 2>/dev/null
    tf_sid="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.session_id // "nosession"' 2>/dev/null)"
    tf_record="$(rt_fact_transcript "$RT_HOOK_INPUT")"
    tf_facts="$(jq -cn --argjson own "$1" \
        --arg exam "$(rt_fact_exam_holds "$tf_record")" \
        --arg window "$(rt_fact_window_over_stop "$tf_sid" "$tf_record")" \
        --arg rule "$(rt_fact_move_rule_loaded "$2" "$3" "$tf_sid")" \
        --arg gate "$(rt_fact_move_gate_rule "$2" "$3" "$tf_sid")" \
        --arg handoff "$(rt_fact_from_handoff "$tf_record")" \
        --arg flow "$(rt_fact_rule_loaded "${RT_TASK_FLOW_RULE:-task-flow}" "$tf_sid")" \
        '{exam:$exam, window_over_stop:$window, rule_loaded:$rule, gate_rule:$gate, task_flow_loaded:$flow, from_handoff:$handoff} + $own')"
    tf_params="$(jq -cn --arg b "$branch" --arg t "$tasks_dir" --argjson p "${4:-"{}"}" '{branch:$b, tasks_dir:$t} + $p')"
    # shellcheck disable=SC1091
    . "$rt_hooks_dir/decide.sh" 2>/dev/null
    command -v rt_decide >/dev/null 2>&1 && rt_decide task-flow-guard.sh "?edit_code" "$tf_facts" "$tf_params" PreToolUse "$RT_HOOK_INPUT"
    exit 0
}

# Resolving a merge conflict is the merge itself, not an edit of the product. Main is merged into
# the epic branch while the work runs, and that branch carries no task folder by the rule — it holds
# merges, not edits of its own. Refused here, the conflict has no lawful way out: a folder made up
# for the epic branch would be the very edit the rule forbids in it. So a call passes while a merge
# stands and every code path it writes is still unmerged. A file already resolved and added, and
# any other code file of the same merge, is judged as before: the exception is the conflict, not
# the branch.
merge_conflict_only() {
    git -C "$root" rev-parse -q --verify MERGE_HEAD >/dev/null 2>&1 || return 1
    seen=0
    while IFS= read -r candidate; do
        [ -z "$candidate" ] && continue
        # A relative path belongs to the directory of the call, as in the context above.
        case "$candidate" in
            /*) ;;
            *) candidate="${rt_tf_askdir:-${CLAUDE_PROJECT_DIR:-.}}/$candidate" ;;
        esac
        rt_is_app_code "$candidate" || rt_tf_laid_out "$candidate" || continue
        [ -n "$(git -C "$root" ls-files -u -- "$candidate" 2>/dev/null | head -1)" ] || return 1
        seen=1
    done <<EOF
${RT_TF_CANDIDATES:-$RT_TF_PATH}
EOF
    [ "$seen" = 1 ]
}

merge_conflict_only && exit 0

if rt_needs rt_task_branch_ok task-flow-guard && ! rt_task_branch_ok "$branch"; then
    tf_decide '{"branch":"other"}' Bash "$(jq -cn --arg c "${RT_TASK_NEW_CMD:-npm run task:new} -- --title probe --slug probe" '{command:$c}')"
fi

# A folder taken apart by a commit of this branch is the sign that the work is handed over. The plan
# is deliberately off the disk by that minute: the tidy-up stands before the PR opens, because the
# merge button is pressed by a person on the hosting and no room is left for a closing commit after
# the approval. An edit after the tidy-up is an edit by the remarks of the review, and demanding a
# plan for it would lock the branch with an order of its own. The sign is taken from the branch
# history, not from the disk: a folder deleted but not committed does not mean handed-over work.
folder_archived() {
    [ -n "$(git -C "$root" ls-tree -d --name-only HEAD -- "$tasks_dir/$branch" 2>/dev/null | head -1)" ] && return 1
    base="$(git -C "$root" merge-base "$main_branch" HEAD 2>/dev/null)"
    [ -z "$base" ] && return 1
    had="$(git -C "$root" ls-tree -d --name-only "$base" -- "$tasks_dir/$branch" 2>/dev/null | head -1)"
    [ -z "$had" ] && had="$(git -C "$root" log "$base..HEAD" --diff-filter=A --name-only --pretty=format: -- "$tasks_dir/$branch" 2>/dev/null | head -1)"
    [ -n "$had" ]
}

folder_archived && exit 0

if [ ! -f "$plan" ]; then
    tf_decide '{"branch":"task","plan":"no"}' Bash "$(jq -cn --arg c "cp -r ${tasks_dir}/_template ${tasks_dir}/${branch}" '{command:$c}')"
fi

# The work state. An artefact on disk does not say whether the work has reached editing code: an
# empty `plan.md`, put there to lift the refusal, lies exactly like a written plan, and lifts the
# requirement by itself. The unit of work is a state, not a file: the executor declares it by a line
# in the progress, and the guard judges the declared transition, not the presence of files.
#
# The state stands in the "Where we stand" section and is rewritten together with it. The name is
# taken from the list — a name of one's own is not a state: the list names the entry, the exit and
# the mandatory action of each, and a word outside the list says nothing about any of the three.
progress="$dir/progress.md"

if [ ! -f "$progress" ]; then
    tf_decide '{"branch":"task","plan":"yes","progress":"no"}' Bash "$(jq -cn --arg c "cp -r ${tasks_dir}/_template ${tasks_dir}/${branch}" '{command:$c}')"
fi

state="$(sed -nE 's/^[[:space:]]*[-*][[:space:]]*\*\*(State|Состояние):\*\*[[:space:]]*`([^`]*)`.*/\2/p' "$progress" 2>/dev/null | head -1)"

# The mandatory action of the state. The refusal names it in full: an executor told only "wrong
# state" rewrites the state line instead of taking the step.
state_action() {
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

if [ -z "$state" ]; then
    tf_decide '{"branch":"task","plan":"yes","progress":"yes","state":"none"}' Bash '{"command":"node tools/task-flow-script.mjs measure"}'
fi

case "$state" in
    # States in which the application code is edited. The last three are not about the first session:
    # a run happens to be red and a review comes with remarks, and the fix goes into the same branch.
    этап-идёт | этапы-кончились | работа-отдана | разбор-кончился) ;;
    просьба-не-разобрана | разбор-закрыт | договорённость-записана | задача-взята | замысел-записан | папка-разобрана | влито)
        tf_decide '{"branch":"task","plan":"yes","progress":"yes","state":"other"}' Bash '{"command":"node tools/task-flow-script.mjs measure"}' \
            "$(jq -cn --arg s "$state" --arg a "$(state_action "$state")" '{state:$s, state_action:$a}')"
        ;;
    *)
        tf_decide '{"branch":"task","plan":"yes","progress":"yes","state":"unknown"}' Bash '{"command":"node tools/task-flow-script.mjs measure"}' \
            "$(jq -cn --arg s "$state" '{state:$s}')"
        ;;
esac

# The task folder travels into the branch by a commit, it does not live in one working copy. The
# three requirements above look at the disk, and a folder never committed passes them all without a
# single refusal — while the sign of handed-over work is taken from the history, and there it is
# absent. The refusal comes at the last point, at opening the PR, when the folder has already been
# taken apart by one's own hands: there is nothing to fix, the plan is off the disk, and it has to be
# assembled again from memory. For one task that cost eight calls and two refusals in a row.
#
# The second consequence is quieter: progress living in a working copy is visible to nobody. The
# owner sees a branch without a single trace of what is being done in it, and the next session sees
# emptiness instead of "Where we stand", if the working copy changed between sessions.
#
# The same history is asked as for the sign of handed-over work: the folder stands in `HEAD`, or a
# commit of the branch added it. No git — no requirement: there is nothing to ask the history with.
if [ -n "$(git -C "$root" rev-parse --verify HEAD 2>/dev/null)" ]; then
    in_tree="$(git -C "$root" ls-tree -d --name-only HEAD -- "$tasks_dir/$branch" 2>/dev/null | head -1)"
    if [ -z "$in_tree" ]; then
        tf_decide '{"branch":"task","plan":"yes","progress":"yes","state":"code","folder_committed":"no"}' Bash \
            "$(jq -cn --arg c "git add ${tasks_dir}/${branch} && git commit -m 'docs: task folder' -- ${tasks_dir}/${branch}" '{command:$c}')"
    fi
fi
