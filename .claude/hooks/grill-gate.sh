#!/usr/bin/env bash
# rt-kit v0.16.1 · hooks/grill-gate.sh · 611b1c95da97 · правится надстройкой, не здесь
# Требует: hooks/deny-tail.sh
# rt-hook: Stop
# Гард разговора: вопрос владельцу не задаётся, пока за этот же ход не читались законы и
# правила. Судит два события, и это не дублирование; второе объявлено соседним ресурсом
# `hooks/grill-gate-ask.sh`, который отдаёт вызов сюда.
#
# Зачем именно так. Требование «правила читаются до разговора» исполнимо ровно до отправки
# вопроса. Проверка на завершении хода отбивает задним числом: к моменту отказа вопрос уже у
# владельца, и владелец видит его вместе с отбитым ходом — требование срабатывает, но работу не
# спасает. Поэтому ход с вопросом судится на инструменте вопроса, до отправки.
#
# Одним этим перехватом дыра не закрывается: вопрос чаще задаётся прозой, и ровно так был задан
# тот, из-за которого гард заведён. Прозаический вопрос инструментом не является, и поймать его
# можно только на завершении хода — событие получает путь к записи хода и видит его целиком.
# Отсюда два события: меню ловится до отправки, проза — после. Объявлены они разными ресурсами
# затем, чтобы дерево, у которого инструмент вопроса занят своим гардом, могло взять половину, а
# не отказаться от требования целиком.
#
# Чтением правил считается любой из трёх путей: загрузка правила, чтение файла законов или
# правил, поиск по ним. Требовать именно загрузку значило бы гнать на неё там, где хватило
# одного поиска, — гард мешал бы работе вместо того, чтобы её выправлять.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: при любой ошибке, отсутствии записи хода и повторном заходе ход
# РАЗРЕШАЕТСЯ (exit 0). Сломанный гард не имеет права заклинить разговор.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# Какое событие пришло. У вызова инструмента есть его имя, у завершения хода — нет.
tool="$(rt_hook_tool)"

# Повторный заход по тому же ходу не судится: иначе ход не кончится никогда — гард сказал своё
# один раз и отпускает. К вызову инструмента это не относится: там судится сам вызов.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ -z "$tool" ] && [ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# Профиль дерева: каталоги законов, правил и спеков у каждого свои, а знать их надо и для
# признака чтения, и для подсказки в отказе.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# Подстановка без двоеточия намеренно: заданное пустым — это отказ дерева от требования, и
# подменять его умолчанием нельзя. Умолчание достаётся только тому, кто не задал переменной
# вовсе.
laws_dir="${RT_LAWS_DIR-docs/constitution}"
rules_dir="${RT_RULES_DIR-.claude/skills}"
specs_dir="${RT_SPECS_DIR-docs/specs}"
# Замысел эпика и описание прошлого читаются наравне с законами: решение, связывающее задачи
# эпика, лежит именно там. Прочитавший замысел получал отказ наравне с не читавшим ничего, и
# снимался тот отказ поиском по трём каталогам, среди которых нужного не было.
plans_dir="${RT_PLANS_DIR-docs/plans}"
archive_dir="${RT_ARCHIVE_DIR-docs/archive}"

# Дерево, у которого нет ни законов, ни правил, требования не получает: читать нечего.
[ -z "$laws_dir" ] && [ -z "$rules_dir" ] && exit 0

# Образец, по которому вызов инструмента считается чтением правил. Каталоги идут в него как
# есть: точка в `.claude` совпадает с любым знаком и лишнего сюда не приводит.
read_re="$(printf '%s' "$laws_dir|$rules_dir|$specs_dir|$plans_dir|$archive_dir" | sed 's/^|*//; s/|*$//; s/||*/|/g')"
[ -z "$read_re" ] && exit 0

# Ход — это всё, что записано после последнего настоящего ввода владельца. Ответ инструмента
# приходит той же ролью `user`, поэтому строки с `tool_result` вводом не считаются: иначе ходом
# оказался бы кусок после последнего вызова инструмента, и чтение правил в его начале потерялось
# бы.
#
# Хвост в 400 строк: запись хода растёт всю сессию, а судится только последний ход.
# На событии вызова инструмента вопрос уже известен — он и есть вызов; судится только то,
# читались ли за этот ход правила. На завершении хода вопрос ищется в тексте реплик: меню к
# этому моменту уже отбито раньше.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg re "$read_re" --arg tool "$tool" '
    def is_input:
        .type == "user"
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then . else .[$i + 1:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "text") | .text] as $texts
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")] as $uses
    | ($uses | map(
          (.name == "Skill")
          or ((.name // "") | test("^(Read|Grep|Glob)$")) and ((.input | tostring) | test($re))
          or ((.name == "Bash") and ((.input.command // "") | test($re)))
      ) | any) as $read
    | (($texts | join("\n")) | test("\\?[[:space:]]*$"; "m")) as $asked_prose
    | ($tool != "") as $asking_now
    | if ($asked_prose or $asking_now) and ($read | not) then "ask" else "pass" end
' 2>/dev/null)"

[ "$verdict" = "ask" ] || exit 0

if [ -n "$tool" ]; then
    head="BLOCKED by grill-gate: вопрос владельцу ещё не ушёл, и это единственный момент, когда требование исполнимо."
else
    head="BLOCKED by grill-gate: в ответе есть вопрос владельцу, а законы и правила за этот ход не читались."
fi

reason="$head Вопрос, ответ на который уже записан, владельцу не задаётся — правило ведения работы. Прогони поиск по словам темы и ответь по найденному; спрашивай только то, что документацией не покрыто:

    grep -rn -i \"<слово темы>\" $laws_dir $rules_dir $specs_dir $plans_dir $archive_dir

Гард судит один ход: следующий заход не отбивается."

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть.
# Файл может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

# Форма отказа у двух событий разная: вызов инструмента отбивается решением о доступе, а
# завершение хода — решением о ходе. Одна форма на оба события молча не срабатывает.
if [ -n "$tool" ]; then
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"grill-gate: прочитай законы и правила по теме, прежде чем спрашивать владельца."}}\n'
else
    jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
        || printf '{"decision":"block","reason":"grill-gate: прочитай законы и правила по теме, прежде чем спрашивать владельца."}\n'
fi

exit 0
