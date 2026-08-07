#!/usr/bin/env bash
# Гард выбора браузера. PreToolUse на выборе браузера расширением.
#
# Отклоняет любой профиль, кроме закреплённого: чужой стоит лишнего круга и приводит в браузер,
# где сессий этого проекта нет вовсе.
#
# На совпадении ставит метку сессии. Гард свежести читает ВОЗРАСТ этой метки — она и делает
# законной всю дальнейшую работу с браузером.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: помощник не назвал профиль — пропуск.

input="$(cat 2>/dev/null)"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/{{hooksDir}}/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

requested="$(printf '%s' "$input" | jq -r '.tool_input.deviceId // empty' 2>/dev/null)"

if [ "$requested" = "$device_id" ]; then
    sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
    marker_dir="${TMPDIR:-/tmp}/claude-browser-guard"
    mkdir -p "$marker_dir" 2>/dev/null && : >"$marker_dir/${sid}" 2>/dev/null
    exit 0
fi

echo "Профиль «${requested}» не тот, что закреплён за проектом. Бери ${device_id} — единственный профиль, где сделан вход." >&2
exit 2
