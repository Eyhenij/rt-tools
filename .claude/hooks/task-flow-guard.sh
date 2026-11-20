#!/usr/bin/env bash
# rt-kit v0.37.1 · hooks/task-flow-guard.sh · 783acdec7b64 · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: checks/decide.mjs, hooks/decide.sh, hooks/facts.sh, hooks/facts-flow.sh, hooks/task-flow-context.sh, hooks/profile-check.sh
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
tasks_dir="$RT_TF_TASKS_DIR"

# The facts of the course of work for this edit are computed in one place, shared with the guards
# that name an edit of another file. Empty — the edit is not judged: a merge conflict being resolved,
# or a task folder already taken apart, whose plan is taken from the history.
# shellcheck disable=SC1091
. "$rt_hooks_dir/facts.sh" 2>/dev/null
# shellcheck disable=SC1091
. "$rt_hooks_dir/facts-flow.sh" 2>/dev/null || exit 0
flow="$(rt_fact_flow)"
[ -n "$flow" ] || exit 0
own="$(printf '%s' "$flow" | jq -c '.facts')"
said="$(printf '%s' "$flow" | jq -c '.params')"

# The move the refusal names: create a task, assemble the folder, measure the state, commit the
# folder. The decision, the move and the text come from the decision table; the facts of the
# neighbours are those they judge that move by, and the decider puts first what they want.
case "$(printf '%s' "$own" | jq -r '[.branch, .plan, .progress, .state, .folder_committed] | map(. // "") | join(" ")')" in
    "other "*) move="$(jq -cn --arg c "${RT_TASK_NEW_CMD:-npm run task:new} -- --title probe --slug probe" '{command:$c}')" ;;
    "task no "* | "task yes no "*) move="$(jq -cn --arg c "cp -r ${tasks_dir}/_template ${tasks_dir}/${branch}" '{command:$c}')" ;;
    "task yes yes code no") move="$(jq -cn --arg c "git add ${tasks_dir}/${branch} && git commit -m 'docs: task folder' -- ${tasks_dir}/${branch}" '{command:$c}')" ;;
    "task yes yes code "*) exit 0 ;;
    *) move='{"command":"node tools/task-flow-script.mjs measure"}' ;;
esac

facts="$(jq -cn --argjson m "$(rt_fact_move Bash "$move" "$RT_HOOK_INPUT")" --argjson own "$own" '$m + $own')"
params="$(jq -cn --arg b "$branch" --arg t "$tasks_dir" --argjson p "$said" '{branch:$b, tasks_dir:$t} + $p')"
# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 && rt_decide task-flow-guard.sh "?edit_code" "$facts" "$params" PreToolUse "$RT_HOOK_INPUT"
exit 0
