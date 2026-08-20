#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Требует: hooks/profile-check.sh
# Гард проверок перед пушем. PreToolUse на вызове пуша.
#
# Пуш — это вход в конвейер: слияние в главную ветку запускает выкатку, и всё, что не
# проверено локально, проверяется уже на проде. Сюда дважды подряд уезжают правки, зелёные в
# выборочном прогоне и красные в конвейере: один раз прогонялись только сквозные спеки, другой
# — только затронутый проект.
#
# Гард не верит на слово: он сам гоняет то, что перечислил профиль дерева, и пускает пуш только
# при нулевом коде возврата. Если прогонщик кэширует результат, набор на неизменившемся дереве
# занимает секунды, а после правки гоняется заново.
#
# Что гонять, знает профиль: функция `rt_push_checks <база>` — по команде на строку. База —
# ветка, относительно которой считается вклад; пустая означает, что удалённого нет. Функция
# зовётся из каталога, откуда идёт пуш, и вправе решать по нему сама: шаг, проверки которого в
# дереве нет, она просто не печатает. Нет профиля или нет функции — гард пропускает: список
# проверок пакет выдумать не может.
#
# База берётся у удалённого, а не у локальной главной ветки: локальная отстаёт или расходится
# молча. Это уже случалось — локальная стояла на слиянии, стёртом из истории силовым пушем, и
# набор от неё посчитался бы не тот. Нет сети или нет удалённого — база пустая, и профиль
# откатывается на полный прогон: гейт может оказаться строже нужного, но НИКОГДА не слабее.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: не репозиторий, битый ввод, нет профиля — пропуск.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    # Терминал среды и универсальный исполнитель кладут команду в то же поле.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"

# Вызов пуша узнаётся по двум признакам сразу — команда `git` в начале строки или за
# разделителем и слово `push` отдельным словом. Тем же приёмом, что у гарда поставки: одной
# подстрокой «git push» пуш не поймать — помощник учётных данных и заголовок запроса ставятся
# ключами `-c` между ними, и ровно этой формой здесь и пушат. Пока признаком была подстрока,
# весь набор гейта на таком пуше не гонялся вовсе, а молчание гарда читалось как «зелено».
printf '%s' "$cmd" | grep -qE '(^|[;&|(]|&&|\|\|)[[:space:]]*git([[:space:]]|$)' || exit 0

# Отложенная правка пушем не бывает: `git stash push` кладёт правку в тайник этой же машины и
# наружу не отправляет ничего. Слово `push` в ней стоит отдельным, и без этой строки гард гонял
# на ней весь набор, а потом отбивал вызов на первой красной проверке — то есть отбивал команду,
# которая ничего никуда не отправляет. Тайник вырезается из строки, и признак считается по
# остатку: в составной команде рядом с ним может стоять и настоящий пуш.
probe="$(printf '%s' "$cmd" | sed -E 's/git[[:space:]]+stash[[:space:]]+push/git stash/g')"
printf '%s' "$probe" | grep -qE '(^|[[:space:]])push([[:space:]]|$)' || exit 0

# Пробный пуш ничего не отправляет: гонять ради него весь набор незачем.
case "$cmd" in
    *--dry-run*) exit 0 ;;
esac

# Переключение ветки в той же команде отбивается целиком.
#
# Гард — это разбор команды ДО её запуска: набор он гоняет в том дереве, какое лежит сейчас.
# Составная «переключиться и запушить» проходит гейт по ПРЕЖНЕЙ ветке — молча, проверяя не то.
# Отказа при этом нет, и зелёный набор читается как проверка того, что уходит на хостинг.
# Поймано это было случайно: гейт отбил пуш красной проверкой длины файла, которого в пушимой
# ветке нет вовсе — он смотрел ветку, с которой в этой же команде уходили.
#
# Судится переключение на существующую ветку. Заведение новой (`checkout -b`, `switch -c`)
# сюда не попадает: у свежей ветки дерево то же самое, что и было.
if printf '%s' "$cmd" | grep -qE '(^|[;&|(]|&&|\|\|)[[:space:]]*git[[:space:]]+(checkout|switch)[[:space:]]+' &&
    ! printf '%s' "$cmd" | grep -qE 'git[[:space:]]+(checkout[[:space:]]+-b|switch[[:space:]]+-c)([[:space:]]|$)'; then
    reason="BLOCKED: переключение ветки и пуш одной командой. Набор гейта гоняется в том дереве, какое лежит на момент разбора команды, — то есть по ПРЕЖНЕЙ ветке, а не по той, что уходит на хостинг. Зелёный набор при этом читается как проверка ушедшего, хотя проверял он другое. Раздели вызовы: сперва переключись, затем отдельной командой пушь."
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Переключение ветки и пуш одной командой."}}\n'
    exit 0
fi

workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ -f package.json ] || exit 0

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
# Объявленная в надстройке функция замещает умолчание целиком и вправе позвать его обратно
# суффиксом `_default`. Нет ни того ни другого — хук пропускает: пустой гард лучше гарда,
# отбивающего наугад.
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
rt_needs rt_push_checks git-guard-push-tests || exit 0

main_branch="${RT_MAIN_BRANCH:-main}"
base=''
if git fetch --quiet origin "$main_branch" 2>/dev/null && git rev-parse --verify --quiet "origin/$main_branch" >/dev/null 2>&1; then
    base="origin/$main_branch"
fi

failed=""
output=""
while IFS= read -r check; do
    [ -z "$check" ] && continue
    out="$(eval "$check" 2>&1)" && continue
    failed="$check"
    output="$out"
    break
done <<EOF
$(rt_push_checks "$base")
EOF

[ -z "$failed" ] && exit 0

# Хвост вывода, а не весь: у прогонщика он длинный, а нужна причина отказа.
tail_out="$(printf '%s' "$output" | tail -n 40 | tr -d '\000')"
reason="BLOCKED: пуш без зелёного локального прогона. «${failed}» упала — почини и пушь снова, обходить гард нельзя. Пуш — вход в конвейер, и красное отсюда проверяется уже на проде. Хвост вывода:

${tail_out}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Проверки перед пушем не прошли."}}\n'

exit 0
