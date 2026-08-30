#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Требует: hooks/deny-tail.sh, hooks/guard-note.sh
# Гард главной ветки. PreToolUse на вызове коммита.
#
# Коммит в главную ветку минует ветку, PR и разбор, а поставка построена на них целиком —
# правило `git-workflow`. Прямой коммит туда почти всегда промах: «остался на главной после
# слияния предыдущего PR».
#
# Имя главной ветки не зашито строкой: сначала спрашивается указатель удалённого репозитория,
# затем пробуются существующие `origin/main` и `origin/master`, и лишь в конце берётся `main`.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: не репозиторий, нет гита, открепившийся HEAD, битый ввод — пропуск.
# Сломанный гард не должен мешать работать.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

tool="$(rt_hook_tool)"
# Терминал среды разработки исполняет ту же командную строку и кладёт её в то же поле. Пока
# гард проверял только оболочку, весь его смысл обходился сменой инструмента.
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"

# Универсальный исполнитель среды передаёт настоящую команду вложенной строкой. Разбирать надо
# её, а не обёртку: иначе имя команды стоит сразу за кавычкой и ни одно правило до него не
# дотягивается.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi
case "$cmd" in
    *git\ commit*) ;;
    *) exit 0 ;;
esac

# Коммит выполнится в рабочем каталоге вызова, поэтому и ветку смотрим там же; корень проекта
# — запасной вариант, и он важен для отдельного рабочего дерева, где ветка своя.
workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0   # открепившийся HEAD — не про этот случай

default="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##')"
if [ -z "$default" ]; then
    for candidate in main master; do
        if git show-ref --verify --quiet "refs/remotes/origin/$candidate" 2>/dev/null; then
            default="$candidate"
            break
        fi
    done
fi
[ -z "$default" ] && default="main"

[ "$branch" = "$default" ] || exit 0

reason="Отбито: коммит прямо в «${default}». Работа едет через ветку и PR — правило git-workflow. Заведи ветку отдельным вызовом и коммить в неё: подготовленные изменения при этом сохранятся. Если коммит в ${default} действительно нужен — спроси владельца, сам не обходи."

# Отказ — наблюдение. Имя главной ветки в него не идёт: у деревьев оно своё, а счёт отказов
# одинаков везде.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/guard-note.sh" ] && . "$rt_hooks_dir/guard-note.sh" 2>/dev/null
command -v rt_guard_note >/dev/null 2>&1 && rt_guard_note git-guard-main "$input"

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть.
# Файл может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Коммит в главную ветку отбит. Заведи ветку."}}\n'

exit 0
