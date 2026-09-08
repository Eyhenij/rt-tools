#!/usr/bin/env bash
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: rules/task-flow.md, hooks/deny-tail.sh, hooks/write-targets.sh
# Handover entry guard: a session started from a handover edits no file until the work-conduct rule
# is loaded.
#
# The handover was written by the previous session, lies outside the tree and is read by no check.
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

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# The work-conduct rule has its own name in each tree, but the handover directory is shared: the
# guard looks at both signs.
rule="${RT_TASK_FLOW_RULE:-task-flow}"

verdict="$(jq -s -r --arg rule "$rule" '
    [.[] | select(.type == "user") | .message.content
       | if type == "string" then . elif type == "array"
         then (map(if type == "object" then (.text // "") else "" end) | join("\n")) else "" end] as $said
    | [.[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")
       | ((.name // "") + " " + ((.input.skill // .input.command // "") | tostring))] as $used
    | (($said | join("\n")) | test("handoff|передач[аи][[:space:]]+захода")) as $from_handoff
    | (($used | join("\n")) | test("Skill[[:space:]]+" + $rule + "|skills/" + $rule)) as $loaded
    | if ($from_handoff and ($loaded | not)) then "no-rule" else "fine" end
' "$transcript" 2>/dev/null)"

[ "$verdict" = "no-rule" ] || exit 0

reason="BLOCKED by handoff-entry-guard: the session began from a handover, and the rule of work conduct is not loaded for it.

The handover was written by the previous session, lies outside the tree and is read by no check: everything standing in it is verified against the tree. The order of entry is four steps:

    1. the rule of work conduct and the pattern of returning — by the first move;
    2. the branch and the state of the work are read in the tree, not in the handover;
    3. the numbers from the handover are recomputed on the current commit;
    4. the next step is taken from the progress.

Load the rule and repeat the edit."

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the refusal reason stays as it is.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"handoff-entry-guard: the rule of work conduct is not loaded."}}\n'
exit 0
