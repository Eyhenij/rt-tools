#!/usr/bin/env bash
# rt-kit v0.24.0 · hooks/work-start-guard.sh · d6a3c7891e90 · правится надстройкой, не здесь
# rt-hook: Stop
# Требует: hooks/deny-tail.sh, hooks/profile-check.sh
# Гард начала работы: ход, правивший код приложения, не заканчивается, пока владелец в этом же
# ходе о работе не просил. Stop.
#
# Зачем именно так. Статья «заход работу не начинает сам» держится памятью исполнителя, и
# держится плохо: заход, открывшийся после чистки контекста, получает от хука запуска состояние
# незаконченной работы и замысел с этапами — и оба говорят, что делать, если работать. О том,
# работать ли, не говорит ни один. Строка с путём к файлу, присланная владельцем, прочитана как
# поручение, и заход правит полсотни файлов, которых у него никто не просил.
#
# Соседние гарды этого не ловят, и не по недосмотру: каждый судит своё. Гард замысла требует
# замысел на диске — он лежит; гард эпика отбивает чужую задачу — задача своя; гард разговора
# судит ход, в котором задан вопрос, — а вопроса не задали ровно потому, что решили не
# спрашивать. Все три судят предмет правки и её порядок, и ни один не спрашивает, кто эту
# правку заказал.
#
# Просьба ловится формой, а не смыслом. Смысл машине не виден, и гард, взявшийся его понимать,
# отбивал бы работу по настроению; поэтому судится обратное — то, что просьбой не бывает ни при
# каком прочтении: пустая реплика, одно слово и путь к файлу. Всё остальное считается просьбой,
# и это выбрано намеренно: ложный отказ здесь стоит дороже пропуска — он останавливает работу,
# которую владелец заказал.
#
# Код приложения узнаётся признаком дерева `rt_is_app_code` — тем же, которым его узнаёт гард
# замысла. Дерево, признака не объявившее, этого гарда не получает: судить ему нечем.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет `jq`, нет записи хода, нет признака дерева, повторный заход, любая
# своя ошибка — ход РАЗРЕШАЕТСЯ (exit 0). Сломанный гард не имеет права заклинить работу.

# Своё имя в наблюдениях: отбой пишет общий хвост отказа, а не сам гард.
RT_GUARD_NAME=work-start-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# Повторный заход по тому же ходу не судится: гард сказал своё один раз и отпускает.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" \
    "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }
rt_needs rt_is_app_code work-start-guard || exit 0

# Ход — это всё, что записано после последнего настоящего ввода владельца. Ответ инструмента
# приходит той же ролью, поэтому строки с `tool_result` вводом не считаются.
#
# Хвост в 400 строк: запись хода растёт всю сессию, а судится только последний ход.
asked="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | if $i == null then "" else
        (.[$i].message.content
         | if type == "string" then .
           elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
           else "" end)
      end
' 2>/dev/null)"

# Ввода в записи нет вовсе — судить нечего: ход разрешается.
[ -z "$asked" ] && exit 0

# Правленные за ход файлы: инструменты правки называют путь полем, а команда оболочки — своим
# разбором, и его здесь нет намеренно. Гард судит явную правку файла: команда, пишущая в код
# мимо инструмента правки, остаётся его известной границей.
edited="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end)
    | [.[] | select(.type == "assistant") | (.message.content // [])[]
        | select(.type == "tool_use")
        | select(.name == "Edit" or .name == "Write" or .name == "MultiEdit" or .name == "NotebookEdit")
        | (.input.file_path // .input.notebook_path // empty)]
    | unique | .[]
' 2>/dev/null)"

[ -z "$edited" ] && exit 0

touched=""
while IFS= read -r path; do
    [ -z "$path" ] && continue
    if rt_is_app_code "$path" 2>/dev/null; then
        touched="$path"
        break
    fi
done <<EOF
$edited
EOF

# Код приложения за ход не правился: гард молчит. Разбор, тексты и обвязка идут своим ходом —
# требовать слова владельца на них значило бы запретить разведку до просьбы.
[ -z "$touched" ] && exit 0

# Просьбой не бывает ни при каком прочтении: пустая реплика, одно слово, путь к файлу. Судится
# первая непустая строка ввода: развёрнутая просьба своей первой строкой уже просьба, а путь,
# присланный один, ею не станет и дальше.
first="$(printf '%s' "$asked" | tr -d '\r' | sed -n '/[^[:space:]]/{p;q;}')"
words="$(printf '%s' "$asked" | tr -s '[:space:]' '\n' | grep -c '[^[:space:]]' 2>/dev/null || echo 0)"

case "$first" in
    # Служебная отметка о прерывании: своей просьбы в ней нет.
    '[Request interrupted'*) kind="прерывание" ;;
    *)
        if [ "$words" -le 1 ] 2>/dev/null; then
            case "$first" in
                */*) kind="путь к файлу" ;;
                *) kind="одно слово" ;;
            esac
        else
            kind=""
        fi
        ;;
esac

# Просьба в ходе есть: работа заказана, и гард отпускает.
[ -z "$kind" ] && exit 0

reason="BLOCKED by work-start-guard: за ход правился код приложения — «${touched}», — а последняя реплика владельца просьбой не была: ${kind}.

Заход работу не начинает сам. Передача прошлого захода, состояние задачи из хука запуска и назначенный эпик говорят, что делать, если работать, и молчат о том, работать ли. Строка с адресом называет файл, а не действие: прочитанная как поручение, она даёт заходу задание, которого владелец не давал.

Ход отсюда один: назови владельцу состояние работы и спроси, продолжать ли, — и дождись ответа. Сделанное этим ходом не откатывается само: скажи, что уже правлено.

Гард судит один ход: следующий заход не отбивается."

# Общий хвост отказа: два законных хода. Файл может быть не разложен — тогда хвоста нет,
# а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"work-start-guard: код правился, а просьбы владельца в этом ходе не было."}\n'

exit 0
