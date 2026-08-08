#!/usr/bin/env bash
# PreToolUse guard for Edit|Write|MultiEdit: код не пишется раньше замысла.
#
# Работа идёт много заходов, и между ними исполнитель не помнит ничего. Замысел, лежащий на
# диске, — единственное, что переживает перерыв: изменения к этому моменту бывают не
# закоммичены, отчёт не открыт, а очередь работ показывает задачу начатой и молчит о том, что
# внутри неё сделано.
#
# Гард требует три вещи и ровно их: папку задачи по имени ветки, замысел в ней и названную в
# замысле договорённость о продукте. Полноту написанного он не судит — это за владельцем
# (решения в законе `docs/constitution/work-conduct.md`).
#
# Правило целиком — скил `task-flow`.
#
# Осознанный выход есть: строка `**Поведение:** не меняется — <причина>` в замысле снимает
# требование договорённости. Пустая причина не принимается, как и у `Docs-skip:`.
#
# FAIL-OPEN: нет jq, не git-репозиторий, битый ввод, чужой инструмент → пропуск. Сломанный
# гард не должен мешать работать.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    # Инструмент редактора заводит файл теми же двумя данными, только называет их иначе —
    # без этой ветки правка шла бы мимо гарда сменой инструмента.
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file) ;;
    *) exit 0 ;;
esac

path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
[ -z "$path" ] && exit 0
case "$path" in
    /*) ;;
    ?*) path="${CLAUDE_PROJECT_DIR:-.}/$path" ;;
esac

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# Признак «правка меняет поведение» — путь, а не оценка на глаз: оценку назначает тот, кому
# она мешает, и порог плывёт. Где живёт код приложения, знает профиль: правила, тексты, обвязка
# и зависимости под требование не попадают — иначе разбор задачи нельзя было бы вести до
# заведения ветки.
command -v rt_is_app_code >/dev/null 2>&1 || exit 0
rt_is_app_code "$path" || exit 0

# Каталог папок задач: у дерева он свой, но имя обычно общее.
tasks_dir="${RT_TASKS_DIR:-docs/tasks}"

deny() {
    jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$1"
    exit 0
}

# Ветку смотрим там же, где пойдёт правка: у worktree она своя.
workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0   # detached HEAD — не про наш случай

if command -v rt_task_branch_ok >/dev/null 2>&1 && ! rt_task_branch_ok "$branch"; then
    deny "BLOCKED by task-flow: правка кода идёт в ветке под задачу, а текущая ветка — '${branch}'. Заведи задачу (npm run task:new -- --title '…' --slug <slug>) и ветку под её номером, затем повтори. Правило — скил task-flow."
fi

root="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -z "$root" ] && exit 0
dir="$root/$tasks_dir/$branch"
plan="$dir/plan.md"

if [ ! -f "$plan" ]; then
    deny "BLOCKED by task-flow: нет замысла — '${tasks_dir}/${branch}/plan.md'. Собери папку задачи с образца (cp -r ${tasks_dir}/_template ${tasks_dir}/${branch}) и заполни шапку, след задачи и этапы, затем повтори. Правило — скил task-flow."
fi

# Строка обхода: поведение не меняется, договорённость о продукте не нужна. Причина обязана
# стоять — без неё обход становится умолчанием.
if grep -qE '^\*\*Поведение:\*\*[[:space:]]*не меняется[[:space:]]*—[[:space:]]*\S' "$plan" 2>/dev/null; then
    exit 0
fi

draft="$(sed -n 's/^\*\*Драфт:\*\*[[:space:]]*`\([^`]*\)`.*/\1/p' "$plan" 2>/dev/null | head -1)"

if [ -z "$draft" ]; then
    deny "BLOCKED by task-flow: в '${tasks_dir}/${branch}/plan.md' не названа договорённость о продукте. Заведи её в docs/specs/<домен>/proposed/<фича>/ и укажи строкой '**Драфт:** \`путь\`'. Если правка поведения не меняет — поставь '**Поведение:** не меняется — <причина владельца>'. Правило — скил task-flow."
fi

case "$draft" in
    /*) draft_path="$draft" ;;
    *) draft_path="$root/$draft" ;;
esac

if [ ! -e "$draft_path" ]; then
    deny "BLOCKED by task-flow: замысел называет договорённость '${draft}', а её на диске нет. Заведи её с образца (docs/specs/_template) или поправь путь в '${tasks_dir}/${branch}/plan.md'. Правило — скил task-flow."
fi

exit 0
