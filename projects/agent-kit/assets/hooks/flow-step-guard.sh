#!/usr/bin/env bash
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash
# Requires: checks/task-flow-script.mjs, checks/flow-plan.mjs, checks/decide.mjs, hooks/decide.sh, hooks/deny-tail.sh, hooks/facts.sh
# PreToolUse guard of the course of work: the scenario moves by a measurement, not by a declaration.
#
# The progress used to say what was done, and the guards believed the line. Now a step is done when
# the engine measured its check and wrote a green mark, and a state is reached when the engine
# measures it. The guard refuses the edits that would move the scenario past the measurement: a done
# mark without a green mark, done and current marks out of order, a state line ahead of the measured
# state, a shell write into the progress, the plan, the epic plan or the marks, «отложено» without the
# owner's word naming the task, and an edit of the description of the task flow outside a task whose
# approved plan names it. A plan not yet approved is refused a check whose form hides its result.
#
# The decisions live in the engine — `task-flow-script.mjs guard` — and this file only hands it the
# input and turns its line into a refusal. The whole rule — rule `task-flow`.
#
# FAIL-OPEN: no node, no engine, not a git repository, broken input, an engine that fails or prints
# nothing → pass. A broken guard must not get in the way of work.

RT_GUARD_NAME=flow-step-guard
RT_GUARD_RULE=task-flow

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
command -v node >/dev/null 2>&1 || exit 0

input="${RT_HOOK_INPUT:-$(cat 2>/dev/null)}"
[ -n "$input" ] || exit 0

# A shell command that names none of the guarded files is not handed to the engine: every command
# passes here, and a start of node costs each of them. The sign errs towards firing — a name in any
# place of the command hands it over. An edit is always handed over: the epic plans may lie in a
# directory of the tree's own name.
tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
if [ "$tool" = Bash ]; then
    printf '%s' "$input" | grep -qE 'progress\.md|plan\.md|plans/|rt-kit|task-flow|flow-[a-z-]+\.mjs|\.claude/projects/' || exit 0
fi

# The engine lies next to the hooks in the package and in tools/ where it is laid out.
engine=""
for candidate in "$rt_hooks_dir/../checks/task-flow-script.mjs" "${CLAUDE_PROJECT_DIR:-.}/tools/task-flow-script.mjs"; do
    [ -f "$candidate" ] && engine="$candidate" && break
done
[ -n "$engine" ] || exit 0

# The engine reads the tree of the call: the directory the hook names, or the project.
dir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -d "$dir" ] || dir="${CLAUDE_PROJECT_DIR:-.}"

verdict="$(cd "$dir" && printf '%s' "$input" | timeout 60 node "$engine" guard 2>/dev/null)" || exit 0
# A plan is judged by the form of its checks when it is written: a pipe without `pipefail` and an
# absence counted by `grep -c` measure nothing. An approved plan is not asked again.
[ -n "$verdict" ] || case "$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)" in
    */plan.md) verdict="$(cd "$dir" && printf '%s' "$input" | timeout 60 node "$(dirname "$engine")/flow-plan.mjs" written 2>/dev/null)" || exit 0 ;;
esac
[ -n "$verdict" ] || exit 0

# The decision, the move and the text come from the decision table. The engine gives its reason;
# the kind of the reason is the action the table knows, and the facts are those the neighbours
# judge the named move by — the decider puts first what they want.
case "$verdict" in
    *"has no green mark"* | *"marked done after"* | *"marked current after"* | *"done steps go first"*) action=mark_step_done ;;
    *"is ahead of the measured one"*) action=set_state ;;
    *"are written only by the engine"* | *"are written only by the harness"*) action=write_marks ;;
    *"is edited by the edit tool, not by a shell command"* | *"are edited by the edit tool, not by a shell command"*) action=shell_write_progress ;;
    *"override of the description is edited by the edit tool"*) action=shell_write_progress ;;
    *"belongs to the description of the task flow"*) action=edit_flow_description ;;
    *"the replacement of the check of step"*"is the owner's decision"*) action=replace_step_check ;;
    *"шаг владельца"*"is not written into a row"*) action=owner_step_row ;;
    "the check of step "*) action=write_plan_check ;;
    *) action=defer_task ;;
esac

# shellcheck disable=SC1091
. "$rt_hooks_dir/facts.sh" 2>/dev/null
sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
transcript="$(rt_fact_transcript "$input")"
exam="$(rt_fact_exam_holds "$transcript")"
# The move the refusal names is an edit of the progress or of the plan; the gate is asked about that
# file, and the window and the handover entry about the rule of the course of work.
tasks_root="$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null)/${RT_TASKS_DIR:-docs/tasks}/$(rt_fact_branch "$dir")"
case "$action" in
    edit_flow_description) move_file="$tasks_root/plan.md" ;;
    *) move_file="$tasks_root/progress.md" ;;
esac
move_input="$(jq -cn --arg f "$move_file" '{file_path:$f,old_string:"",new_string:""}')"
facts="$(jq -cn \
    --arg exam "$exam" \
    --arg window "$(rt_fact_window_over_stop "$sid" "$transcript")" \
    --arg rule "$(rt_fact_move_rule_loaded Edit "$move_input" "$sid")" \
    --arg gate "$(rt_fact_move_gate_rule Edit "$move_input" "$sid")" \
    --arg flow "$(rt_fact_rule_loaded "${RT_TASK_FLOW_RULE:-task-flow}" "$sid")" \
    --arg handoff "$(rt_fact_from_handoff "$transcript")" \
    '{exam:$exam, window_over_stop:$window, rule_loaded:$rule, gate_rule:$gate, from_handoff:$handoff,
      task_flow_loaded:$flow, step_green:"no", measured:"earlier", owner_named_task:"no", flow_desc_approved:"no"}')"
# A compound command is refused whole: the words name the part that holds the guarded file.
part=""
if [ "$tool" = Bash ]; then
    # shellcheck disable=SC1091
    . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
    command -v rt_judged_part >/dev/null 2>&1 && part="$(rt_judged_part "$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)" \
        'progress.md|plan.md|plans/|rt-kit|task-flow|flow-|.claude/projects/')"
fi
params="$(jq -cn --arg v "$verdict" --arg a "$part" '{verdict:$v} + (if $a == "" then {} else {after:$a} end)')"
# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 && rt_decide flow-step-guard.sh "$action" "$facts" "$params" PreToolUse "$input"
exit 0
