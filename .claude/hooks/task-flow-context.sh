#!/usr/bin/env bash
# rt-kit v0.16.1 · hooks/task-flow-context.sh · b71e9590bbd3 · правится надстройкой, не здесь
# Общий разбор для гардов хода работы. НЕ гард: объявления `rt-hook:` у него нет, к событиям
# агента он не подключается. Его источают сами гарды — тем же приёмом, каким они источают общий
# хвост отказа.
#
# Зачем он есть. Требования к ходу работы стоят двумя гардами — папка задачи с замыслом и
# состоянием отдельно, договорённость о продукте отдельно, — а разбор у обоих один и тот же:
# какой путь пишет вызов, код ли это приложения, в какой ветке идёт правка и где лежит папка
# задачи. Разложенный вторым разом, этот разбор расходится молча: правка одного гарда чинит
# половину случаев, и видно это только там, где второй промолчал.
#
# ЧТО ОН ДЕЛАЕТ. Читает ввод, поднимает профиль дерева, вынимает из вызова пути, отбирает среди
# них первый путь кода приложения, переходит в рабочий каталог правки и называет ветку, корень,
# каталог папок задач, саму папку и замысел в ней.
#
# ЧЕГО ОН НЕ ДЕЛАЕТ. Он ничего не судит и ничего не отбивает: имя ветки, наличие папки, состояние
# работы и договорённость — дело самих гардов, и отказ печатает тот, чьё это требование.
#
# FAIL-OPEN: нет jq, не git-репозиторий, битый ввод, чужой инструмент, нет функции профиля →
# ответ «судить нечего». Сломанный разбор не должен мешать работать.

# Разбор вызова. Возвращает 0 и ставит переменные, если правка касается кода приложения в ветке
# с историей; иначе — ненулевой код, и гард выходит молча.
#
#   RT_TF_PATH        — путь кода приложения, из-за которого гард вообще судит
#   RT_TF_BRANCH      — текущая ветка рабочего каталога правки
#   RT_TF_ROOT        — корень рабочего дерева
#   RT_TF_TASKS_DIR   — каталог папок задач, как он назван в дереве
#   RT_TF_MAIN_BRANCH — главная ветка дерева
#   RT_TF_DIR         — папка этой задачи
#   RT_TF_PLAN        — замысел в ней
rt_task_flow_context() {
    rt_tf_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    # shellcheck disable=SC1090
    . "$rt_tf_hooks_dir/utf8.sh" 2>/dev/null || true
    # shellcheck disable=SC1090
    . "$rt_tf_hooks_dir/hook-input.sh" 2>/dev/null || true

    command -v rt_hook_read >/dev/null 2>&1 || return 1
    rt_hook_read
    [ -z "$RT_HOOK_INPUT" ] && return 1
    command -v jq >/dev/null 2>&1 || return 1

    # Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
    # Читается до разбора пути: пути из команды оболочки вынимает как раз профиль.
    for rt_tf_profile in \
        "$rt_tf_hooks_dir/../rt-kit/defaults/project.sh" \
        "$rt_tf_hooks_dir/../defaults/project.sh" \
        "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" \
        "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
        # shellcheck disable=SC1090
        [ -f "$rt_tf_profile" ] && . "$rt_tf_profile" 2>/dev/null
    done

    # Слово о нехватке функции профиля: хук, вышедший молча, неотличим от работающего. Файл может
    # быть не разложен — тогда остаётся прежнее поведение, молчаливое.
    # shellcheck disable=SC1090
    [ -f "$rt_tf_hooks_dir/profile-check.sh" ] && . "$rt_tf_hooks_dir/profile-check.sh"
    command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

    rt_tf_tool="$(rt_hook_tool)"
    rt_tf_candidates=""
    case "$rt_tf_tool" in
        # Инструмент редактора заводит файл теми же двумя данными, только называет их иначе —
        # без этой ветки правка шла бы мимо гарда сменой инструмента.
        Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
            rt_tf_candidates="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
            ;;
        # Второй ярус: та же правка, положенная командой оболочки. Без него отказ гарда обходится
        # сменой не инструмента, а способа записи — перенаправлением, `sed -i`, интерпретатором с
        # heredoc.
        #
        # Терминал среды исполняет ту же командную строку и кладёт её в то же поле: без этих двух
        # имён гард стоял бы объявленным на них и молча пропускал — состояние хуже необъявленного,
        # потому что снаружи выглядит закрытым.
        Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
            rt_tf_cmd="$(rt_hook_cmd)"
            [ -z "$rt_tf_cmd" ] && return 1
            # Универсальный исполнитель прячет настоящую команду во вложенной строке: без её
            # разбора путь стоит за кавычкой, и до него не дотягивается ни один образец.
            if [ "$rt_tf_tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
                rt_tf_inner="$(printf '%s' "$rt_tf_cmd" | perl -0ne '
                    if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
                        print defined $1 ? $1 : (defined $2 ? $2 : $3);
                    }
                ' 2>/dev/null)"
                [ -n "$rt_tf_inner" ] && rt_tf_cmd="$rt_tf_inner"
            fi
            rt_needs rt_shell_writes task-flow-guard || return 1
            rt_needs rt_shell_paths task-flow-guard || return 1
            rt_shell_writes "$rt_tf_cmd" || return 1
            rt_tf_candidates="$(rt_shell_paths "$rt_tf_cmd")"
            ;;
        *) return 1 ;;
    esac
    [ -z "$rt_tf_candidates" ] && return 1

    # Признак «правка меняет поведение» — путь, а не оценка на глаз: оценку назначает тот, кому
    # она мешает, и порог плывёт. Где живёт код приложения, знает профиль: правила, тексты,
    # обвязка и зависимости под требование не попадают — иначе разбор задачи нельзя было бы
    # вести до заведения ветки.
    rt_needs rt_is_app_code task-flow-guard || return 1

    # Судится каждый названный путь: команда пишет столько файлов, сколько в ней стоит, и одного
    # под требованием довольно, чтобы отбить её целиком.
    RT_TF_PATH=""
    while IFS= read -r rt_tf_candidate; do
        [ -z "$rt_tf_candidate" ] && continue
        case "$rt_tf_candidate" in
            /*) ;;
            *) rt_tf_candidate="${CLAUDE_PROJECT_DIR:-.}/$rt_tf_candidate" ;;
        esac
        if rt_is_app_code "$rt_tf_candidate"; then
            RT_TF_PATH="$rt_tf_candidate"
            break
        fi
    done <<EOF
$rt_tf_candidates
EOF
    [ -z "$RT_TF_PATH" ] && return 1

    # Ветку смотрим там, где пойдёт правка: у worktree она своя.
    rt_tf_workdir="$(rt_hook_cwd)"
    [ -z "$rt_tf_workdir" ] && rt_tf_workdir="${CLAUDE_PROJECT_DIR:-.}"
    cd "$rt_tf_workdir" 2>/dev/null || return 1
    git rev-parse --is-inside-work-tree >/dev/null 2>&1 || return 1

    RT_TF_BRANCH="$(git branch --show-current 2>/dev/null)"
    [ -z "$RT_TF_BRANCH" ] && return 1   # detached HEAD — не про наш случай

    RT_TF_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
    [ -z "$RT_TF_ROOT" ] && return 1

    # Каталог папок задач: у дерева он свой, но имя обычно общее.
    RT_TF_TASKS_DIR="${RT_TASKS_DIR:-docs/tasks}"
    RT_TF_MAIN_BRANCH="${RT_MAIN_BRANCH:-main}"
    RT_TF_DIR="$RT_TF_ROOT/$RT_TF_TASKS_DIR/$RT_TF_BRANCH"
    RT_TF_PLAN="$RT_TF_DIR/plan.md"

    return 0
}

# Отказ гарда хода работы: причина первым параметром, законная форма обхода — вторым. Хвост
# дописывается здесь, а не в каждом тексте: пропущенный в одном месте, он читается как «у этого
# отказа ходов нет». Хвост может быть не разложен — тогда его нет, а причина остаётся прежней.
rt_task_flow_deny() {
    rt_tf_reason="$1"
    if command -v rt_deny_tail >/dev/null 2>&1; then
        rt_tf_tail="$(rt_deny_tail "$2")"
        [ -n "$rt_tf_tail" ] && rt_tf_reason="$1 ${rt_tf_tail}"
    fi
    jq -n --arg r "$rt_tf_reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$rt_tf_reason"
    exit 0
}
