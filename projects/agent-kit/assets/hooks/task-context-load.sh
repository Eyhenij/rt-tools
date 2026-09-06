#!/usr/bin/env bash
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
            printf 'WORK IS CLOSING — the task folder has been taken apart by this branch.\n\n'
            printf 'The progress was removed with the folder: the state is held by the PR and the session handover.\n'
            printf 'The folder is not rebuilt. A code edit after the folder was taken apart requires restoring it\n'
            printf 'for the time of the edit and taking it apart again in the same commit. The order — skill `task-flow`,\n'
            printf 'patterns `task-flow-close` and `task-flow-archive`.\n'
        } | emit
        exit 0
    fi

    if rt_needs rt_task_branch_ok task-context-load && rt_task_branch_ok "$branch"; then
        {
            printf 'WORK WITHOUT A TASK FOLDER.\n\n'
            printf 'Branch `%s` is named after a task, and `%s/` is missing: there is nowhere to write the progress,\n' "$branch" "$DIR"
            printf 'and the next session will start by questioning the owner.\n\n'
            printf 'Build it from the template:\n\n    cp -r %s/_template %s\n\n' "$TASKS_DIR" "$DIR"
            # Папка бывает названа не именем ветки: этапы одной большой задачи идут отдельными
            # ветками при одной общей папке. Названная поимённо папка — единственное, по чему
            # заход её найдёт; иначе он читает отказ как «записей нет» и отвечает владельцу из
            # кода, минуя всё, что в этих записях решено.
            others="$(find "$TASKS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name '_template' 2>/dev/null | sort)"
            if [ -n "$others" ]; then
                printf 'The tasks directory meanwhile holds:\n\n%s\n\n' "$others"
                printf 'Stages of one task go as separate branches with a shared folder: before\n'
                printf 'concluding that there are no records, look into the folders named above.\n\n'
            fi
            # О соседнем ресурсе — условно и по имени: пакет не знает, разложен ли он здесь,
            # а сказанное безусловно приходит в контекст каждой сессии и врёт про дерево тем
            # увереннее, что печатает это сам инструмент.
            if [ -f "$rt_hooks_dir/task-flow-guard.sh" ]; then
                printf 'Until then, an application code edit is refused by guard `task-flow-guard`. The rule — skill `task-flow`.\n'
            else
                printf 'The rule — skill `task-flow`. Guard `task-flow-guard` is not in this tree: nothing refuses a code edit until then.\n'
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
    printf 'WORK STATE — branch `%s`, folder `%s/`.\n\n' "$branch" "$DIR"
    printf 'This was written by previous sessions. The owner is not asked about what is here.\n'
    printf 'Done work is marked only in `progress.md`; `plan.md` is not edited along the way.\n'
    printf 'How work is conducted — rule `task-flow`; returning to it — pattern `task-flow-resume`.\n\n'

    if [ -f "$GRILL" ]; then
        printf 'The grill of the owner'"'"'s request — `%s`, read when needed.\n\n' "$GRILL"
    fi

    if [ -f "$PLAN" ]; then
        printf -- '--- PLAN (`%s`) ---\n\n' "$PLAN"
        if [ "$size" -le "$LIMIT" ]; then
            cat "$PLAN"
        else
            sed -n '1,60p' "$PLAN"
            printf '\n<cut for size — read in full: %s>\n' "$PLAN"
        fi
        printf '\n'
    fi

    if [ -f "$PROGRESS" ]; then
        printf -- '--- PROGRESS (`%s`) ---\n\n' "$PROGRESS"
        if [ "$size" -le "$LIMIT" ]; then
            cat "$PROGRESS"
        else
            # Раздел «Где стоим» перезаписывается каждым заходом и переживает любой объём.
            LC_ALL=C awk '/^## Где стоим/{f=1} f&&/^## /&&!/^## Где стоим/{exit} f' "$PROGRESS"
            printf '\n<cut for size. The latest entries:>\n\n'
            tail -40 "$PROGRESS"
            printf '\n<read in full: %s>\n' "$PROGRESS"
        fi
    fi
} | emit
