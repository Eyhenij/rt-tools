#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_run_configuration|mcp__webstorm__execute_tool
# Требует: hooks/deny-tail.sh
# Гард второго сервера разработки. PreToolUse.
#
# Приложения уже подняты владельцем, и всякая проверка через браузер идёт туда. Второй
# экземпляр занимает лишний порт, отдаёт другую сборку и уводит разбор в сторону: расхождение
# между двумя серверами читается как дефект правки. Вдобавок сборка, запущенная между делом,
# гасит уже поднятый сервер молча.
#
# Отбивается всё, что ПОДНИМАЕТ сервер. Сборка, тесты, линтеры, запросы к поднятым портам и
# осмотр слушателей проходят.
#
# Где именно подняты приложения, знает профиль проекта: .claude/rt-kit/project.sh, переменная
# RT_STANDS. Нет профиля — текст отказа остаётся общим, сам гард работает.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"

tool="$(rt_hook_tool)"
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    # Готовая конфигурация запуска командной строки не показывает — видно только её имя.
    # Отсюда правило: «serve», «dev» и «start» в имени отклоняются, потому что проверить, что
    # за ними стоит, гард не может, а второй сервер стоит дороже лишнего отказа.
    mcp__webstorm__execute_run_configuration)
        name="$(printf '%s' "$input" | jq -r '.tool_input.configurationName // empty' 2>/dev/null)"
        # Второй режим инструмента — временная конфигурация из пары «файл и строка»: имени у
        # неё нет вовсе, и проверка по имени её пропускала. Именно так поднимается скрипт из
        # манифеста пакета.
        if [ -z "$name" ]; then
            file="$(printf '%s' "$input" | jq -r '.tool_input.filePath // empty' 2>/dev/null)"
            case "$file" in
                */package.json|package.json)
                    echo "Запуск скрипта прямо из манифеста: гард видит только файл и строку, а не сам скрипт, поэтому не может отличить подъём сервера от сборки. Приложения уже подняты владельцем — если нужна сборка или тест, запусти их командой в терминале." >&2
                    exit 2 ;;
            esac
            exit 0
        fi
        # Слово «start» без границы ловило и «restart», который сервер не поднимает.
        case "$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]')" in
            *serve*|*dev*|start*|*\ start*|*:start*)
                echo "Конфигурация «${name}» похожа на подъём сервера разработки, а приложения уже подняты владельцем — проверяй их. Если конфигурация делает другое, запусти это командой: по имени гард содержимого не видит." >&2
                exit 2 ;;
        esac
        exit 0 ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0

# Универсальный исполнитель среды передаёт настоящую команду вложенной строкой. Разбирать надо
# её, а не обёртку: иначе имя раннера стоит сразу за кавычкой и ни одно правило до него не
# дотягивается.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

# Гит ничего не слушает на портах, а тексты сообщений и веток свободно содержат слова вроде
# «serve» — без этой ветки гард ловит собственный коммит про себя же.
case "$cmd" in
    git\ *|*/git\ *)
        printf '%s' "$cmd" | grep -qE '(^|[[:space:]])git[[:space:]]+daemon([[:space:]]|$)' || exit 0 ;;
esac

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done
stands="${RT_STANDS:-}"

# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

deny() {
    if [ -n "$stands" ]; then
        echo "$1 Приложения уже подняты владельцем: ${stands} — проверяй их. Свой экземпляр не поднимай; если порт не отвечает, скажи владельцу, а не запускай второй. $(rt_deny_tail)" >&2
    else
        echo "$1 Приложения уже подняты владельцем — проверяй их. Свой экземпляр не поднимай; если порт не отвечает, скажи владельцу, а не запускай второй. $(rt_deny_tail)" >&2
    fi
    exit 2
}

# Раннеры перечисляются явно. Группа «любое слово перед именем» отклоняла даже заметку о том,
# что сервер поднимает владелец.
RUNNER='((npx|pnpm|yarn|bun|npm)([[:space:]]+(exec|run|dlx))?[[:space:]]+)?'

# Начало вызова: начало строки или разделитель команд. Кавычку в границы вносить нельзя — тогда
# поиск по тексту и снятие процесса по шаблону читаются как запуск.
BOUND="$RT_CMD_BOUND"

printf '%s' "$cmd" | grep -qE "${BOUND}${RUNNER}(nx|ng)[[:space:]]+(run[[:space:]]+[^[:space:]]*:)?(serve|dev)" \
    && deny "Запуск ещё одного сервера разработки через каркас."

# Требование пробела сразу после имени рвало совпадение на двоеточии: скрипты вида «serve:site»
# гард пропускал — то есть ровно те команды, ради которых написан.
printf '%s' "$cmd" | grep -qE "${BOUND}(npm|pnpm|yarn|bun)([[:space:]]+run)?[[:space:]]+(dev|start|serve)([:._-][A-Za-z0-9:._-]*)?([[:space:]]|\$)" \
    && deny "Запуск ещё одного сервера разработки через пакетный раннер."

# Подкоманда обязательна: пока она была необязательной, под правило попадало голое слово
# сборщика — то есть любой однострочник, где оно встречается внутри текста.
printf '%s' "$cmd" | grep -qE "${BOUND}${RUNNER}vite([[:space:]]+(dev|serve|preview))?[[:space:]]*(\$|[;&|\"'])" \
    && deny "Запуск ещё одного сервера разработки."
printf '%s' "$cmd" | grep -qE "${BOUND}${RUNNER}(next|astro|nuxt)[[:space:]]+(dev|start|preview)([[:space:]]|\$)" \
    && deny "Запуск ещё одного сервера разработки."

# Статика поверх сборки — тот же второй экземпляр. Каждое имя под общим якорем начала команды:
# без него перечисление пакетов и поиск по документам читались как запуск.
printf '%s' "$cmd" | grep -qE "${BOUND}(python3?[[:space:]]+-m[[:space:]]+http\.server|${RUNNER}(http-server|live-server|serve)([[:space:]]|\$))" \
    && deny "Подъём статического сервера поверх сборки — тот же второй экземпляр."

exit 0
