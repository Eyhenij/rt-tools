#!/usr/bin/env bash
# rt-hook: Stop
# Требует: agents/conscience.md
# Гард совести: ход, в котором роль совести нашла повтор разобранного промаха, не заканчивается,
# пока повтор не разобран или не назван владельцу.
#
# Зачем именно так. Разбор происшествия объясняет механизм промаха, но читает его только тот, кто
# открывает каталог сам. Промах, о котором надо напомнить, — ровно тот, о котором исполнитель в
# эту минуту не помнит, поэтому вызов роли не оставляют на его усмотрение: он не случится там,
# где нужнее всего.
#
# Роль отвечает первой строкой: «СОВЕСТЬ: повтор» либо «СОВЕСТЬ: чисто». Гард судит последний
# ответ за ход и ничего не знает о том, верна ли находка: это решает исполнитель, и его решение
# — работа следующего хода, а не молчание этого.
#
# Ход отпускается, когда после находки исполнитель сделал хоть что-то по ней: завёл разбор
# происшествия, поправил работу или назвал повтор владельцу. Проверяется это по тому же ходу.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет `jq`, нет записи хода, роль молчит или отвечает не по форме — ход
# разрешается. Сломанная совесть не имеет права заклинить разговор.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# Ход — всё, что записано после последней настоящей реплики владельца. Ответ инструмента
# приходит той же ролью, поэтому строки с `tool_result` репликой не считаются.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
    def is_input:
        .type == "user"
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end) as $turn
    | [ $turn[]
        | if .type == "assistant"
          then ([(.message.content // [])[]
                  | if .type == "tool_use" then (.input.command // "") else (.text // "") end] | join("\n"))
          elif .type == "user"
          then ([(.message.content // []) | select(type == "array") | .[]
                   | select(.type == "tool_result") | .content
                   | if type == "string" then . elif type == "array"
                     then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
                     else tostring end] | join("\n"))
          else "" end ] as $flow
    | ($flow | map(test("СОВЕСТЬ:[[:space:]]*повтор")) | index(true)) as $found
    | if $found == null then "нет-находки"
      else ($flow[($found + 1):] | join("\n")
            | if test("postmortems|разбор происшествия|СОВЕСТЬ: разобрано") then "разобрано" else "висит" end)
      end
' 2>/dev/null)"

[ "$verdict" = "висит" ] || exit 0

detail="$(tail -n 400 "$transcript" 2>/dev/null | grep -m1 -A3 'СОВЕСТЬ:[[:space:]]*повтор' | tr -d '\\"' | head -4)"

reason="BLOCKED by conscience-guard: совесть нашла в этом ходе повтор разобранного промаха, и по нему не сделано ничего.

${detail}

Ход не кончается на находке. Сделай одно из трёх этим же ходом: поправь работу, заведи разбор происшествия, если механизм новый, или назови повтор владельцу словами — что повторяется и чем это кончилось в прошлый раз.

Находка неверна — так и скажи владельцу: ложная находка тоже стоит хода, и молчанием она не чинится.

Гард судит один ход: следующий заход не отбивается."

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"conscience-guard: найден повтор разобранного промаха — разбери его или назови владельцу."}\n'

exit 0
