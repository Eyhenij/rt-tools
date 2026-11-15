#!/usr/bin/env bash
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash
# Requires: checks/task-flow-script.mjs, hooks/deny-tail.sh
# PreToolUse guard of the course of work: the scenario moves by a measurement, not by a declaration.
#
# The progress used to say what was done, and the guards believed the line. Now a step is done when
# the engine measured its check and wrote a green mark, and a state is reached when the engine
# measures it. The guard refuses the edits that would move the scenario past the measurement: a done
# mark without a green mark, done and current marks out of order, a state line ahead of the measured
# state, a shell write into the progress, the plan, the epic plan or the marks, «отложено» without the
# owner's word naming the task, and an edit of the description of the task flow outside a task whose
# approved plan names it.
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
    printf '%s' "$input" | grep -qE 'progress\.md|plan\.md|plans/|rt-kit|task-flow|flow-[a-z-]+\.mjs' || exit 0
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
[ -n "$verdict" ] || exit 0

reason="BLOCKED by flow-step-guard: ${verdict}"

# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
tail_text="$(rt_deny_tail "")"
[ -n "$tail_text" ] && reason="${reason}

${tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"flow-step-guard: the scenario moves by a measurement."}}\n'
exit 0
