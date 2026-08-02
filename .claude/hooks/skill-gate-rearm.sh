#!/usr/bin/env bash
# SessionStart(compact|clear) hook — re-arms the skill gate.
#
# The gate records a loaded skill per session_id and then passes that domain silently for the
# rest of the session. Compaction and /clear wipe the skill's CONTENT out of context but keep
# the SAME session_id, so without this the gate would keep passing while the agent works from
# a summary instead of the actual skill.
#
# Dropping the record forces every domain to re-load its skill after a compaction.
#
# FAIL-OPEN: any error exits 0. This hook only deletes a temp file; it never blocks.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // empty' 2>/dev/null)"
[ -z "$sid" ] && exit 0

rm -f "${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded" 2>/dev/null

exit 0
