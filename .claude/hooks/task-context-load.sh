#!/usr/bin/env bash
# rt-kit v0.19.0 · hooks/task-context-load.sh · fdd123440694 · правится надстройкой, не здесь
# rt-hook: SessionStart startup|resume|compact|clear
# Требует: hooks/profile-check.sh
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

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

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

# Слово о нехватке функции профиля: хук, вышедший молча, неотличим от работающего. Файл может
# быть не разложен — тогда остаётся прежнее поведение, молчаливое.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

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
    # Папки нет по двум разным причинам, и говорить о них надо разное. Первая — работа шла мимо
    # правила. Вторая — папку разобрала сама ветка последним коммитом перед заявкой: это законный
    # исход, и указание собрать её заново уводит заход с хвоста работы обратно в её начало.
    #
    # Различает их история ветки: снос папки её же коммитом после общего предка с главной. Ход
    # работы к этой минуте уехал вместе с папкой, и состояние держат заявка и передача захода.
    main_branch="${RT_MAIN_BRANCH:-main}"
    base="$(git merge-base "origin/${main_branch}" HEAD 2>/dev/null || git merge-base "$main_branch" HEAD 2>/dev/null)"
    dropped=''
    [ -n "$base" ] && dropped="$(git log "${base}..HEAD" --diff-filter=D --name-only --pretty=format: -- "$DIR" 2>/dev/null | head -1)"

    if [ -n "$dropped" ]; then
        {
            printf 'РАБОТА ЗАКРЫВАЕТСЯ — папка задачи разобрана этой веткой.\n\n'
            printf 'Ход работы удалён вместе с папкой: состояние держат заявка и передача захода.\n'
            printf 'Папка заново не собирается. Правка кода после разбора требует восстановить её\n'
            printf 'на время правки и повторить разбор тем же коммитом. Порядок — скил `task-flow`,\n'
            printf 'паттерны `task-flow-close` и `task-flow-archive`.\n'
        } | emit
        exit 0
    fi

    if rt_needs rt_task_branch_ok task-context-load && rt_task_branch_ok "$branch"; then
        {
            printf 'РАБОТА БЕЗ ПАПКИ ЗАДАЧИ.\n\n'
            printf 'Ветка `%s` названа задачей, а `%s/` нет: ход работы записывать некуда,\n' "$branch" "$DIR"
            printf 'и следующий заход начнёт с расспросов владельца.\n\n'
            printf 'Собрать с образца:\n\n    cp -r %s/_template %s\n\n' "$TASKS_DIR" "$DIR"
            # Папка бывает названа не именем ветки: этапы одной большой задачи идут отдельными
            # ветками при одной общей папке. Названная поимённо папка — единственное, по чему
            # заход её найдёт; иначе он читает отказ как «записей нет» и отвечает владельцу из
            # кода, минуя всё, что в этих записях решено.
            others="$(find "$TASKS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name '_template' 2>/dev/null | sort)"
            if [ -n "$others" ]; then
                printf 'В каталоге задач при этом лежит:\n\n%s\n\n' "$others"
                printf 'Этапы одной задачи идут отдельными ветками при общей папке — прежде чем\n'
                printf 'считать, что записей нет, смотрят в названные.\n\n'
            fi
            # О соседнем ресурсе — условно и по имени: пакет не знает, разложен ли он здесь,
            # а сказанное безусловно приходит в контекст каждой сессии и врёт про дерево тем
            # увереннее, что печатает это сам инструмент.
            if [ -f "$rt_hooks_dir/task-flow-guard.sh" ]; then
                printf 'Правку кода приложения до этого отбивает гард `task-flow-guard`. Правило — скил `task-flow`.\n'
            else
                printf 'Правило — скил `task-flow`. Гарда `task-flow-guard` в дереве нет: правку кода до этого не отбивает ничто.\n'
            fi
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
