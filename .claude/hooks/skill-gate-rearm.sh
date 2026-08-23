#!/usr/bin/env bash
# rt-kit v0.12.0 · hooks/skill-gate-rearm.sh · 2946cc9f7259 · правится надстройкой, не здесь
# rt-hook: SessionStart compact|clear
# Взвод гейта заново. SessionStart(compact|clear).
#
# Гейт помнит загруженное правило по идентификатору сессии и дальше пропускает эту область
# молча. Сжатие контекста и очистка выносят из контекста САМ ТЕКСТ правила, но идентификатор
# сессии оставляют прежним — без этого хука гейт продолжал бы пропускать, пока агент работает
# по пересказу вместо самого правила.
#
# Снятие записи заставляет каждую область загрузить своё правило заново.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: любая ошибка пропускает. Хук удаляет временный файл и ничего не
# отбивает.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // empty' 2>/dev/null)"
[ -z "$sid" ] && exit 0

rm -f "${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded" 2>/dev/null

exit 0
