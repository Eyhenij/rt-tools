#!/usr/bin/env bash
# rt-kit v0.10.0 · hooks/task-flow-guard.sh · 3a3e2f568fdd · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Требует: hooks/profile-check.sh, hooks/deny-tail.sh
# PreToolUse guard for Edit|Write|MultiEdit: код не пишется раньше замысла.
#
# Работа идёт много заходов, и между ними исполнитель не помнит ничего. Замысел, лежащий на
# диске, — единственное, что переживает перерыв: изменения к этому моменту бывают не
# закоммичены, PR не открыт, а очередь работ показывает задачу начатой и молчит о том, что
# внутри неё сделано.
#
# Гард требует четыре вещи и ровно их: папку задачи по имени ветки, замысел в ней, объявленное
# в ходе работы состояние — из тех, в которых код правится, — и названную в замысле
# договорённость о продукте. Полноту написанного он не судит — это за владельцем (решения в
# законе `docs/constitution/work-conduct.md`).
#
# Состояние судится раньше договорённости и её обхода: обход снимает требование договорённости,
# а не требование дойти до правки кода. Судится объявленный переход, а не наличие файлов —
# артефакт, положенный ради снятия отказа, лежит так же, как написанный.
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

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
# Читается до разбора пути: пути из команды оболочки вынимает как раз профиль.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# Слово о нехватке функции профиля: хук, вышедший молча, неотличим от работающего. Файл может
# быть не разложен — тогда остаётся прежнее поведение, молчаливое.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
candidates=""
case "$tool" in
    # Инструмент редактора заводит файл теми же двумя данными, только называет их иначе —
    # без этой ветки правка шла бы мимо гарда сменой инструмента.
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
        candidates="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        ;;
    # Второй ярус: та же правка, положенная командой оболочки. Без него отказ гарда обходится
    # сменой не инструмента, а способа записи — перенаправлением, `sed -i`, интерпретатором с
    # heredoc. Разбор — `2026-08-15-guard-denied-shell-wrote-anyway.md`.
    #
    # Терминал среды исполняет ту же командную строку и кладёт её в то же поле: без этих двух
    # имён гард стоял бы объявленным на них и молча пропускал — состояние хуже необъявленного,
    # потому что снаружи выглядит закрытым.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
        [ -z "$cmd" ] && exit 0
        # Универсальный исполнитель прячет настоящую команду во вложенной строке: без её разбора
        # путь стоит за кавычкой, и до него не дотягивается ни один образец.
        if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
            inner="$(printf '%s' "$cmd" | perl -0ne '
                if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
                    print defined $1 ? $1 : (defined $2 ? $2 : $3);
                }
            ' 2>/dev/null)"
            [ -n "$inner" ] && cmd="$inner"
        fi
        rt_needs rt_shell_writes task-flow-guard || exit 0
        rt_needs rt_shell_paths task-flow-guard || exit 0
        rt_shell_writes "$cmd" || exit 0
        candidates="$(rt_shell_paths "$cmd")"
        ;;
    *) exit 0 ;;
esac
[ -z "$candidates" ] && exit 0

# Признак «правка меняет поведение» — путь, а не оценка на глаз: оценку назначает тот, кому
# она мешает, и порог плывёт. Где живёт код приложения, знает профиль: правила, тексты, обвязка
# и зависимости под требование не попадают — иначе разбор задачи нельзя было бы вести до
# заведения ветки.
rt_needs rt_is_app_code task-flow-guard || exit 0

# Судится каждый названный путь: команда пишет столько файлов, сколько в ней стоит, и одного
# под требованием довольно, чтобы отбить её целиком.
path=""
while IFS= read -r candidate; do
    [ -z "$candidate" ] && continue
    case "$candidate" in
        /*) ;;
        *) candidate="${CLAUDE_PROJECT_DIR:-.}/$candidate" ;;
    esac
    if rt_is_app_code "$candidate"; then
        path="$candidate"
        break
    fi
done <<EOF
$candidates
EOF
[ -z "$path" ] && exit 0

# Каталог папок задач: у дерева он свой, но имя обычно общее.
tasks_dir="${RT_TASKS_DIR:-docs/tasks}"

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть. Файл
# может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh"
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

# Отказ: причина первым параметром, законная форма обхода — вторым. Хвост дописывается здесь, а
# не в каждом тексте: пропущенный в одном месте, он читается как «у этого отказа ходов нет».
deny() {
    reason="$1"
    tail_text="$(rt_deny_tail "$2")"
    [ -n "$tail_text" ] && reason="$1 ${tail_text}"
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$reason"
    exit 0
}

# Ветку смотрим там же, где пойдёт правка: у worktree она своя.
workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0   # detached HEAD — не про наш случай

if rt_needs rt_task_branch_ok task-flow-guard && ! rt_task_branch_ok "$branch"; then
    deny "BLOCKED by task-flow: правка кода идёт в ветке под задачу, а текущая ветка — '${branch}'. Заведи задачу (npm run task:new -- --title '…' --slug <slug>) и ветку под её номером, затем повтори. Правило — скил task-flow."
fi

root="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -z "$root" ] && exit 0
dir="$root/$tasks_dir/$branch"
plan="$dir/plan.md"

if [ ! -f "$plan" ]; then
    deny "BLOCKED by task-flow: нет замысла — '${tasks_dir}/${branch}/plan.md'. Собери папку задачи с образца (cp -r ${tasks_dir}/_template ${tasks_dir}/${branch}) и заполни шапку, след задачи и этапы, затем повтори. Правило — скил task-flow."
fi

# Состояние работы. Артефакт на диске не говорит, дошла ли работа до правки кода: пустой
# `plan.md`, положенный ради снятия отказа, лежит точно так же, как написанный замысел, и
# требование снимает сам собой. Единица работы — состояние, а не файл: исполнитель объявляет
# его строкой в ходе работы, гард судит объявленный переход, а не наличие файлов.
#
# Состояние стоит в разделе «Где стоим» и перезаписывается вместе с ним. Имя берётся из
# перечня — своё имя состоянием не является: перечень называет вход, выход и обязательное
# действие каждого, и слово вне перечня не говорит ни о чём из трёх.
progress="$dir/progress.md"

if [ ! -f "$progress" ]; then
    deny "BLOCKED by task-flow: нет хода работы — '${tasks_dir}/${branch}/progress.md'. В нём объявляется состояние работы, и без него не видно, дошла ли она до правки кода. Собери папку задачи с образца (cp -r ${tasks_dir}/_template ${tasks_dir}/${branch}), затем повтори. Правило — скил task-flow."
fi

state="$(sed -n 's/^[[:space:]]*[-*][[:space:]]*\*\*Состояние:\*\*[[:space:]]*`\([^`]*\)`.*/\1/p' "$progress" 2>/dev/null | head -1)"

# Обязательное действие состояния. Отказ называет его целиком: исполнитель, которому сказано
# только «не в том состоянии», переписывает строку состояния вместо того, чтобы сделать шаг.
state_action() {
    case "$1" in
        просьба-не-разобрана) printf '%s' 'разведка по дереву, затем вопросы владельцу' ;;
        разбор-закрыт) printf '%s' 'договорённость о продукте либо названная причина её отсутствия' ;;
        договорённость-записана) printf '%s' 'завести задачу, ветку и папку задачи' ;;
        задача-взята) printf '%s' 'написать замысел' ;;
        замысел-записан) printf '%s' 'делать первый этап' ;;
        папка-разобрана) printf '%s' 'снять черновик и попросить владельца влить' ;;
        влито) printf '%s' 'разбор работы правилами и сверка очереди работ' ;;
        *) printf '%s' '' ;;
    esac
}

if [ -z "$state" ]; then
    deny "BLOCKED by task-flow: в '${tasks_dir}/${branch}/progress.md' не объявлено состояние работы. Впиши в раздел «Где стоим» строку '- **Состояние:** \`<имя>\`' — имя из перечня состояний правила, — затем повтори. Код правится в состояниях 'этап-идёт', 'этапы-кончились', 'работа-отдана' и 'разбор-кончился'. Правило — скил task-flow."
fi

case "$state" in
    # Состояния, в которых код приложения правится. Три последних — не про первый заход:
    # прогон бывает красным, а разбор — с замечаниями, и починка идёт в ту же ветку.
    этап-идёт | этапы-кончились | работа-отдана | разбор-кончился) ;;
    просьба-не-разобрана | разбор-закрыт | договорённость-записана | задача-взята | замысел-записан | папка-разобрана | влито)
        deny "BLOCKED by task-flow: в ходе работы объявлено состояние '${state}', а код в нём не правится. Обязательное действие этого состояния — $(state_action "$state"). Дошла работа до правки кода — перепиши строку состояния в '${tasks_dir}/${branch}/progress.md' на '- **Состояние:** \`этап-идёт\`'. Правило — скил task-flow."
        ;;
    *)
        deny "BLOCKED by task-flow: в '${tasks_dir}/${branch}/progress.md' объявлено состояние '${state}', а такого в перечне нет. Имя берётся из перечня состояний правила — своё слово не говорит ни о входе, ни о выходе, ни об обязательном действии. Правило — скил task-flow."
        ;;
esac

# Строка обхода: поведение не меняется, договорённость о продукте не нужна. Причина обязана
# стоять — без неё обход становится умолчанием.
if grep -qE '^\*\*Поведение:\*\*[[:space:]]*не меняется[[:space:]]*—[[:space:]]*\S' "$plan" 2>/dev/null; then
    exit 0
fi

draft="$(sed -n 's/^\*\*Драфт:\*\*[[:space:]]*`\([^`]*\)`.*/\1/p' "$plan" 2>/dev/null | head -1)"

if [ -z "$draft" ]; then
    deny "BLOCKED by task-flow: в '${tasks_dir}/${branch}/plan.md' не названа договорённость о продукте. Заведи её в docs/specs/<домен>/proposed/<фича>/ и укажи строкой '**Драфт:** \`путь\`'. Правило — скил task-flow." \
        "строка '**Поведение:** не меняется — <причина владельца>' в замысле; пустая причина не принимается"
fi

case "$draft" in
    /*) draft_path="$draft" ;;
    *) draft_path="$root/$draft" ;;
esac

if [ -e "$draft_path" ]; then
    exit 0
fi

# Договорённость, влитая в спек домена, с диска уходит — так и задумано: в главной ветке
# директории «предложено» быть не должно. Но замысел на неё ссылается до конца работы, и без
# этой развилки последний коммит PR запирал бы ветку: ни правки по замечаниям разбора, ни
# записи в журнал изменений после вливания уже не сделать.
#
# Влитое от незаведённого отличает история ветки: путь, которого в ней никогда не было,
# договорённостью не был. Спросить об этом нечем, кроме git, поэтому нет git — отказ остаётся.
if git -C "$root" log --oneline -1 -- "$draft" 2>/dev/null | grep -q .; then
    exit 0
fi

deny "BLOCKED by task-flow: замысел называет договорённость '${draft}', а её на диске нет и в истории ветки не было. Заведи её с образца (docs/specs/_template) или поправь путь в '${tasks_dir}/${branch}/plan.md'. Правило — скил task-flow."
