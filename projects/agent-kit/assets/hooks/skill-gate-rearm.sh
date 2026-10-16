#!/usr/bin/env bash
# rt-hook: SessionStart compact|clear
# Re-arming the gate. SessionStart(compact|clear).
#
# The gate remembers a loaded rule by the session id and from then on lets that area through
# silently. Context compaction and clearing take the TEXT of the rule itself out of the context but
# leave the session id as it was — without this hook the gate would keep letting through while the
# agent works from a retelling instead of the rule itself.
#
# Removing the record makes every area load its rule again.
#
# FAIL-OPEN: any error passes. The hook removes a temporary file and refuses nothing.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // empty' 2>/dev/null)"
[ -z "$sid" ] && exit 0

record="${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded"

# The names the session had loaded are read before the record is removed. The gate asks for one rule
# per refusal, and a session that does not know which rules it had loaded meets them one refusal at
# a time: one edit after a compaction went through six refusals in a row. An empty or missing record
# gives no names, and the line stays as it was.
loaded=""
if [ -s "$record" ]; then
    loaded="$(awk 'NF && !seen[$0]++ { printf "%s%s", (n++ ? ", " : ""), $0 }' "$record" 2>/dev/null)"
fi

rm -f "$record" 2>/dev/null

# The re-arming is told to the session in words.
#
# A silent re-arming reads as breakage: the compaction summary says the rules were already loaded,
# the gate answers that they were not — and the session spends a turn finding out which of the two
# is right. A turn was spent that way four times in one session. The line removes the contradiction:
# the rule text is no longer in the context, which is why it is asked for again.
context="The rules gate is armed anew: the compaction carried the text of the rules themselves out of the session, and every area will ask for its rule once more. The former loading does not count — load the rule and work on."
if [ -n "$loaded" ]; then
    context="${context} Loaded before the compaction: ${loaded}. Load in one turn every one of them that the current stage touches, before the first edit."
fi

jq -n --arg c "$context" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$c}}' 2>/dev/null

exit 0
