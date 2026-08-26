#!/usr/bin/env bash
# rt-kit v0.16.1 · hooks/browser-guard-device-id.sh · 9ca0497c096c · правится надстройкой, не здесь
# rt-hook: PreToolUse mcp__claude-in-chrome__select_browser
# Требует: hooks/deny-tail.sh
# Гард выбора браузера. PreToolUse на выборе браузера расширением.
#
# Отклоняет любой профиль, кроме закреплённого: чужой стоит лишнего круга и приводит в браузер,
# где сессий этого проекта нет вовсе.
#
# На совпадении ставит метку сессии. Гард свежести читает ВОЗРАСТ этой метки — она и делает
# законной всю дальнейшую работу с браузером.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: помощник не назвал профиль — пропуск.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

requested="$(printf '%s' "$input" | jq -r '.tool_input.deviceId // empty' 2>/dev/null)"

if [ "$requested" = "$device_id" ]; then
    sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
    marker_dir="${TMPDIR:-/tmp}/claude-browser-guard"
    mkdir -p "$marker_dir" 2>/dev/null && : >"$marker_dir/${sid}" 2>/dev/null
    exit 0
fi

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть. Файл
# может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

echo "Профиль «${requested}» не тот, что закреплён за проектом. Бери ${device_id} — единственный профиль, где сделан вход. $(rt_deny_tail)" >&2
exit 2
