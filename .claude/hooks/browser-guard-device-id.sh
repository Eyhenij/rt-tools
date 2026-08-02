#!/usr/bin/env bash
# PreToolUse guard for mcp__claude-in-chrome__select_browser.
#
# Rejects any deviceId other than the pinned profile. Picking another one wastes a round trip
# and lands on a browser without this project's sessions.
#
# On a successful match it stamps a per-session marker. browser-guard-require-select.sh reads
# that marker's AGE, so the stamp is what makes later browser work legal.
#
# FAIL-OPEN when RT_TOOLS_BROWSER_DEVICE_ID is unset (see browser-guard-no-listing.sh).

input="$(cat 2>/dev/null)"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

requested="$(printf '%s' "$input" | jq -r '.tool_input.deviceId // empty' 2>/dev/null)"

if [ "$requested" = "$device_id" ]; then
    sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
    marker_dir="${TMPDIR:-/tmp}/claude-browser-guard"
    mkdir -p "$marker_dir" 2>/dev/null && : >"$marker_dir/rt-tools-${sid}" 2>/dev/null
    exit 0
fi

echo "deviceId '${requested}' is not the pinned Chrome profile. Use ${device_id} — the only profile set up for this project." >&2
exit 2
