#!/usr/bin/env bash
# rt-hook: PostToolUse Skill
# Запись о загруженном правиле. PostToolUse на инструменте `Skill`.
#
# Гейт обязан знать, загружено правило или нет, а спросить об этом ему некого: инструмент о
# своих прошлых вызовах не рассказывает. Поэтому загрузка записывается здесь, по сессии.
#
# Хук только наблюдает: он всегда пропускает и ничего не отбивает.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
skill="$(printf '%s' "$input" | jq -r '.tool_input.skill // empty' 2>/dev/null)"
[ -z "$skill" ] && exit 0

dir="${TMPDIR:-/tmp}/claude-skill-gate"
mkdir -p "$dir" 2>/dev/null || exit 0
printf '%s\n' "$skill" >> "$dir/${sid}.loaded" 2>/dev/null

# Та же загрузка вторым адресом — в наблюдения дерева. Запись выше живёт до сжатия контекста и
# гибнет вместе с ним: она отвечает гейту на вопрос «загружено ли», и больше ни на что.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/observe.sh" ] && . "$rt_hooks_dir/observe.sh" 2>/dev/null
command -v rt_note >/dev/null 2>&1 && rt_note skill-load "res=$skill" "sid=$sid"

exit 0
