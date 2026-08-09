#!/usr/bin/env bash
# SessionStart: состояние незаконченной работы уезжает в контекст на каждом запуске сессии.
#
# Памятью это не держится по той же причине, что и словарь: замысел читают перед правкой
# файла, а разговор с владельцем начинается с вопроса — и заход отвечает, не зная, что работа
# уже наполовину сделана. Здесь замысел и ход работы приходят до первой реплики, и владельцу
# не приходится пересказывать то, что уже записано.
#
# Разбор просьбы (`grill.md`) отдаётся путём, а не текстом: он неизменен, объёмен и нужен
# реже остальных.
#
# FAIL-OPEN: нет `jq`, не git-репозиторий, нет папки задачи — выходим молча. Сессия важнее
# контекста.

ROOT="${CLAUDE_PROJECT_DIR:-.}"
command -v jq >/dev/null 2>&1 || exit 0
cd "$ROOT" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "$ROOT/.claude/rt-kit/defaults/project.sh" "$ROOT/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

TASKS_DIR="${RT_TASKS_DIR:-docs/tasks}"
[ -z "$TASKS_DIR" ] && exit 0

DIR="$TASKS_DIR/$branch"
PLAN="$DIR/plan.md"
PROGRESS="$DIR/progress.md"
GRILL="$DIR/grill.md"

emit() {
    jq -Rs '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:.}}' 2>/dev/null
}

# Ветка под задачу без папки — работа идёт мимо. Сессию не рвём: SessionStart, отбивающий
# запуск, оставляет владельца без агента вовсе, а правку кода поймает `task-flow-guard`.
if [ ! -d "$DIR" ]; then
    if command -v rt_task_branch_ok >/dev/null 2>&1 && rt_task_branch_ok "$branch"; then
        {
            printf 'РАБОТА БЕЗ ПАПКИ ЗАДАЧИ.\n\n'
            printf 'Ветка `%s` названа задачей, а `%s/` нет: ход работы записывать некуда,\n' "$branch" "$DIR"
            printf 'и следующий заход начнёт с расспросов владельца.\n\n'
            printf 'Собрать с образца:\n\n    cp -r %s/_template %s\n\n' "$TASKS_DIR" "$DIR"
            printf 'Правку кода приложения до этого отбивает гард. Правило — скил `task-flow`.\n'
        } | emit
    fi
    exit 0
fi

# Порог объёма. Ход работы растёт с каждым заходом, и на десятом заходе целиком он стоит
# дороже, чем даёт. Перевалив порог, отдаём «Где стоим» и последние записи.
LIMIT=40000
size=0
for file in "$PLAN" "$PROGRESS"; do
    [ -f "$file" ] || continue
    size=$((size + $(wc -c <"$file" 2>/dev/null || echo 0)))
done

{
    printf 'СОСТОЯНИЕ РАБОТЫ — ветка `%s`, папка `%s/`.\n\n' "$branch" "$DIR"
    printf 'Это записано прошлыми заходами. Владельца о том, что здесь есть, не спрашивают.\n'
    printf 'Отметка о сделанном — только в `progress.md`; `plan.md` по ходу не правится.\n'
    printf 'Как ведётся работа — правило `task-flow`, возвращение к ней — паттерн `task-flow-resume`.\n\n'

    if [ -f "$GRILL" ]; then
        printf 'Разбор просьбы владельца — `%s`, читается по надобности.\n\n' "$GRILL"
    fi

    if [ -f "$PLAN" ]; then
        printf -- '--- ЗАМЫСЕЛ (`%s`) ---\n\n' "$PLAN"
        if [ "$size" -le "$LIMIT" ]; then
            cat "$PLAN"
        else
            sed -n '1,60p' "$PLAN"
            printf '\n<обрезано по объёму — читается целиком: %s>\n' "$PLAN"
        fi
        printf '\n'
    fi

    if [ -f "$PROGRESS" ]; then
        printf -- '--- ХОД РАБОТЫ (`%s`) ---\n\n' "$PROGRESS"
        if [ "$size" -le "$LIMIT" ]; then
            cat "$PROGRESS"
        else
            # Раздел «Где стоим» перезаписывается каждым заходом и переживает любой объём.
            awk '/^## Где стоим/{f=1} f&&/^## /&&!/^## Где стоим/{exit} f' "$PROGRESS"
            printf '\n<обрезано по объёму. Последние записи:>\n\n'
            tail -40 "$PROGRESS"
            printf '\n<читается целиком: %s>\n' "$PROGRESS"
        fi
    fi
} | emit
