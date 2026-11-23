#!/usr/bin/env bash
# rt-kit v0.39.0 · hooks/task-flow-draft-guard.sh · 7aab36bdef8b · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: checks/decide.mjs, hooks/decide.sh, hooks/facts.sh, hooks/task-flow-context.sh, hooks/task-flow-guard.sh, hooks/deny-tail.sh
# PreToolUse guard for Edit|Write|MultiEdit: no code is written before the product agreement.
#
# The plan says how the work will be done and is silent about what was agreed with the owner.
# The product agreement is the only text that names the promised behaviour before the code;
# written afterwards, it retells a decision already made instead of checking it.
#
# The guard demands one thing and exactly one: the plan names the agreement with the line
# `**Draft:** \`path\``, and what is named exists. The task folder, the plan itself and the
# declared state are demanded by `task-flow-guard`, and before its refusals this guard judges
# nothing: no plan on disk — it stays silent.
#
# The demands are kept apart so that a tree can drop one and keep the other. While both rode in
# one file, dropping the agreement demand also dropped the demand for the task folder and the
# plan — that is, everything the guard was made for.
#
# There is a deliberate way out: the line `**Behaviour:** unchanged — <reason>` in the plan
# lifts the agreement demand. An empty reason is not accepted, same as with `Docs-skip:`.
#
# The whole rule — the `task-flow` rule.
#
# FAIL-OPEN: no jq, not a git repository, broken input, foreign tool → pass. A broken guard must
# not get in the way of work.

# Own name in the observations: the refusal is written by the shared refusal tail, not by the
# guard itself.
RT_GUARD_NAME=task-flow-draft-guard
RT_GUARD_RULE=task-flow

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parsing the call is shared by both progress guards. The file may not be laid out: then there is
# nothing to judge with, and the guard stays silent.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/task-flow-context.sh" ] && . "$rt_hooks_dir/task-flow-context.sh"
command -v rt_task_flow_context >/dev/null 2>&1 || exit 0

rt_task_flow_context || exit 0

branch="$RT_TF_BRANCH"
tasks_dir="$RT_TF_TASKS_DIR"
plan="$RT_TF_PLAN"

# Whether the plan names the agreement and whether it exists is computed in one place, shared with
# the guards that name an edit of another file. Empty — there is no plan, and nothing to judge.
# shellcheck disable=SC1091
. "$rt_hooks_dir/facts.sh" 2>/dev/null
# shellcheck disable=SC1091
. "$rt_hooks_dir/facts-flow.sh" 2>/dev/null || exit 0
agreement="$(rt_fact_agreement)"
[ -n "$agreement" ] || exit 0
own="$(printf '%s' "$agreement" | jq -c '{plan:"yes"} + .facts')"
said="$(printf '%s' "$agreement" | jq -c '.params')"

# The move the refusal names: name the agreement in the plan, or write the agreement it names.
case "$(printf '%s' "$own" | jq -r '.agreement')" in
    unnamed) tool=Edit; move="$(jq -cn --arg f "$plan" '{file_path:$f,old_string:"",new_string:""}')" ;;
    missing) tool=Write; move="$(printf '%s' "$said" | jq -c '{file_path:.agreement_file, content:""}')" ;;
    *) exit 0 ;;
esac

# The decision, the move and the text come from the decision table; the facts of the neighbours are
# those they judge that move by, and the decider puts first what they want.
facts="$(jq -cn --argjson m "$(rt_fact_move "$tool" "$move" "$RT_HOOK_INPUT")" --argjson own "$own" '$m + $own')"
params="$(jq -cn --arg b "$branch" --arg t "$tasks_dir" --argjson p "$said" '{branch:$b, tasks_dir:$t} + $p')"
# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 && rt_decide task-flow-draft-guard.sh "?edit_code" "$facts" "$params" PreToolUse "$RT_HOOK_INPUT"
exit 0
