#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/task-flow-guard.sh · f90c1bb8f6d7 · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/task-flow-context.sh, hooks/profile-check.sh, hooks/deny-tail.sh
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

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parsing the call — shared by both guards of the course of work. The file may not be laid out:
# then there is nothing to judge by, and the guard stays silent.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/task-flow-context.sh" ] && . "$rt_hooks_dir/task-flow-context.sh"
command -v rt_task_flow_context >/dev/null 2>&1 || exit 0

# The shared refusal tail: two lawful moves and the lawful form of a bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the reason for the refusal stays as it
# was.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh"

rt_task_flow_context || exit 0

branch="$RT_TF_BRANCH"
root="$RT_TF_ROOT"
tasks_dir="$RT_TF_TASKS_DIR"
main_branch="$RT_TF_MAIN_BRANCH"
dir="$RT_TF_DIR"
plan="$RT_TF_PLAN"

deny() { rt_task_flow_deny "$@"; }

if rt_needs rt_task_branch_ok task-flow-guard && ! rt_task_branch_ok "$branch"; then
    deny "BLOCKED by task-flow: an edit of code goes in a branch for a task, and the current branch is '${branch}'. Create a task (npm run task:new -- --title '…' --slug <slug>) and a branch under its number, then repeat. The rule is task-flow."
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
    deny "BLOCKED by task-flow: there is no plan — '${tasks_dir}/${branch}/plan.md'. Assemble the task folder from the sample (cp -r ${tasks_dir}/_template ${tasks_dir}/${branch}) and fill in the header, the task footprint and the stages, then repeat. The rule is task-flow."
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
    deny "BLOCKED by task-flow: there is no progress — '${tasks_dir}/${branch}/progress.md'. The state of the work is declared in it, and without it there is no seeing whether the work reached editing code. Assemble the task folder from the sample (cp -r ${tasks_dir}/_template ${tasks_dir}/${branch}), then repeat. The rule is task-flow."
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
        папка-разобрана) printf '%s' 'lift the draft and ask the owner to merge' ;;
        влито) printf '%s' 'a rules review of the work and an audit of the work queue' ;;
        *) printf '%s' '' ;;
    esac
}

if [ -z "$state" ]; then
    deny "BLOCKED by task-flow: no state of the work is declared in '${tasks_dir}/${branch}/progress.md'. Write into the section «Where we stand» the line '- **State:** \`<name>\`' — a name from the list of states of the rule — then repeat. Code is edited in the states 'этап-идёт', 'этапы-кончились', 'работа-отдана' and 'разбор-кончился'. The rule is task-flow."
fi

case "$state" in
    # States in which the application code is edited. The last three are not about the first session:
    # a run happens to be red and a review comes with remarks, and the fix goes into the same branch.
    этап-идёт | этапы-кончились | работа-отдана | разбор-кончился) ;;
    просьба-не-разобрана | разбор-закрыт | договорённость-записана | задача-взята | замысел-записан | папка-разобрана | влито)
        deny "BLOCKED by task-flow: the progress declares the state '${state}', and code is not edited in it. The mandatory action of this state is $(state_action "$state"). The work has reached editing code — rewrite the state line in '${tasks_dir}/${branch}/progress.md' to '- **State:** \`этап-идёт\`'. The rule is task-flow."
        ;;
    *)
        deny "BLOCKED by task-flow: '${tasks_dir}/${branch}/progress.md' declares the state '${state}', and there is no such name in the list. The name is taken from the list of states of the rule — a word of one own says nothing about the entry, the exit or the mandatory action. The rule is task-flow."
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
        deny "BLOCKED by task-flow: the task folder '${tasks_dir}/${branch}' lies in the working tree and is not put into the history of the branch. Put it there by a commit (git add ${tasks_dir}/${branch} && git commit), then repeat: the sign of handed-over work the guard takes from the history, and with an uncommitted folder the refusal arrives at the opening of the request — when the folder is already taken apart and there is nothing left to fix. The rule is task-flow."
    fi
fi
