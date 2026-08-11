#!/usr/bin/env bash
# rt-kit v0.5.0 · hooks/grill-gate.sh · 7c14371fb55d · правится надстройкой, не здесь
# rt-hook: Stop
# Гард разговора: ход, в котором владельцу задан вопрос, не заканчивается, пока за этот же ход
# не читались законы и правила. Stop.
#
# Зачем именно так. Требование «правила читаются до разговора» записано в правиле ведения
# работы, а исполнения у него не было: все прочие гарды судят правку файла или команду, а
# вопрос в чат ни тем, ни другим не является. Поймать его можно только на завершении хода —
# событие получает путь к записи хода и видит его целиком.
#
# Перехват инструмента меню вариантов эту дыру не закрывает: вопрос чаще задаётся прозой, и
# ровно так был задан тот, из-за которого гард заведён.
#
# Чтением правил считается любой из трёх путей: загрузка правила, чтение файла законов или
# правил, поиск по ним. Требовать именно загрузку значило бы гнать на неё там, где хватило
# одного поиска, — гард мешал бы работе вместо того, чтобы её выправлять.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: при любой ошибке, отсутствии записи хода и повторном заходе ход
# РАЗРЕШАЕТСЯ (exit 0). Сломанный гард не имеет права заклинить разговор.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# Повторный заход по тому же ходу не судится: иначе ход не кончится никогда — гард сказал своё
# один раз и отпускает.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

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

# Дерево, у которого нет ни законов, ни правил, требования не получает: читать нечего.
[ -z "$laws_dir" ] && [ -z "$rules_dir" ] && exit 0

# Образец, по которому вызов инструмента считается чтением правил. Каталоги идут в него как
# есть: точка в `.claude` совпадает с любым знаком и лишнего сюда не приводит.
read_re="$(printf '%s' "$laws_dir|$rules_dir|$specs_dir" | sed 's/^|*//; s/|*$//; s/||*/|/g')"
[ -z "$read_re" ] && exit 0

# Ход — это всё, что записано после последнего настоящего ввода владельца. Ответ инструмента
# приходит той же ролью `user`, поэтому строки с `tool_result` вводом не считаются: иначе ходом
# оказался бы кусок после последнего вызова инструмента, и чтение правил в его начале потерялось
# бы.
#
# Хвост в 400 строк: запись хода растёт всю сессию, а судится только последний ход.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg re "$read_re" '
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
    | ($uses | map(.name == "AskUserQuestion") | any) as $asked_menu
    | if ($asked_prose or $asked_menu) and ($read | not) then "ask" else "pass" end
' 2>/dev/null)"

[ "$verdict" = "ask" ] || exit 0

reason="BLOCKED by grill-gate: в ответе есть вопрос владельцу, а законы и правила за этот ход не читались. Вопрос, ответ на который уже записан, владельцу не задаётся — правило ведения работы. Прогони поиск по словам темы и ответь по найденному; спрашивай только то, что документацией не покрыто:

    grep -rn -i \"<слово темы>\" $laws_dir $rules_dir $specs_dir

Гард судит один ход: следующий заход не отбивается."

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"grill-gate: прочитай законы и правила по теме, прежде чем спрашивать владельца."}\n'

exit 0
