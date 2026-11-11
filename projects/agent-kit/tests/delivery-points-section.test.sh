#!/usr/bin/env bash
# Сценарии раздела с таблицей точек в теле заявки. Образец называет дерево: не названный, он не
# судится вовсе.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "раздел с таблицей точек"

REPO_WORK="$(fixture_repo RT-7-probe)"
export CLAUDE_PROJECT_DIR="$REPO_WORK"
trap 'rm -rf "$REPO_WORK"' EXIT

SAMPLE='^##[[:space:]]+Точки[[:space:]]*$'

points_section() {
    # Переменная ставится вызову гарда, а не первому звену конвейера: приставка перед командой
    # действует на неё одну.
    out="$(input_cmd "$2" Bash "$REPO_WORK" \
        | RT_PULL_POINTS_SECTION="$3" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null \
        | grep -c 'table of points')"
    report "$1" "упоминаний:${out:-0}" "упоминаний:$4"
}

points_section "SC-AK-1271 — тело без раздела отбивает открытие заявки" \
    'gh pr create --title "[RT-7] Сделано" --body "Тело без раздела."' "$SAMPLE" 1
points_section "SC-AK-1271 — тело с разделом про него молчит" \
    'gh pr create --title "[RT-7] Сделано" --body "Тело.

## Точки

| Точка | Признак | Результат |"' "$SAMPLE" 0
points_section "SC-AK-1271 — дерево без образца не судится" \
    'gh pr create --title "[RT-7] Сделано" --body "Тело без раздела."' '' 0

GOAL_SAMPLE='^##[[:space:]]+Цель[[:space:]]*$'

goal_section() {
    out="$(input_cmd "$2" Bash "$REPO_WORK" \
        | RT_PULL_GOAL_SECTION="$3" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null \
        | grep -c 'table of the critic')"
    report "$1" "упоминаний:${out:-0}" "упоминаний:$4"
}

goal_section "SC-AK-1271 — тело без раздела критика отбивает открытие заявки" \
    'gh pr create --title "[RT-7] Сделано" --body "Тело без раздела."' "$GOAL_SAMPLE" 1
goal_section "SC-AK-1271 — тело с таблицей критика про неё молчит" \
    'gh pr create --title "[RT-7] Сделано" --body "Тело.

## Цель

| Слова владельца | Что показывает результат | Итог |
| --- | --- | --- |
| слова | результат | да |"' "$GOAL_SAMPLE" 0
goal_section "SC-AK-1271 — заголовок раздела критика без таблицы отбивает открытие" \
    'gh pr create --title "[RT-7] Сделано" --body "Тело.

## Цель

Таблицы нет."' "$GOAL_SAMPLE" 1
goal_section "SC-AK-1271 — дерево без образца раздела критика не судится" \
    'gh pr create --title "[RT-7] Сделано" --body "Тело без раздела."' '' 0

suite_result "раздел с таблицей точек"
