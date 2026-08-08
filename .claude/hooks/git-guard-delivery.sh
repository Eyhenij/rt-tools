#!/usr/bin/env bash
# rt-kit v0.3.0 · hooks/git-guard-delivery.sh · 0eb665e08aa8 · правится надстройкой, не здесь
# Гард поставки. PreToolUse на заведении ветки и открытии PR.
#
# Закон о поставке требует трёх вещей, которых обычно не проверяет ничто: правка начинается с
# задачи, видимой в очереди работ; задача, ветка и отчёт несут один номер; у задачи есть
# исполнитель. Держатся они памятью — и не удерживаются: задачи стоят вне очереди, исполнитель
# не проставлен, а большинство влитых PR приходит с веток, за которыми задачи не стояло вовсе.
#
# Гард стоит в двух точках, и в каждой требует того, что в этот момент исправимо:
#
#   заведение ветки — имя с номером разбирается на месте; имя без номера пропускается:
#       локальная ветка под пробу законна, в главную она не поедет, потому что PR с неё не
#       откроется;
#   открытие PR — ветка обязана нести номер, а заголовок — начинаться с того же номера.
#
# Форму имени ветки и номер в заголовке знает профиль проекта: .claude/rt-kit/project.sh, функция
# `rt_task_branch_ok <имя>` и переменная RT_TASK_TITLE_RE. Нет профиля — гард пропускает: форму
# имени пакет выдумать не может.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: не репозиторий, нет разборщика, битый ввод — пропуск.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -z "$cmd" ] && exit 0

if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

profile="${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"
[ -f "$profile" ] || exit 0
# shellcheck disable=SC1090
. "$profile" 2>/dev/null || exit 0
command -v rt_task_branch_ok >/dev/null 2>&1 || exit 0

deny() {
    jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Гард поставки."}}\n'
    exit 0
}

# --- заведение ветки ---------------------------------------------------------------------
branch_arg=''
if printf '%s' "$cmd" | grep -qE '(^|[;&|[:space:]])git[[:space:]]+(checkout[[:space:]]+-b|switch[[:space:]]+-c)[[:space:]]'; then
    branch_arg="$(printf '%s' "$cmd" | sed -nE 's/.*git[[:space:]]+(checkout[[:space:]]+-b|switch[[:space:]]+-c)[[:space:]]+([^[:space:];&|]+).*/\2/p' | head -1)"
    branch_arg="${branch_arg%\'}"; branch_arg="${branch_arg#\'}"
    branch_arg="${branch_arg%\"}"; branch_arg="${branch_arg#\"}"
fi

if [ -n "$branch_arg" ]; then
    # Имя, притворяющееся веткой под задачу, но не совпадающее с формой, — это промах в имени,
    # а не осознанная беззадачная ветка. Ловится до первого коммита.
    if printf '%s' "$branch_arg" | grep -qE '^[A-Za-z]+-[0-9]+' && ! rt_task_branch_ok "$branch_arg"; then
        deny "Имя ветки «${branch_arg}» не той формы, что принята здесь. Номер у ветки тот же, что у задачи и у заголовка PR."
    fi
    exit 0
fi

# --- открытие PR -------------------------------------------------------------------------
case "$cmd" in
    *gh\ pr\ create*) ;;
    *) exit 0 ;;
esac

workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0   # открепившийся HEAD — не про этот случай

# Локальная ветка без номера законна, а PR с неё — уже нет: правка, доезжающая до главной
# ветки, начинается с задачи. Это единственное место, где беззадачная ветка упирается.
rt_task_branch_ok "$branch" \
    || deny "PR с ветки «${branch}», за которой не стоит задачи. Правка начинается с задачи, видимой в очереди работ: заведи её и перенеси работу в ветку с её номером."

number="$(printf '%s' "$branch" | sed -nE 's/^[A-Za-z]+-([0-9]+).*/\1/p')"

title=''
if command -v perl >/dev/null 2>&1; then
    title="$(printf '%s' "$cmd" | perl -0ne '
        if (/--title(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|([^\s]+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
fi

if [ -n "$title" ] && [ -n "$number" ]; then
    title_number="$(printf '%s' "$title" | sed -nE 's/^\[[A-Za-z]+-([0-9]+)\].*/\1/p')"
    [ -z "$title_number" ] \
        && deny "Заголовок PR не начинается с номера задачи. В списке PR тела не видно, а строка связи живёт именно там — без номера в заголовке отчёт с задачей не сопоставить."
    [ "$title_number" = "$number" ] \
        || deny "В заголовке PR номер ${title_number}, у ветки — ${number}. Задача, ветка и отчёт несут один и тот же номер."
fi

exit 0
