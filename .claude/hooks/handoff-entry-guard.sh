#!/usr/bin/env bash
# rt-kit v0.42.0 · hooks/handoff-entry-guard.sh · 1be19b9e44ca · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: checks/decide.mjs, hooks/decide.sh, hooks/facts.sh, rules/task-flow.md, hooks/deny-tail.sh, hooks/write-targets.sh
# Handover entry guard: a session started from a handover edits no file until the work-conduct rule
# is loaded.
#
# The handover was written by the previous session and is read by no check.
# It gets read as an assignment, and work begins past the rule: the state is not checked against the
# tree, the numbers are taken on trust, the entry order is followed from memory. An order written
# only in words is followed as long as someone remembers it.
#
# The session is recognised by the owner's first message: it names the handover path or carries its
# text. The rule load is recognised by a call of the rules tool in the same session.
#
# FAIL-OPEN: no `jq`, no transcript, no handover in the message → pass.

# Its own name in the observations: the refusal is recorded by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=handoff-entry-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# The write targets are taken by the shared parse: the same sign serves the guard of the place of an
# edit, and two copies of it would let through different shapes of a write. No file — a silent
# default remains, so that the guard does not break on an incomplete layout.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/write-targets.sh" ] && . "$rt_hooks_dir/write-targets.sh" 2>/dev/null
command -v rt_write_targets >/dev/null 2>&1 || rt_write_targets() { cat >/dev/null; }

tool="$(rt_hook_tool)"
case "$tool" in
    Edit | Write | MultiEdit) ;;
    # A write by a shell command is the same edit of a file: the same session with the name of the
    # shell instead of the name of the edit worked past the rule whole. A command that writes
    # nothing the guard does not wake: it must not get in the way of reading the tree, which is
    # exactly what the order of entry begins with.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        cmd="$(rt_hook_cmd)"
        [ -z "$cmd" ] && exit 0
        [ -n "$(printf '%s' "$cmd" | rt_write_targets)" ] || exit 0
        ;;
    *) exit 0 ;;
esac

# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null
transcript="$(rt_fact_transcript "$input")"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# The work-conduct rule has its own name in each tree, but the handover directory is shared: the
# guard looks at both signs.
rule="${RT_TASK_FLOW_RULE:-task-flow}"

# The facts this guard judges by: the session began from a handover, and the rule of work conduct is
# loaded — by a call of the skill or a read of its file, as the record shows.
from_handoff="$(rt_fact_from_handoff "$transcript")"
rule_loaded="$(jq -s -r --arg rule "$rule" '
    [.[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")
       | ((.name // "") + " " + ((.input.skill // .input.command // "") | tostring))]
    | join("\n") | if test("Skill[[:space:]]+" + $rule + "|skills/" + $rule) then "yes" else "no" end
' "$transcript" 2>/dev/null)"
[ "$from_handoff" = yes ] && [ "$rule_loaded" = no ] || exit 0

# The decision, the move and the text come from the decision table; the action is the class of
# this call.
facts="$(jq -cn --arg h "$from_handoff" --arg r "$rule_loaded" '{from_handoff:$h, rule_loaded:$r}')"
# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 && rt_decide handoff-entry-guard.sh "?edit_code" "$facts" '{}' PreToolUse "$input"
exit 0
