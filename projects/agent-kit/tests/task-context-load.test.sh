#!/usr/bin/env bash
# Сценарии загрузки хода работы на старте сессии.
#
# Проверяется механика поиска папки: хук ищет её по имени ветки, а папка бывает названа иначе —
# этапы одной большой задачи идут отдельными ветками при одной общей папке. Не найдя своей, хук
# обязан назвать те, что лежат рядом: иначе заход читает отказ как «записей нет» и отвечает
# владельцу из кода, минуя всё, что в этих записях решено.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "загрузка хода работы"

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

# Дерево с репозиторием на ветке задачи: хук берёт ветку у git и папку ищет от корня дерева.
tree_on() {
    local dir
    dir="$(mktemp -d "$TMP/tree.XXXXXX")"
    git -C "$dir" init -q 2>/dev/null
    git -C "$dir" config commit.gpgsign false 2>/dev/null
    git -C "$dir" checkout -q -b "$1" 2>/dev/null
    mkdir -p "$dir/docs/tasks" "$dir/.claude/rt-kit/defaults"
    # Профиль дерева: форму ветки задачи хук спрашивает у него, и без профиля отказ молчит.
    cp "$DEFAULTS/project.sh" "$dir/.claude/rt-kit/defaults/project.sh"
    printf '%s' "$dir"
}

# Что хук отдал сессии: текст контекста, вынутый из его ответа.
said() {
    CLAUDE_PROJECT_DIR="$1" bash "$HOOKS/task-context-load.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null
}

# SC-AK-721. Папка названа именем ветки — отдаётся ход работы, а не отказ.
tree="$(tree_on RT-1-own-folder)"
mkdir -p "$tree/docs/tasks/RT-1-own-folder"
printf '# Замысел\n\nтело\n' > "$tree/docs/tasks/RT-1-own-folder/plan.md"
printf '# Где стоим\n\n- **Состояние:** `этап-идёт`\n' > "$tree/docs/tasks/RT-1-own-folder/progress.md"
case "$(said "$tree")" in
    *WORK\ STATE*) report "SC-AK-721 — папка по имени ветки найдена" да да ;;
    *) report "SC-AK-721 — папка по имени ветки найдена" "$(said "$tree")" да ;;
esac

# SC-AK-722. Папка названа иначе — хук называет её поимённо, а не молчит о ней.
tree="$(tree_on RT-2-second-stage)"
mkdir -p "$tree/docs/tasks/RT-2-shared-epic-folder"
out="$(said "$tree")"
case "$out" in
    *RT-2-shared-epic-folder*) report "SC-AK-722 — соседняя папка названа" да да ;;
    *) report "SC-AK-722 — соседняя папка названа" "$out" да ;;
esac
case "$out" in
    *WORK\ WITHOUT\ A\ TASK\ FOLDER*) report "SC-AK-722 — отказ остался отказом" да да ;;
    *) report "SC-AK-722 — отказ остался отказом" "$out" да ;;
esac

# Образец папок в перечень не попадает: он лежит у всякого дерева и задачей не является.
tree="$(tree_on RT-3-template-not-counted)"
mkdir -p "$tree/docs/tasks/_template"
out="$(said "$tree")"
case "$out" in
    *'В каталоге задач при этом лежит'*) report "образец в перечень не попал" "$out" '' ;;
    *) report "образец в перечень не попал" да да ;;
esac

# SC-AK-723. Каталог задач пуст — отказ прежний, слово в слово: называть нечего.
tree="$(tree_on RT-4-empty-dir)"
out="$(said "$tree")"
case "$out" in
    *'В каталоге задач при этом лежит'*) report "SC-AK-723 — пустой каталог не перечисляется" "$out" '' ;;
    *) report "SC-AK-723 — пустой каталог не перечисляется" да да ;;
esac

# SC-AK-754. Папку разобрала сама ветка — хук говорит о закрывающейся работе, а не велит
# собрать её заново. Признак берётся в истории: снос папки коммитом ветки после общего предка
# с главной.
tree="$(tree_on main)"
mkdir -p "$tree/docs/tasks/RT-5-closing"
printf '# Замысел\n\nтело\n' > "$tree/docs/tasks/RT-5-closing/plan.md"
git -C "$tree" add -A >/dev/null 2>&1
git -C "$tree" -c user.name=probe -c user.email=probe@example commit -qm 'папка задачи' >/dev/null 2>&1
git -C "$tree" checkout -q -b RT-5-closing 2>/dev/null
git -C "$tree" rm -rq docs/tasks/RT-5-closing >/dev/null 2>&1
git -C "$tree" -c user.name=probe -c user.email=probe@example commit -qm 'папка разобрана' >/dev/null 2>&1
out="$(said "$tree")"
case "$out" in
    *'WORK IS CLOSING'*) report "SC-AK-754 — разобранная папка названа закрытием работы" да да ;;
    *) report "SC-AK-754 — разобранная папка названа закрытием работы" "$out" да ;;
esac
case "$out" in
    *'WORK WITHOUT A TASK FOLDER'*) report "SC-AK-754 — указания собрать папку заново нет" "$out" '' ;;
    *) report "SC-AK-754 — указания собрать папку заново нет" да да ;;
esac

# Ветка, которая папку не заводила вовсе, судится прежним отказом: сносить было нечего.
tree="$(tree_on main)"
mkdir -p "$tree/docs/tasks/RT-6-other"
printf '# Замысел\n' > "$tree/docs/tasks/RT-6-other/plan.md"
git -C "$tree" add -A >/dev/null 2>&1
git -C "$tree" -c user.name=probe -c user.email=probe@example commit -qm 'чужая папка' >/dev/null 2>&1
git -C "$tree" checkout -q -b RT-7-never-had 2>/dev/null
case "$(said "$tree")" in
    *'WORK WITHOUT A TASK FOLDER'*) report "SC-AK-754 — ветка без своей папки судится прежним отказом" да да ;;
    *) report "SC-AK-754 — ветка без своей папки судится прежним отказом" "$(said "$tree")" да ;;
esac

suite_result "загрузка хода работы"
