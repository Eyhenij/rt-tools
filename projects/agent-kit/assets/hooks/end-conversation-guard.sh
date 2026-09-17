#!/usr/bin/env bash
# rt-hook: PreToolUse .*EndConversation.*
# Requires: hooks/deny-tail.sh
# The guard of the end of the conversation: the executor does not end the session. PreToolUse on
# the tool that closes the conversation — refused always.
#
# Why. The session is ended by the owner and by nobody else. On 17 September 2026 the executor
# closed the session by that tool with the work open and tasks assigned, and the owner named it
# unlawful. A ban in the settings of one machine holds one machine; this guard travels with the
# package. There is no lawful form of bypass: no state of the work, no word in the turn and no
# insult from the owner cancels it — a session that must close is closed by the owner.
#
# The name of the tool is read by jq, and without jq by grep over the raw input: a missing parser
# must not turn into silence here. A tool name with a vendor prefix is matched by its tail.
#
# FAIL-OPEN only where there is nothing to judge: an empty input or a name that is not the closing
# tool passes. A readable call of the closing tool is refused with or without a JSON parser.

# Its own name in the observations: the refusal is recorded by the shared deny tail.
RT_GUARD_NAME=end-conversation-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

if command -v rt_hook_read >/dev/null 2>&1; then
    rt_hook_read
    input="$RT_HOOK_INPUT"
else
    input="$(cat)"
fi

tool="$(printf '%s' "$input" | jq -r '.tool_name // ""' 2>/dev/null)"
if [ -z "$tool" ] && printf '%s' "$input" | grep -q '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*EndConversation'; then
    tool=EndConversation
fi

# Called by the dispatcher for the closing tool alone; a foreign name still passes, so a direct
# call with another tool costs nothing.
case "$tool" in
    *EndConversation*) ;;
    *) exit 0 ;;
esac

# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

reason="BLOCKED by end-conversation-guard: the executor does not end the conversation. The session is ended by the owner and by nobody else.

An assignment stands until the owner cancels it, and an insult cancels nothing: do what was assigned, and where the work stands on the owner's word, wait for the word. A session that must close is closed by the owner — say so in words and go on working. There is no lawful form of bypass for this refusal."
tail_text="$(rt_deny_tail "")"
[ -n "$tail_text" ] && reason="${reason}

${tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"BLOCKED by end-conversation-guard: the session is ended by the owner and by nobody else."}}\n'
exit 0
