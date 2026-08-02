#!/usr/bin/env bash
# PostToolUse hook on the `Skill` tool.
# Records which skill was loaded, per session, so the edit gate can verify it.
# Always exits 0 and never blocks — this hook only observes.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
skill="$(printf '%s' "$input" | jq -r '.tool_input.skill // empty' 2>/dev/null)"
[ -z "$skill" ] && exit 0

dir="${TMPDIR:-/tmp}/claude-skill-gate"
mkdir -p "$dir" 2>/dev/null || exit 0
printf '%s\n' "$skill" >> "$dir/${sid}.loaded" 2>/dev/null

exit 0
