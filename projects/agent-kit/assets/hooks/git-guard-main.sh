#!/usr/bin/env bash
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

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
# Терминал среды разработки исполняет ту же командную строку и кладёт её в то же поле. Пока
# гард проверял только оболочку, весь его смысл обходился сменой инструмента.
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"

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
workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
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

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Коммит в главную ветку отбит. Заведи ветку."}}\n'

exit 0
