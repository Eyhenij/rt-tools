#!/usr/bin/env bash
# rt-hook: PreToolUse mcp__playwright__.*|mcp__chrome-devtools__.*|Bash
# Требует: hooks/deny-tail.sh
# Гард обходных путей к браузеру. PreToolUse.
#
# Закрепление профиля чего-то стоит только тогда, когда дверь одна. Здесь перечислены двери,
# которые обходят её целиком и закреплённый профиль не спрашивают вовсе: второй драйвер,
# третий драйвер, открытие ссылки средствами системы, управление браузером через сценарий
# автоматизации, отдельная утилита, прямой запуск бинарника и браузер, поднятый библиотекой
# изнутри скрипта.
#
# Последняя дверь в строке команды не видна вовсе: там стоят имя интерпретатора и путь файла, а
# вождение лежит внутри самого файла. Поэтому судится и содержимое запускаемого файла, и код,
# переданный доводом вместо файла, — на известные точки входа браузерных библиотек. Так
# закреплённый профиль обошли дважды за один заход, и не остановило ничто.
#
# Написание сквозных спек при этом остаётся законным: прогон спеки не выдаёт агенту
# интерактивный браузер. Отбиваются только глаголы вождения.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: помощник не назвал профиль — пропуск.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

tool="$(rt_hook_tool)"

# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

deny() {
    echo "$1 Води браузер закреплённым расширением: выбери профиль ${device_id} и работай его инструментами. $(rt_deny_tail)" >&2
    exit 2
}

case "$tool" in
    mcp__playwright__*)
        deny "Второй драйвер браузера в этом проекте не используется — в его профиле вход не сделан." ;;
    mcp__chrome-devtools__*)
        deny "Третий драйвер браузера в этом проекте не используется — закреплённый профиль он не спрашивает." ;;
esac

# Терминал среды разработки запускает те же драйверы той же командной строкой.
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0

if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

# Прогон сквозных спек — законный путь, и он не отбивается никогда.
case "$cmd" in
    *playwright\ open*|*playwright\ codegen*|*playwright\ screenshot*|*playwright\ cr*)
        deny "Вождение браузера из командной строки драйвера обходит закреплённый профиль." ;;
esac

case "$cmd" in
    *open\ http*|*open\ -a\ *Chrome*|*open\ -a\ *chrome*)
        deny "Открытие адреса средствами системы поднимает браузер по умолчанию, а не закреплённый профиль." ;;
    *osascript*Chrome*|*osascript*chrome*)
        deny "Управление браузером сценарием автоматизации обходит закреплённый профиль." ;;
    *chrome-cli*)
        deny "Эта утилита обходит закреплённый профиль." ;;
esac

# Бинарник браузера — и только в позиции команды.
#
# Голый образец с именем движка здесь непригоден: он совпадает и со значением флага, которым
# помечают движок в прогоне сквозных спек, — такой образец отбил бы сам прогон в день, когда
# появился. Поэтому якорь на границе команды и требование похожего на исполняемый файл слова,
# а не значения флага.
printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}(/[^[:space:]]*/)?(google-chrome|chromium)([[:space:]]|\$)" \
    && deny "Прямой запуск бинарника браузера обходит закреплённый профиль."

printf '%s' "$cmd" | grep -qF 'Google Chrome.app/Contents/MacOS' \
    && deny "Прямой запуск бинарника браузера обходит закреплённый профиль."

# Точки входа браузерных библиотек — то, чем браузер поднимают из кода. Перечислены и глагол
# запуска, и глагол присоединения к уже поднятому: второй обходит профиль ровно так же.
launch='(chromium|firefox|webkit|browserType|puppeteer|chromeLauncher)[[:space:]]*\.[[:space:]]*(launch|connect)|launchPersistentContext|webdriver\.(Chrome|Firefox)|chrome-launcher'

# Код, переданный доводом вместо файла. Судится только вместе с именем интерпретатора и его
# флагом кода: голый образец отбивал бы и поиск по дереву, в котором такое слово просто ищут.
if printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}(node|bun|deno|python3?)([[:space:]]+-[^[:space:]]+)*[[:space:]]+(-e|--eval|-c|-p|--print)[[:space:]]" \
    && printf '%s' "$cmd" | grep -qE "$launch"; then
    deny "Браузер, поднятый библиотекой из кода довода, закреплённый профиль не спрашивает."
fi

# Файлы, которые команда запускает интерпретатором. Обёртки менеджеров пакетов снимаются: под
# ними стоит тот же интерпретатор, а видеть его надо в позиции команды.
launched="$(printf '%s' "$cmd" | sed -E '
        s/(^|[[:space:]])(npx|bunx)[[:space:]]+/\1/g
        s/(^|[[:space:]])(pnpm|npm|yarn)[[:space:]]+(exec|dlx)[[:space:]]+/\1/g
        s/(^|[[:space:]])deno[[:space:]]+run[[:space:]]+/\1deno /g
    ' | tr '|&;' '\n\n\n' | sed -nE '
        s/.*(^|[[:space:]])(node|bun|deno|tsx|ts-node|python3?)[[:space:]]+((-[^[:space:]]+|[A-Za-z_][A-Za-z0-9_]*=[^[:space:]]+)[[:space:]]+)*([^[:space:]]+).*/\5/p
    ' | tr -d "\"'\`")"

cwd="$(rt_hook_cwd)"
for file in $launched; do
    for base in '' "${cwd:-.}/" "${CLAUDE_PROJECT_DIR:-.}/"; do
        path="${base}${file}"
        [ -f "$path" ] || continue
        if head -c 200000 "$path" 2>/dev/null | grep -qE "$launch"; then
            deny "Браузер, поднятый библиотекой изнутри ${file}, закреплённый профиль не спрашивает."
        fi
        break
    done
done

exit 0
