#!/usr/bin/env bash
# rt-kit v0.42.0 · hooks/end-conversation-guard.sh · 72d49de52d8f · правится надстройкой, не здесь
# rt-hook: PreToolUse .*EndConversation.*
# Requires: hooks/decide.sh
# The guard of the end of the conversation: the executor does not end the session. PreToolUse on
# the tool that closes the conversation — refused always.
#
# Why. The session is ended by the owner and by nobody else. On 17 September 2026 the executor
# closed the session by that tool with the work open and tasks assigned, and the owner named it
# unlawful. A ban in the settings of one machine holds one machine; this guard travels with the
# package. There is no lawful form of bypass: no state of the work, no word in the turn and no
# insult from the owner cancels it — a session that must close is closed by the owner.
#
# The name of the tool is read by jq, and without jq by grep over the raw input. A tool name with a
# vendor prefix is matched by its tail.
#
# FAIL-OPEN: an empty input or a name that is not the closing tool passes. The refusal itself comes
# from the decision table, so without jq or node the call passes, like the call of every guard that
# asks the decider: a broken decider has no right to jam the work.

# Its own name in the observations: the refusal is recorded by the decider call.
RT_GUARD_NAME=end-conversation-guard
RT_GUARD_RULE=turn-conduct

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

# The decision and the words come from the decision table: the call itself is the whole fact.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 || exit 0
rt_decide end-conversation-guard.sh end_conversation '{}' '{}' PreToolUse "$input"
exit 0
