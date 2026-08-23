#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_sql_query|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Требует: hooks/deny-tail.sh
# Гард пишущих запросов к хранилищу. PreToolUse.
#
# Правка данных — единственное действие, которое нельзя откатить правкой кода. Удаление по
# маске однажды уносит вместе с пробными записями настоящие: маска совпадает шире, чем ожидал
# автор запроса, и узнаётся это уже по восстановлению из копии.
#
# Отсюда правило: строки адресуются по первичному ключу. Перечисление идентификаторов
# затрагивает ровно столько строк, сколько их перечислено, и промах виден до выполнения; отбор
# по подстроке не виден никогда.
#
# Три уровня:
#   отказ    — снос, очистка, правка схемы, удаление и обновление без условия или с условием
#              не по идентификатору;
#   вопрос   — остальная запись: адресная правка и вставка, решение за владельцем;
#   пропуск  — чтение.
#
# Каждый предмет разбора живёт своим помощником рядом: запрос из ввода — `sql-guard-request.sh`,
# приведение команды к одному виду и нарезка на сегменты — `sql-guard-parse.sh`, адресат вместе
# с правилами боевой базы — `sql-guard-target.sh`, признак записи, разрушительное, миграции и
# адресация строк — `sql-guard-write.sh`. Здесь остаётся порядок: он зовёт их и решает.
#
# Боевое хранилище отдельно: его адреса и подключения перечисляет профиль дерева —
#   RT_PROD_DSN          — образец адреса боевой базы: порт туннеля, хост, домен;
#   RT_PROD_CONNECTIONS  — идентификаторы боевых подключений среды разработки;
#   RT_LOCAL_CONNECTIONS — они же у локальных: опознанное локальное подключение сильнее любой
#                          текстовой догадки;
#   RT_SCRATCH_PORT_RE   — порты одноразовых баз, по которым вопрос не задаётся.
# По боевому адресу любая запись отказывается без опт-аута: бой правится миграцией через
# выкатку, а не запросом из редактора.
#
# Опт-аут для остальных случаев: маркер `destructive-ok` в тексте запроса вместе с объяснением,
# почему адресация по идентификатору не подходит, понижает отказ до вопроса. Последнее слово
# остаётся за владельцем — гард лишь не пропускает такое молча.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет разборщика, битый ввод, чужой инструмент — пропуск. Без `perl`
# вырезать текст сообщений коммитов нечем, поэтому команды работы с историей в этом случае
# пропускаются целиком — иначе слова «drop» и «update» в описании коммита читались бы как
# запрос. Доставки запроса внутри такой команды не бывает, так что цена послабления нулевая.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"

# Рабочий каталог нужен одному правилу — разрешению адреса миграции: `DATABASE_URL`
# обычно не назван в команде и лежит в `.env` рядом с проектом.
hook_cwd="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$hook_cwd" ] && hook_cwd="${CLAUDE_PROJECT_DIR:-.}"

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
# Умолчание ищется и рядом с самим хуком: уезжают они вместе.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# Помощники лежат рядом с гардом и уезжают в дерево вместе с ним. Нет хотя бы одного —
# разбирать команду нечем, и гард пропускает ход: отказ в пользу работы здесь тот же, что и
# при отсутствии `jq`.
for helper in sql-guard-request.sh sql-guard-parse.sh sql-guard-target.sh sql-guard-write.sh; do
    [ -f "$rt_hooks_dir/$helper" ] || exit 0
    # shellcheck disable=SC1090
    . "$rt_hooks_dir/$helper"
done

PROD_DSN="${RT_PROD_DSN:-}"

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть. Файл
# может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

deny() {
    reason="$1"
    tail_text="$(rt_deny_tail "$2")"
    [ -n "$tail_text" ] && reason="$1 ${tail_text}"
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Destructive SQL blocked. Address rows by id."}}\n'
    exit 0
}

ask() {
    jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r}}' 2>/dev/null \
        || exit 0
    exit 0
}

sql_read_request
[ -z "$sql" ] && exit 0

sql_flatten
sql_collect_segments
sql_addr_flatten
sql_resolve_target
sql_detect_write

sql_pass_scratch
sql_check_prod

[ -z "$is_write" ] && exit 0

sql_check_destructive
sql_check_migrations
sql_check_addressing

# --- остальная запись: решает пользователь ----------------------------------------------
# Неизвестное подключение — не повод пропустить молча: адресат запроса не опознан, и им
# может оказаться боевая база под другим идентификатором.
if [ "$conn_known" = "" ] && [ -n "$conn" ]; then
    ask "Запись в базу через ПОДКЛЮЧЕНИЕ, НЕИЗВЕСТНОЕ ГАРДУ (id ${conn}). Гард знает локальное подключение и боевое; это — ни то, ни другое, поэтому убедись, что запрос уходит не на прод. Если подключение постоянное, впиши его id в PROD_CONNECTIONS или LOCAL_CONNECTIONS в .claude/hooks/sql-guard.sh."
fi

ask "Запись в базу (${context}). Проверь, что затронуты только ожидаемые строки, и подтверди."
