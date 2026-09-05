#!/usr/bin/env bash
# rt-kit v0.24.0 · hooks/exam-guard.sh · 66fb527f5102 · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|mcp__webstorm__create_new_file|Bash|mcp__webstorm__execute_terminal_command
# Требует: agents/strict-teacher.md, hooks/roles.sh, hooks/deny-tail.sh, hooks/write-targets.sh
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
# Вердикт ищется во всех формах записи хода, а не в одной. Форму доставки выбирает хост: роль,
# работающая фоном, отдаёт результат уведомлением о завершении, и записи вида «ответ инструмента»
# у неё нет вовсе. Дерево, где роль так и работает, гард запер целиком — пять кругов экзамена с
# полным вердиктом не отпустили ни одной правки; разбор — в описаниях происшествий.
#
# Отброшены при этом две формы, и обе намеренно. Свой текст помощника вердиктом не бывает:
# написать нужную строку в ответе стоит одного движения. Ответы инструментов чтения и записи —
# тоже: печать той же строки эхом или чтение файла с нею проходили бы гард, то есть единственным
# достижимым способом стала бы подделка. Засчитывается ответ инструмента, который читать и
# писать файлы не умеет, — им роль и запускают.
#
# Из-под гарда выведены настройка дерева, её надстройки и передача захода: настройка, которой
# гард выключается, этим гардом не запирается — иначе выхода из отказа нет вовсе. Отправка груза
# в приём заперта была той же дырой: адрес приёма живёт в той же настройке.
#
# FAIL-OPEN: нет jq, нет записи хода, чужой инструмент → пропуск. Сломанный гард не должен
# мешать работать.

# Своё имя в наблюдениях: отбой пишет общий хвост отказа, а не сам гард.
RT_GUARD_NAME=exam-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

# Роль, выключенная деревом, гарда не держит: список выключенных лежит в настройке дерева, а
# читает его помощник рядом. Нечитаемая настройка выключением не считается — гард работает как
# прежде.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/roles.sh" ] && . "$rt_hooks_dir/roles.sh" 2>/dev/null
command -v rt_role_off >/dev/null 2>&1 && rt_role_off strict-teacher && exit 0

# Цели записи разбирает общий помощник — тот же, которым их разбирает гард места правки.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/write-targets.sh" ] && . "$rt_hooks_dir/write-targets.sh" 2>/dev/null
command -v rt_write_targets >/dev/null 2>&1 || rt_write_targets() { cat >/dev/null; }

# Пути, которые гард не судит: настройка дерева, её надстройки и каталог передачи захода.
# Печатает «да», если все названные цели выведены из-под гарда.
rt_exam_free_paths() {
    free=1
    while IFS= read -r target; do
        [ -z "$target" ] && continue
        case "$target" in
            *.claude/rt-kit.json | *.claude/rt-kit/* | *.claude/handoff/*) ;;
            *) free=0 ;;
        esac
    done
    [ "$free" = "1" ] && printf 'да'
}

tool="$(rt_hook_tool)"
# Второй экзамен спрашивается на снятии черновика: работа кончилась, и правила поставки к этому
# моменту читались давно — между их чтением и этой минутой прошёл весь заход.
ready=0
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
        target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        [ -n "$target" ] && [ "$(printf '%s\n' "$target" | rt_exam_free_paths)" = "да" ] && exit 0
        ;;
    Bash | mcp__webstorm__execute_terminal_command)
        cmd="$(rt_hook_cmd)"
        # Снятием черновика считается вызов клиента, а не вхождение слов: команда, которая только
        # пишет о снятии — строка в файле предложений, тело коммита, разбор происшествия, —
        # проверялась наравне с самим снятием, и отказ приходил на попытку описать этот дефект.
        if printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}(gh[[:space:]]+pr[[:space:]]+ready|glab[[:space:]]+mr[[:space:]]+update[^|;&]*--ready)([[:space:]]|\$)"; then
            ready=1
        else
            # Запись файла вызовом оболочки судится наравне с правкой: закрытый честный путь при
            # открытом обходном означает, что гард держит того, кто правилам следует, и пропускает
            # того, кто их обходит.
            targets="$(printf '%s' "$cmd" | rt_write_targets)"
            [ -z "$targets" ] && exit 0
            [ "$(printf '%s\n' "$targets" | rt_exam_free_paths)" = "да" ] && exit 0
        fi
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

# Второй выход у отказа — не требующий снимать защиту.
#
# Единственным выходом гард называл список выключенных ролей в настройке дерева. Среда, где
# работает исполнитель, правку такого списка запрещает своим механизмом, о котором гард не знает:
# одно правило говорит «выйди отсюда», второе — «этим путём нельзя», и работа стоит при зелёном
# наборе и сказанном слове владельца.
#
# Обход объявляется строкой `Exam-skip: <причина>` в теле последнего коммита ветки: она остаётся
# в истории и видна владельцу на странице заявки. Причина обязательна — подстановка вместо неё
# обходом не считается, как и у гарда документов.
rt_exam_declared_skip() {
    git -C "${CLAUDE_PROJECT_DIR:-.}" log -1 --format=%B 2>/dev/null \
        | grep -qE '^Exam-skip:[[:space:]]*[^[:space:]<]'
}

deny() {
    if rt_exam_declared_skip; then
        printf 'гард экзамена: обход объявлен в теле последнего коммита строкой Exam-skip. Вызов пропущен, запись осталась в истории.\n' >&2
        exit 0
    fi

    reason="$1"
    tail_text="$(rt_deny_tail "$2")"
    [ -n "$tail_text" ] && reason="$1 ${tail_text}"
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$reason"
    exit 0
}

# Судится вся сессия, а не последний ход: экзамен сдаётся один раз на старте и держится до конца.
verdict="$(jq -s -r '
    def textof:
        if type == "string" then .
        elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
        else tostring end;

    # Инструменты, читающие и пишущие файлы: их ответ вердиктом не считается — иначе печать той
    # же строки эхом и чтение файла с нею проходят гард, а настоящий вердикт не проходит.
    ["Bash", "Read", "Grep", "Glob", "Edit", "Write", "MultiEdit", "NotebookEdit"] as $mute
    | [.[] | select(.type == "assistant") | (.message.content // [])[]
         | select(.type == "tool_use") | select(.name as $n | $mute | index($n) != null) | (.id // "")] as $muted

    | [ .[]
        # Свой текст помощника вердиктом не бывает: написать нужную строку в ответе стоит одного
        # движения.
        | if .type == "assistant" then ""
          elif .type == "user" then
              ([ ((.message.content // []) | if type == "array" then .[] else empty end
                    | select(.type == "tool_result")
                    | select((.tool_use_id // "") | if . == "" then true else ($muted | index(.)) == null end)
                    | .content | textof),
                 ((.message.content // "") | if type == "string" then . else "" end),
                 # Поле результата вызова: та же запись, другая форма. Отбрасывается, только
                 # если этот результат принадлежит инструменту чтения или записи.
                 (. as $rec
                  | if ($rec.toolUseResult // null) == null then ""
                    elif ([($rec.message.content // []) | if type == "array" then .[] else empty end
                            | select(.type == "tool_result") | (.tool_use_id // "")]
                          | map($muted | index(.)) | any(. != null)) then ""
                    else ($rec.toolUseResult | textof) end)
               ] | join("\n"))
          # Записи хоста — уведомление о завершении роли и вложение: форму их выбирает хост, и
          # засчитываются они целиком.
          else tostring end ] | join("\n")
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
        def textof:
            if type == "string" then .
            elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
            else tostring end;

        # Тот же набор форм, что у широкой выборки: вердикт приходит в той форме, какую выбрал
        # хост, и роль, работающая фоном, отдаёт его уведомлением о завершении — записи вида
        # «ответ инструмента» у неё нет. Раньше эта выборка читала только команды помощника и
        # ответы инструментов, и второй экзамен в таком дереве не засчитывался: пять кругов с
        # полным вердиктом не пропустили ни одной правки.
        ["Bash", "Read", "Grep", "Glob", "Edit", "Write", "MultiEdit", "NotebookEdit"] as $mute
        | [.[] | select(.type == "assistant") | (.message.content // [])[]
             | select(.type == "tool_use") | select(.name as $n | $mute | index($n) != null) | (.id // "")] as $muted

        # Запись даёт две строки: команду — по ней ищется момент открытия заявки — и вердикт,
        # который проверяется теми же правилами, что и в широкой выборке. Порядок один и тот же,
        # поэтому отсчёт от найденной команды остаётся верным.
        | [ .[] | {
              cmd: (if .type == "assistant"
                    then ([(.message.content // [])[] | select(.type == "tool_use") | (.input.command // "")] | join("\n"))
                    else "" end),
              say: (if .type == "assistant" then ""
                    elif .type == "user" then
                        ([ ((.message.content // []) | if type == "array" then .[] else empty end
                              | select(.type == "tool_result")
                              | select((.tool_use_id // "") | if . == "" then true else ($muted | index(.)) == null end)
                              | .content | textof),
                           ((.message.content // "") | if type == "string" then . else "" end),
                           (. as $rec
                            | if ($rec.toolUseResult // null) == null then ""
                              elif ([($rec.message.content // []) | if type == "array" then .[] else empty end
                                      | select(.type == "tool_result") | (.tool_use_id // "")]
                                    | map($muted | index(.)) | any(. != null)) then ""
                              else ($rec.toolUseResult | textof) end)
                         ] | join("\n"))
                    else tostring end)
          } ] as $flow
        | ($flow | map(.cmd | test("pr[[:space:]]+create|mr[[:space:]]+create")) | index(true)) as $opened
        | if $opened == null then "нет-pr"
          else ($flow[($opened + 1):] | map(.say) | join("\n")
                | [scan("ЭКЗАМЕН:[[:space:]]*сдано[[:space:]]*([0-9]+)[[:space:]]*из[[:space:]]*([0-9]+)")]
                | if length == 0 then "нет"
                  elif (.[-1] | .[0] == .[1]) then "сдан"
                  else "провален" end)
          end
    ' "$transcript" 2>/dev/null)"
    case "$after" in
        сдан | нет-pr) exit 0 ;;
        *)
            deny "BLOCKED by exam-guard: черновик снимается после второго экзамена, а его за эту сессию не было. Позови роль strict-teacher с правилами поставки и с тем, чего требовала задача: между чтением этих правил и снятием черновика прошёл весь заход. Выход через список выключенных ролей требует снять защиту, и среда исполнения такую правку может запрещать; второй выход её не требует — объяви обход строкой «Exam-skip: причина» в теле последнего коммита ветки: она остаётся в истории и видна владельцу на странице заявки."
            ;;
    esac
fi

case "$verdict" in
    сдан) exit 0 ;;
    провален)
        deny "BLOCKED by exam-guard: экзамен по загруженным правилам провален. Перечитай правило целиком — не тот кусок, о котором спрашивали, — и позови роль strict-teacher снова. Показанный ответ даёт знание одной строки, а не правила. Выход через список выключенных ролей требует снять защиту, и среда исполнения такую правку может запрещать; второй выход её не требует — обход объявляется строкой «Exam-skip: причина» в теле последнего коммита ветки."
        ;;
    *)
        deny "BLOCKED by exam-guard: за эту сессию экзамена по загруженным правилам не было. Позови роль strict-teacher, передай ей список загруженных правил, ответь на её вопросы по памяти и верни ей ответы — вердикт она отдаёт строкой «ЭКЗАМЕН: сдано N из 5». Засчитывается он из ответа роли в любой форме, какой его доставил хост, но не из вывода оболочки и не из твоего же текста: печать этой строки эхом гард не отпускает. Роль уже звали и вердикт получен — значит, он пришёл формой, которой гард не видит: это дефект гарда, и правка `.claude/rt-kit.json` из-под него выведена. Загруженное правило и прочитанное правило — разные вещи, и цену этой разницы платит владелец."
        ;;
esac
