#!/usr/bin/env bash
# Гард поставки. PreToolUse на заведении ветки и открытии заявки на слияние.
#
# Закон о поставке требует трёх вещей, которых обычно не проверяет ничто: правка начинается с
# задачи, видимой в очереди работ; задача, ветка и отчёт несут один номер; у задачи есть
# исполнитель. Держатся они памятью — и не удерживаются: задачи стоят вне очереди, исполнитель
# не проставлен, а большинство влитых заявок приходит с веток, за которыми задачи не стояло
# вовсе.
#
# Гард стоит в двух точках, и в каждой требует того, что в этот момент исправимо:
#
#   заведение ветки — имя с номером разбирается на месте; имя без номера пропускается:
#       локальная ветка под пробу законна, в главную она не поедет, потому что заявка с неё
#       не откроется;
#   открытие заявки — ветка обязана нести номер, заголовок обязан начинаться с того же номера,
#       а задача — быть открытой, стоять в очереди работ и иметь исполнителя.
#
# Два яруса. Формат — номер в имени ветки, номер в заголовке, их совпадение — читается из
# текста команды и работает всегда. Состояние задачи требует сети: нет её, нет помощника или
# нет токена — ярус пропускается, потому что проверять нечем.
#
# Что здесь чем зовётся, знает профиль дерева:
#   rt_task_branch_ok    — форма имени ветки под задачу;
#   RT_TASK_TITLE_RE     — форма номера в заголовке заявки;
#   rt_task_state        — состояние задачи одним объектом (existsize, open, onBoard, assigned,
#                          numbered); молчание значит «спросить некого»;
#   RT_TASK_NEW_CMD      — чем заводится задача;
#   RT_BOARD_CHECK_CMD   — чем сверяется очередь работ;
#   RT_TASK_BOT          — учётная запись, которую ставят исполнителем.
# Отказ называет и то, что не так, и чем это чинится: отказ без действия обходят, а не исполняют.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: не репозиторий, нет разборщика, битый ввод, нет профиля — пропуск.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    # Терминал среды и универсальный исполнитель кладут команду в то же поле.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -z "$cmd" ] && exit 0

# Универсальный исполнитель передаёт настоящую команду вложенной строкой. Разбирать надо её,
# а не обёртку.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
# Объявленная в надстройке функция замещает умолчание целиком и вправе позвать его обратно
# суффиксом `_default`. Нет ни того ни другого — хук пропускает: пустой гард лучше гарда,
# отбивающего наугад.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "$root/.claude/rt-kit/defaults/project.sh" "$root/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done
command -v rt_task_branch_ok >/dev/null 2>&1 || exit 0

title_re="${RT_TASK_TITLE_RE:-^\[[A-Za-z]+-[0-9]+\][[:space:]]+[^[:space:]]}"
task_new="${RT_TASK_NEW_CMD:-npm run task:new}"
board_check="${RT_BOARD_CHECK_CMD:-npm run check:board}"
task_bot="${RT_TASK_BOT:-}"

deny() {
    jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Гард поставки."}}\n'
    exit 0
}

check_task() {
    number="$1"
    where="$2"
    command -v rt_task_state >/dev/null 2>&1 || return 0
    state="$(cd "$root" && rt_task_state "$number" 2>/dev/null)" || return 0
    [ -z "$state" ] && return 0

    printf '%s' "$state" | jq -e '.exists' >/dev/null 2>&1 \
        || deny "BLOCKED: ${where} ссылается на задачу #${number}, которой нет. Проверь номер или заведи задачу — ${task_new}."
    printf '%s' "$state" | jq -e '.open' >/dev/null 2>&1 \
        || deny "BLOCKED: задача #${number} закрыта, а у задачи одна ветка. Работа за закрытой задачей заводится новой задачей — ${task_new}."
    printf '%s' "$state" | jq -e '.onBoard' >/dev/null 2>&1 \
        || deny "BLOCKED: задачи #${number} нет в очереди работ — правка за ней не видна. Очередь к репозиторию не привязана и задачу сама не забирает; добавь её и сверь — ${board_check}."
    printf '%s' "$state" | jq -e '.assigned' >/dev/null 2>&1 \
        || deny "BLOCKED: у задачи #${number} нет исполнителя — по очереди работ не видно, кто её взял. Поставь исполнителя${task_bot:+: }${task_bot}."
    printf '%s' "$state" | jq -e '.numbered' >/dev/null 2>&1 \
        || deny "BLOCKED: заголовок задачи #${number} не начинается с её номера — одну работу придётся узнавать по тексту названия. Поправь заголовок и сверь очередь — ${board_check}."

    return 0
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
    if printf '%s' "$branch_arg" | grep -qiE '^[A-Za-z]+-[0-9]+'; then
        rt_task_branch_ok "$branch_arg" \
            || deny "BLOCKED: имя ветки «${branch_arg}» не той формы, что принята здесь. Номер у ветки тот же, что у задачи и у заголовка заявки на слияние."
        check_task "$(printf '%s' "$branch_arg" | sed -nE 's/^[A-Za-z]+-([0-9]+).*/\1/p')" "ветка «${branch_arg}»"
    fi
    # Ветка без номера законна и живёт локально: заявка с неё не откроется.
    exit 0
fi

# --- открытие заявки на слияние ----------------------------------------------------------
case "$cmd" in
    *gh\ pr\ create* | *glab\ mr\ create* | *az\ repos\ pr\ create*) ;;
    *) exit 0 ;;
esac

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0   # открепившийся HEAD — не про этот случай

# Локальная ветка без номера законна, а заявка с неё — уже нет: правка, доезжающая до главной
# ветки, начинается с задачи. Это единственное место, где беззадачная ветка упирается.
rt_task_branch_ok "$branch" \
    || deny "BLOCKED: заявка с ветки «${branch}», за которой не стоит задачи. Правка начинается с задачи, видимой в очереди работ: заведи её — ${task_new} — и перенеси работу в ветку с её номером."

number="$(printf '%s' "$branch" | sed -nE 's/^[A-Za-z]+-([0-9]+).*/\1/p')"

title=''
if command -v perl >/dev/null 2>&1; then
    title="$(printf '%s' "$cmd" | perl -0ne '
        if (/(?:--title|-t)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(\S+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
fi

if [ -n "$title" ]; then
    printf '%s' "$title" | grep -qE "$title_re" \
        || deny "BLOCKED: заголовок заявки не начинается с номера задачи. В списке заявок тела не видно, а строка связи живёт именно там — без номера в заголовке отчёт с задачей не сопоставить."
    title_number="$(printf '%s' "$title" | sed -nE 's/^\[[A-Za-z]+-([0-9]+)\].*/\1/p')"
    if [ -n "$number" ] && [ -n "$title_number" ]; then
        [ "$title_number" = "$number" ] \
            || deny "BLOCKED: в заголовке заявки номер ${title_number}, у ветки — ${number}. Задача, ветка и отчёт несут один и тот же номер."
    fi
fi

check_task "$number" "заявка с ветки «${branch}»"

exit 0
