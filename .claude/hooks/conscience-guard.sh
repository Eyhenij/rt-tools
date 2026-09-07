#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/conscience-guard.sh · f2524885d4ae · правится надстройкой, не здесь
# rt-hook: Stop
# Requires: agents/conscience.md, hooks/roles.sh, hooks/deny-tail.sh
# Guard of conscience: a turn in which the conscience role found a repeat of an analysed miss does
# not end until the repeat has been dealt with or named to the owner.
#
# Why exactly so. An incident analysis explains the mechanism of a miss, but it is read only by
# whoever opens the directory himself. The miss that has to be recalled is exactly the one the
# executor does not remember at this minute, so calling the role is not left to his discretion: it
# would not happen where it is needed most.
#
# The role answers with its first line: «СОВЕСТЬ: повтор» or «СОВЕСТЬ: чисто». The guard judges the
# last answer of the turn and knows nothing about whether the finding is right: that is decided by
# the executor, and his decision is the work of the next turn, not the silence of this one.
#
# The turn is released when, after the finding, the executor did at least something about it:
# started an incident analysis, corrected the work or named the repeat to the owner. This is checked
# on the same turn.
#
# FAIL-OPEN: no `jq`, no turn record, the role stays silent or answers out of form — the turn is
# ALLOWED. A broken conscience has no right to jam the conversation.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=conscience-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

# A role switched off by the tree does not hold the guard: the list of the switched-off ones lies in
# the tree setting, and a helper next to it reads that list. An unreadable setting does not count as
# switching off — the guard works as before.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/roles.sh" ] && . "$rt_hooks_dir/roles.sh" 2>/dev/null
command -v rt_role_off >/dev/null 2>&1 && rt_role_off conscience && exit 0

active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# The turn is everything recorded after the owner's last real remark. A tool answer arrives under
# the same role, so lines with `tool_result` do not count as a remark.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
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

# The shared deny tail: two lawful moves. The file may not be laid out — then there is no tail, and
# the refusal reason stays as it is.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"conscience-guard: найден повтор разобранного промаха — разбери его или назови владельцу."}\n'

exit 0
