#!/usr/bin/env bash
# PreToolUse guard for mcp__claude-in-chrome__(list_connected_browsers|switch_browser).
#
# One pinned Chrome profile holds this project's sessions. Listing or switching browsers
# returns generic, unstable display names ("Browser 1..6") that identify nothing, and picking
# from them lands on a profile that is not logged in — so the only supported path is
# select_browser with the pinned deviceId.
#
# FAIL-OPEN when RT_TOOLS_BROWSER_DEVICE_ID is unset: this hook is shared and must not
# block anyone who has not configured a browser.

cat >/dev/null 2>&1

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

echo "Do not list or switch browsers. Use select_browser with deviceId ${device_id} — the pinned Chrome profile, the only profile set up for this project." >&2
exit 2
