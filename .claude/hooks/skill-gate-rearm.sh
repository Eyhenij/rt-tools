#!/usr/bin/env bash
# rt-kit v0.27.0 · hooks/skill-gate-rearm.sh · ba2e4f6b43ca · правится надстройкой, не здесь
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

rm -f "${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded" 2>/dev/null

# The re-arming is told to the session in words.
#
# A silent re-arming reads as breakage: the compaction summary says the rules were already loaded,
# the gate answers that they were not — and the session spends a turn finding out which of the two
# is right. A turn was spent that way four times in one session. The line removes the contradiction:
# the rule text is no longer in the context, which is why it is asked for again.
jq -n '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:"The rules gate is armed anew: the compaction carried the text of the rules themselves out of the session, and every area will ask for its rule once more. The former loading does not count — load the rule and work on."}}' 2>/dev/null

exit 0
