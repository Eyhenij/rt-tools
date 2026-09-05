#!/usr/bin/env bash
# rt-kit v0.24.0 · hooks/window-fill-guard.sh · ad1098bf9dda · правится надстройкой, не здесь
# rt-hook: PostToolUse .*
# Требует: hooks/profile-check.sh, hooks/deny-tail.sh
# rt-hook: PreToolUse .*
# Заполнение окна: заход доводится до логической точки заранее, а не обрывается на середине.
#
# Зачем именно так. Место, где исполнитель помнит ход работы, ограничено, и заполнив его, он
# теряет не последнее действие, а всю картину разом. Изнутри захода этот предел не виден ничем:
# ни одна проверка дерева его не показывает, а сжатие контекста срабатывает, когда доводить
# работу до точки уже нечем.
#
# Гард стоит на двух событиях сразу — разводить его по двум файлам значило бы держать два
# разбора одной записи и два места, где правится один порог:
#   PostToolUse — на первом пороге отдаёт напоминание: пора выбирать точку остановки;
#   PreToolUse  — на втором отбивает всё, кроме записи хода работы, передачи и команд поставки.
# Место между порогами и есть то, на что закрывается заход: дописать ход работы, написать
# передачу, закоммитить проверенное.
#
# Там, где дерево объявило порог сжатия ниже порога остановки, напоминание говорит обратное:
# точку остановки выбирать не надо, потому что заход через порог пройдёт сам — сжатие придёт
# первым, передачу к тому времени напишет свой хук, и работа продолжится тем же заходом. Отбой
# при этом остаётся: он превращается из конца захода в страховку на случай, когда сжатие не
# пришло. Напоминание, зовущее закрывать заход там, где закрывать его не надо, — это остановка
# работы без причины, и стоит она ровно того же, что и отбой.
#
# Размер окна берётся из настройки дерева. Из записи захода он не выводится: модель записана
# там без пометки о расширенном окне, и заход на широкое окно от захода на узкое неотличим.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет размера окна, нет записи захода, нет разборщика, битый разбор —
# работа РАЗРЕШАЕТСЯ (exit 0). Сломанный гард не имеет права заклинить работу.

# Своё имя в наблюдениях: отбой пишет общий хвост отказа, а не сам гард.
RT_GUARD_NAME=window-fill-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# Профиль дерева: размер окна, пороги, каталоги задач и передачи. Дерево, не задавшее размера
# окна, стража не получает — считать долю не от чего.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# Слово о нехватке функции профиля: хук, вышедший молча, неотличим от работающего. Файл может
# быть не разложен — тогда остаётся прежнее поведение, молчаливое.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

window="${RT_WINDOW_TOKENS:-}"
case "$window" in
    '' | *[!0-9]*) exit 0 ;;
esac
[ "$window" -gt 0 ] 2>/dev/null || exit 0

warn_pct="${RT_WINDOW_WARN_PCT:-40}"
stop_pct="${RT_WINDOW_STOP_PCT:-50}"

# Доля, на которой контекст сжимает сам инструмент. Объявлена деревом — заход через порог
# проходит сам: сжатие приходит первым, передачу к тому моменту уже написал свой хук, и работа
# идёт дальше тем же заходом. Не объявлена — прежний порядок: заход кончается передачей.
#
# От этого зависит текст напоминания, а не отказ. Отбой на пороге остановки остаётся в обоих
# случаях: он и есть страховка на случай, когда сжатие не пришло — настройка снята, версия
# другая, сжатие отказало. Отобрав отбой у дерева, объявившего сжатие, страж пустил бы такой
# заход до предела окна, где работа теряется целиком.
compact_pct="${CLAUDE_AUTOCOMPACT_PCT_OVERRIDE:-}"
case "$compact_pct" in
    '' | *[!0-9]*) compact_pct='' ;;
esac
[ -n "$compact_pct" ] && [ "$compact_pct" -ge "$stop_pct" ] 2>/dev/null && compact_pct=''

tasks_dir="${RT_TASKS_DIR:-docs/tasks}"
handoff_dir="${RT_HANDOFF_DIR:-.claude/handoff}"

event="$(printf '%s' "$input" | jq -r '.hook_event_name // empty' 2>/dev/null)"
transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -n "$transcript" ] || exit 0
[ -f "$transcript" ] || exit 0

# Заполнение — это последняя запись ответа с расходом: вход, разовая запись в кэш, прочитанное
# из кэша и вывод. Сумма по всем записям тут не годится вовсе — прочитанное из кэша повторяется
# в каждой из них, и сумма выходит в разы больше окна.
#
# Хвост в 200 строк: запись захода растёт весь заход, а нужна из неё одна последняя строка.
fill="$(tail -n 200 "$transcript" 2>/dev/null | jq -s -r '
    [.[] | select(.type == "assistant") | .message.usage | select(. != null)]
    | last
    | if . == null then empty
      else ((.input_tokens // 0) + (.cache_creation_input_tokens // 0)
            + (.cache_read_input_tokens // 0) + (.output_tokens // 0))
      end
' 2>/dev/null)"

case "$fill" in
    '' | *[!0-9]*) exit 0 ;;
esac

pct=$((fill * 100 / window))
fill_k=$((fill / 1000))
window_k=$((window / 1000))

# --- первый порог: напоминание, работа не отбивается -------------------------------------

if [ "$event" = "PostToolUse" ]; then
    [ "$pct" -ge "$warn_pct" ] || exit 0

    # Напоминание повторяется не на каждом вызове, а на каждой следующей ступени в пять
    # процентов: иначе оно занимает то самое место, которое бережёт.
    step=$(((pct / 5) * 5))
    session="$(printf '%s' "$input" | jq -r '.session_id // "unknown"' 2>/dev/null)"
    mark_dir="${TMPDIR:-/tmp}/claude-window-fill"
    mark="$mark_dir/$session.step"
    mkdir -p "$mark_dir" 2>/dev/null
    last="$(cat "$mark" 2>/dev/null)"
    case "$last" in
        '' | *[!0-9]*) last=0 ;;
    esac
    [ "$step" -gt "$last" ] || exit 0
    printf '%s' "$step" > "$mark" 2>/dev/null

    if [ "$pct" -ge "$stop_pct" ]; then
        if [ -n "$compact_pct" ]; then
            text="ЗАПОЛНЕНИЕ ОКНА ${pct}% (${fill_k}k из ${window_k}k) — заход закрывается сейчас. Сжатие объявлено на ${compact_pct}% и не пришло: порог остановки ${stop_pct}% пройден, а контекст прежний. Всё, кроме записи хода работы, передачи и команд поставки, уже отбивается — закрывай заход и скажи владельцу, что сжатие не сработало."
        else
            text="ЗАПОЛНЕНИЕ ОКНА ${pct}% (${fill_k}k из ${window_k}k) — заход закрывается сейчас. Всё, кроме записи хода работы, передачи и команд поставки, уже отбивается."
        fi
    elif [ -n "$compact_pct" ]; then
        text="ЗАПОЛНЕНИЕ ОКНА ${pct}% (${fill_k}k из ${window_k}k). Точку остановки выбирать не надо: на ${compact_pct}% инструмент сожмёт контекст сам, передачу к тому времени напишет хук, и работа пойдёт дальше этим же заходом. Порог остановки ${stop_pct}% — страховка на случай, если сжатие не придёт. Работай дальше."
    else
        text="ЗАПОЛНЕНИЕ ОКНА ${pct}% (${fill_k}k из ${window_k}k). Пора выбирать точку остановки: с ${stop_pct}% останется только закрыть заход. Доведи текущий шаг до состояния, с которого следующий заход продолжит, перепиши «Где стоим» в ходе работы, напиши передачу и отдай владельцу путь к ней — паттерн task-flow-handoff."
    fi

    jq -n --arg t "$text" \
        '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$t}}' 2>/dev/null
    exit 0
fi

# --- второй порог: работа отбивается, закрытие захода пропускается ------------------------

[ "$event" = "PreToolUse" ] || exit 0
[ "$pct" -ge "$stop_pct" ] || exit 0

tool="$(rt_hook_tool)"
path="$(rt_hook_file)"
cmd="$(rt_hook_cmd)"

allowed=0
case "$tool" in
    # Разговор с владельцем и чтение того, что правится при закрытии.
    AskUserQuestion | TodoWrite | Read | SendUserFile)
        allowed=1
        ;;
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
        # Ход работы и передача. Остальное — работа, а её заход уже не начинает.
        case "$path" in
            "$tasks_dir"/* | */"$tasks_dir"/* | "$handoff_dir"/* | */"$handoff_dir"/* | */scratchpad/*) allowed=1 ;;
        esac
        ;;
    Bash | mcp__webstorm__execute_terminal_command)
        # Поставка и сверки: коммит, пуш, PR, колонка задачи, состояние дерева. Список
        # дописывается профилем дерева — клиент хостинга и имена команд у каждого свои.
        if rt_needs rt_handoff_allowed_cmd window-fill-guard && rt_handoff_allowed_cmd "$cmd"; then
            allowed=1
        fi
        ;;
esac

[ "$allowed" -eq 1 ] && exit 0

reason="BLOCKED by window-fill-guard: заполнение окна ${pct}% (${fill_k}k из ${window_k}k), порог остановки ${stop_pct}%. Заход дальше не работает — он закрывается.

Что осталось сделать этим заходом:
1. Перепиши раздел «Где стоим» в ходе работы и добавь запись захода — что сделано, чем подтверждено, что не вышло.
2. Закоммить проверенное: незакоммиченное не переживёт перерыв.
3. Напиши передачу в ${handoff_dir}/ и отдай владельцу путь к ней — что в неё входит, говорит паттерн task-flow-handoff.

Что после порога проходит:
- правка ${tasks_dir}/** и ${handoff_dir}/**, чтение любого файла, вопрос владельцу;
- команда, начинающаяся со слова поставки или сверки: git, клиент хостинга, перевод колонки, npm run check:*.

Команда судится по началу строки: вход в каталог перед ней снимает совпадение, и отбит будет тот же коммит, который прошёл бы без него. Начинай команду с самого слова поставки."

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть.
# Файл может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"window-fill-guard: окно заполнено, заход закрывается передачей."}}\n'

exit 0
