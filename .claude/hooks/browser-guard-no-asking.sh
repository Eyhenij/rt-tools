#!/usr/bin/env bash
# PreToolUse guard for AskUserQuestion.
#
# The browser choice is already made and pinned in .env — asking again is pure noise, and the
# answer could only ever be the pinned profile. Only questions actually about picking a browser
# are blocked; every other question passes untouched.
#
# FAIL-OPEN when RT_TOOLS_BROWSER_DEVICE_ID is unset.

input="$(cat 2>/dev/null)"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

questions="$(printf '%s' "$input" | jq -r '[.tool_input.questions[]? | .question, .header, (.options[]?.label)] | join(" ")' 2>/dev/null)"
[ -z "$questions" ] && exit 0

printf '%s' "$questions" | grep -qiE 'browser|deviceid|device id|браузер' || exit 0

echo "Do not ask which browser to use — it is pinned in .env. Call select_browser with deviceId ${device_id} (pinned Chrome profile)." >&2
exit 2
