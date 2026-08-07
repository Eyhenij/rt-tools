#!/usr/bin/env bash
# Запись о загруженном правиле. PostToolUse на инструменте `Skill`.
#
# Гейт обязан знать, загружено правило или нет, а спросить об этом ему некого: инструмент о
# своих прошлых вызовах не рассказывает. Поэтому загрузка записывается здесь, по сессии.
#
# Хук только наблюдает: он всегда пропускает и ничего не отбивает.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
skill="$(printf '%s' "$input" | jq -r '.tool_input.skill // empty' 2>/dev/null)"
[ -z "$skill" ] && exit 0

dir="${TMPDIR:-/tmp}/claude-skill-gate"
mkdir -p "$dir" 2>/dev/null || exit 0
printf '%s\n' "$skill" >> "$dir/${sid}.loaded" 2>/dev/null

exit 0
