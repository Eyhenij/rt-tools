#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/browser-guard-no-asking.sh · 7615dc198e5a · правится надстройкой, не здесь
# rt-hook: PreToolUse AskUserQuestion
# Requires: hooks/deny-tail.sh
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
# The Russian pronoun is spelled out case by case on purpose: an optional ending would leave a
# bare "как" in the pattern, and "какие браузеры поддерживаем" — a support question, not a
# selection one — got denied by exactly that.
#
# FAIL-OPEN when browser-device-id.sh prints nothing.

# Its own name in the observations: the refusal is recorded by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=browser-guard-no-asking

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

questions="$(printf '%s' "$input" | jq -r '[.tool_input.questions[]? | .question, .header, (.options[]?.label)] | join(" ")' 2>/dev/null)"
[ -z "$questions" ] && exit 0

printf '%s' "$questions" | grep -qiE 'deviceid|device id|(which|what|pick|choose|select)[^.]{0,25}\bbrowser\b|\bbrowser\b[^.]{0,25}(profile|to use)|как(ой|ую|им|ого)[^.]{0,15}браузер|брауз[а-я]*[^.]{0,20}(использовать|выбрать|выбор|нужен|запустить)' || exit 0

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the refusal reason stays as it is.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

echo "Do not ask which browser to use — the profile is pinned. Call select_browser with deviceId ${device_id} ('Main' profile). $(rt_deny_tail)" >&2
exit 2
