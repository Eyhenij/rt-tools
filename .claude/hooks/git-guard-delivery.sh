#!/usr/bin/env bash
# rt-kit v0.5.0 · hooks/git-guard-delivery.sh · 58430fd1e6ec · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
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
tasks_dir="${RT_TASKS_DIR:-}"
archive_dir="${RT_ARCHIVE_DIR:-}"
main_branch="${RT_MAIN_BRANCH:-main}"

# Обход требования: строка с причиной. Причина видна тому, кто вливает, поэтому обход законен.
# Без причины это просто молчаливый пропуск, поэтому она обязательна. Порог в три знака — тот
# же, что у гарда документа: если сделать по-разному, две формы одного обхода разойдутся.
folder_skip_re='Task-folder-skip:[[:space:]]*[^[:space:]"'"'"']{3,}'

deny() {
    jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Гард поставки."}}\n'
    exit 0
}

# Подсказка вместо отказа: на открытии отчёта папка ещё нужна. Решения подсказка не несёт,
# команда идёт дальше своим ходом.
hint() {
    jq -n --arg c "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:$c}}' 2>/dev/null
    exit 0
}

# Есть ли папка задачи в ветке. Смотрим содержимое ветки, а не рабочее дерево: если папку
# удалили, но не закоммитили, проверка прошла бы, а папка всё равно уехала бы в main. Имя
# ветки подставляем целиком, вместе с косой: у ветки вида `chore/312-slug` папка лежит во
# вложенном каталоге.
folder_in_branch() {
    git ls-tree -d --name-only HEAD -- "$1" 2>/dev/null | head -1
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

# --- слияние заявки ----------------------------------------------------------------------
#
# Папку задачи разбирают тем же PR, что и работу. После слияния этого уже никто не сделает:
# работа перешла к следующей задаче, а PR закрыт. Раньше слияния требовать нельзя — пока идёт
# ревью, plan.md нужен на диске, иначе гард хода работы не даст править код.
# Команду ищем от начала строки или после разделителя, а не где угодно в тексте. Иначе гард
# отбивает сообщение, где `gh pr merge` просто упомянут в кавычках, — так он и сработал на
# правке этого же текста. Полностью подстроку в кавычках так не отсечь, но случайное упоминание
# внутри слова или пути мимо уже не пройдёт.
if printf '%s' "$cmd" | grep -qE '(^|[;&|(]|&&|\|\|)[[:space:]]*(gh[[:space:]]+pr[[:space:]]+merge|glab[[:space:]]+mr[[:space:]]+merge|az[[:space:]]+repos[[:space:]]+pr[[:space:]]+update)([[:space:]]|$)'; then
    [ -n "$tasks_dir" ] || exit 0   # ведения работы папкой в дереве нет

    merge_branch="$(git branch --show-current 2>/dev/null)"
    [ -z "$merge_branch" ] && exit 0
    rt_task_branch_ok "$merge_branch" || exit 0   # за беззадачной веткой папки не стоит

    folder="$tasks_dir/$merge_branch"

    # Сначала ищем обход в самой команде — это работает и без сети. Если читать только
    # тело PR, то без сети гард отбил бы слияние, причина которого в этом теле и написана.
    printf '%s' "$cmd" | grep -qiE "$folder_skip_re" && exit 0

    merge_number="$(printf '%s' "$cmd" | sed -nE 's/.*(pr|mr)[[:space:]]+(merge|update)[[:space:]]+([0-9]+).*/\3/p' | head -1)"
    if [ -n "$merge_number" ] && command -v rt_report_body >/dev/null 2>&1; then
        body="$(cd "$root" && rt_report_body "$merge_number" 2>/dev/null)"
        [ -n "$body" ] && printf '%s' "$body" | grep -qiE "$folder_skip_re" && exit 0
    fi

    lying="$(folder_in_branch "$folder")"
    [ -n "$lying" ] \
        && deny "BLOCKED: в ветке осталась папка задачи «${lying}» — она уедет в главную. Разобрать её потом будет некому: работа перейдёт к следующей задаче, а этот PR закроется. Перенеси в «${archive_dir:-архив}» то, что объясняет принятые решения, остальное удали и повтори. Если работа вливается частями, поставь в тело PR строку «Task-folder-skip: <причина>»."

    # Запись в архиве спрашиваем только у ветки, которая папку удалила. Иначе проверка
    # цеплялась бы к работе, у которой папки и не было. Без общего предка с главной веткой
    # сравнивать не с чем — тогда молчим.
    [ -n "$archive_dir" ] || exit 0
    base="$(git merge-base "$main_branch" HEAD 2>/dev/null)"
    [ -z "$base" ] && exit 0

    had="$(git ls-tree -d --name-only "$base" -- "$folder" 2>/dev/null | head -1)"
    [ -z "$had" ] && had="$(git log "$base..HEAD" --diff-filter=A --name-only --pretty=format: -- "$folder" 2>/dev/null | head -1)"
    [ -z "$had" ] && exit 0

    gained="$(git diff --name-only --diff-filter=A "$base" HEAD -- "$archive_dir" 2>/dev/null | head -1)"
    [ -z "$gained" ] \
        && deny "BLOCKED: папку задачи удалили, но в «${archive_dir}» ветка ничего не добавила. Удалить проще, чем разобрать, — и вместе с папкой пропадает разбор просьбы, единственная запись слов владельца. Перенеси то, что объясняет принятые решения, одним файлом с понятным именем и повтори."

    exit 0
fi

# --- открытие заявки на слияние ----------------------------------------------------------
# Команду ищем от начала строки или после разделителя — по той же причине, что и слияние:
# упоминание в кавычках командой не является.
printf '%s' "$cmd" \
    | grep -qE '(^|[;&|(]|&&|\|\|)[[:space:]]*(gh[[:space:]]+pr[[:space:]]+create|glab[[:space:]]+mr[[:space:]]+create|az[[:space:]]+repos[[:space:]]+pr[[:space:]]+create)([[:space:]]|$)' \
    || exit 0

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

# Сейчас папка ещё нужна: правки по замечаниям ревью идут в эту же ветку, а без plan.md их не
# пропустит гард хода работы. Поэтому здесь только напоминание. Требование стоит на слиянии —
# там папка уже не нужна, а вред от неё как раз и наступает.
if [ -n "$tasks_dir" ]; then
    lying="$(folder_in_branch "$tasks_dir/$branch")"
    [ -n "$lying" ] \
        && hint "В ветке лежит папка задачи «${lying}». Разбери её до слияния, этим же PR: потом за неё уже никто не возьмётся. На слиянии это будет отказ, а не напоминание."
fi

exit 0
