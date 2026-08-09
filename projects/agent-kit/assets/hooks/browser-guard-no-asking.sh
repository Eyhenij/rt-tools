#!/usr/bin/env bash
# PreToolUse guard for AskUserQuestion.
#
# The browser choice is already made and pinned in browser-device-id.sh — asking again is noise, and the
# answer could only ever be the pinned profile. Only questions actually about PICKING a browser
# are blocked; every other question passes untouched.
#
# A bare "browser"/"браузер" substring is too broad for a web-dev project: questions about
# client-side code, user agents, cross-browser bugs etc. legitimately use the word without
# being about which Chrome profile to automate. Anchor on selection phrasing instead
# (deviceId, "which/what browser", "какой браузер").
#
# FAIL-OPEN when browser-device-id.sh prints nothing.

input="$(cat 2>/dev/null)"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

questions="$(printf '%s' "$input" | jq -r '[.tool_input.questions[]? | .question, .header, (.options[]?.label)] | join(" ")' 2>/dev/null)"
[ -z "$questions" ] && exit 0

printf '%s' "$questions" | grep -qiE 'deviceid|device id|(which|what|pick|choose|select)[^.]{0,25}\bbrowser\b|\bbrowser\b[^.]{0,25}(profile|to use)|как(ой|ую)?[^.]{0,15}браузер|брауз[а-я]*[^.]{0,20}(использовать|выбрать|выбор|нужен|запустить)' || exit 0

echo "Do not ask which browser to use — the profile is pinned. Call select_browser with deviceId ${device_id} ('Main' profile)." >&2
exit 2
