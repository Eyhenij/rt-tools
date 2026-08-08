#!/usr/bin/env bash
# PreToolUse на Edit|Write|MultiEdit: код не пишется раньше замысла.
#
# Работа идёт много заходов, и между ними исполнитель не помнит ничего. Замысел, лежащий на
# диске, — единственное, что переживает перерыв. Написанный после кода, он пишется по коду и
# сверять с ним уже нечего.
#
# Отбивает ОДИН раз на ветку за сессию: дальше та же ветка проходит молча. Гард, который бьёт
# на каждую правку, выключают целиком — а один отказ с адресом стоит почти ничего.
#
# Файл этого дерева: пакет такого хука не везёт.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: любая ошибка, главная ветка, ветка без номера задачи, правка вне кода —
# всё пропускается (exit 0).

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-.}"
sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
[ -z "$target" ] && exit 0

cd "$root" 2>/dev/null || exit 0

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" || exit 0
[ -z "$branch" ] && exit 0
[ "$branch" = "main" ] && exit 0

# Ветка без номера задачи замысла не требует: за ней в очереди работ ничего не стоит.
printf '%s' "$branch" | grep -qE '/[0-9]+-' || exit 0

# Правится не код — пропускаем. Сама папка задачи, документы и файлы агента к коду не относятся.
case "$target" in
    */docs/tasks/* | */docs/specs/* | */docs/plans/* | */.claude/* | *.md) exit 0 ;;
esac

dir="docs/tasks/$(printf '%s' "$branch" | tr '/' '-')"
[ -f "$dir/plan.md" ] && exit 0

marker="${TMPDIR:-/tmp}/claude-task-flow/${sid}-$(printf '%s' "$branch" | tr '/' '-')"
[ -f "$marker" ] && exit 0
mkdir -p "$(dirname "$marker")" 2>/dev/null && : > "$marker"

reason="Замысла нет: $dir/plan.md. Заведи папку задачи по образцу docs/tasks/_template/ — просьбу дословно в grill.md, этапы с признаками готовности в plan.md — и повтори. Решил работать без папки — повтори вызов, второй раз гард не отбивает."
jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Нет %s — заведи папку задачи и повтори."}}\n' "$dir/plan.md"

exit 0
