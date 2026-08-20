#!/usr/bin/env bash
# rt-kit v0.9.1 · hooks/exam-guard.sh · 17dff658eb06 · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|mcp__webstorm__create_new_file|Bash
# Требует: agents/strict-teacher.md, hooks/roles.sh, hooks/deny-tail.sh
# Гард экзамена: правка не идёт, пока за сессию не сдан экзамен по загруженным правилам.
#
# Зачем именно так. Гейт правил требует загрузить правило перед правкой и на этом кончается:
# загруженное правило и прочитанное правило для дерева неразличимы. Правило на четыре сотни
# строк уезжает в контекст целиком, а исполняется выборочно — промахи случаются после того, как
# правило было загружено. Спрашивает роль экзаменатора, а гард судит её вердикт.
#
# Вердикт роль отдаёт первой строкой: «ЭКЗАМЕН: сдано N из 5». Сдано — это пять из пяти; любое
# другое число означает, что правило перечитывается целиком и экзамен пересдаётся.
#
# Списанный ответ экзаменом не считается. Отличить его от знания роль не может — а гард может:
# между вопросами и ответами не должно быть чтения тех же правил. Признак грубый и своей границы
# не скрывает: чтение соседнего правила он засчитает списыванием тоже.
#
# FAIL-OPEN: нет jq, нет записи хода, чужой инструмент → пропуск. Сломанный гард не должен
# мешать работать.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

# Роль, выключенная деревом, гарда не держит: список выключенных лежит в настройке дерева, а
# читает его помощник рядом. Нечитаемая настройка выключением не считается — гард работает как
# прежде.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/roles.sh" ] && . "$rt_hooks_dir/roles.sh" 2>/dev/null
command -v rt_role_off >/dev/null 2>&1 && rt_role_off strict-teacher && exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
# Второй экзамен спрашивается на снятии черновика: работа кончилась, и правила поставки к этому
# моменту читались давно — между их чтением и этой минутой прошёл весь заход.
ready=0
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file) ;;
    Bash)
        cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
        printf '%s' "$cmd" | grep -qE 'pr[[:space:]]+ready|mr[[:space:]]+update[^|;&]*--ready' || exit 0
        ready=1
        ;;
    *) exit 0 ;;
esac

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

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
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$reason"
    exit 0
}

# Судится вся сессия, а не последний ход: экзамен сдаётся один раз на старте и держится до конца.
verdict="$(jq -s -r '
    [.[] | select(.type == "user") | .message.content // [] | select(type == "array") | .[]
       | select(.type == "tool_result") | .content
       | if type == "string" then .
         elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
         else tostring end] | join("\n")
    | [scan("ЭКЗАМЕН:[[:space:]]*сдано[[:space:]]*([0-9]+)[[:space:]]*из[[:space:]]*([0-9]+)")]
    | if length == 0 then "нет"
      else (.[-1] | if .[0] == .[1] then "сдан" else "провален" end)
      end
' "$transcript" 2>/dev/null)"

# Второй экзамен — тот, что вынесен после открытия PR. Первый его не заменяет: спрашивают о
# разном, и между ними лежит вся работа.
if [ "$ready" = "1" ]; then
    # Записи сводятся в один поток в порядке их появления: команда и ответ инструмента лежат в
    # разных полях, и индекс из одного массива в другом не значит ничего.
    after="$(jq -s -r '
        [ .[]
          | if .type == "assistant"
            then ([(.message.content // [])[] | select(.type == "tool_use") | (.input.command // "")] | join("\n"))
            elif .type == "user"
            then ([(.message.content // []) | select(type == "array") | .[]
                     | select(.type == "tool_result") | .content
                     | if type == "string" then . elif type == "array"
                       then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
                       else tostring end] | join("\n"))
            else "" end ] as $flow
        | ($flow | map(test("pr[[:space:]]+create|mr[[:space:]]+create")) | index(true)) as $opened
        | if $opened == null then "нет-pr"
          else ($flow[($opened + 1):] | join("\n")
                | [scan("ЭКЗАМЕН:[[:space:]]*сдано[[:space:]]*([0-9]+)[[:space:]]*из[[:space:]]*([0-9]+)")]
                | if length == 0 then "нет"
                  elif (.[-1] | .[0] == .[1]) then "сдан"
                  else "провален" end)
          end
    ' "$transcript" 2>/dev/null)"
    case "$after" in
        сдан | нет-pr) exit 0 ;;
        *)
            deny "BLOCKED by exam-guard: черновик снимается после второго экзамена, а его за эту сессию не было. Позови роль strict-teacher с правилами поставки и с тем, чего требовала задача: между чтением этих правил и снятием черновика прошёл весь заход."
            ;;
    esac
fi

case "$verdict" in
    сдан) exit 0 ;;
    провален)
        deny "BLOCKED by exam-guard: экзамен по загруженным правилам провален. Перечитай правило целиком — не тот кусок, о котором спрашивали, — и позови роль strict-teacher снова. Показанный ответ даёт знание одной строки, а не правила."
        ;;
    *)
        deny "BLOCKED by exam-guard: за эту сессию экзамена по загруженным правилам не было. Позови роль strict-teacher, передай ей список загруженных правил, ответь на её вопросы по памяти и верни ей ответы — вердикт она отдаёт строкой «ЭКЗАМЕН: сдано N из 5». Загруженное правило и прочитанное правило — разные вещи, и цену этой разницы платит владелец."
        ;;
esac
