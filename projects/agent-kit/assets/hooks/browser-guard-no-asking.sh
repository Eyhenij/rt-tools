#!/usr/bin/env bash
# rt-hook: PreToolUse AskUserQuestion
# Требует: hooks/deny-tail.sh
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

# Своё имя в наблюдениях: отбой пишет общий хвост отказа, а не сам гард.
RT_GUARD_NAME=browser-guard-no-asking

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

questions="$(printf '%s' "$input" | jq -r '[.tool_input.questions[]? | .question, .header, (.options[]?.label)] | join(" ")' 2>/dev/null)"
[ -z "$questions" ] && exit 0

printf '%s' "$questions" | grep -qiE 'deviceid|device id|(which|what|pick|choose|select)[^.]{0,25}\bbrowser\b|\bbrowser\b[^.]{0,25}(profile|to use)|как(ой|ую)?[^.]{0,15}браузер|брауз[а-я]*[^.]{0,20}(использовать|выбрать|выбор|нужен|запустить)' || exit 0

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть. Файл
# может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

echo "Do not ask which browser to use — the profile is pinned. Call select_browser with deviceId ${device_id} ('Main' profile). $(rt_deny_tail)" >&2
exit 2
