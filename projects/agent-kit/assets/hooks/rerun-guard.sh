#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Требует: hooks/deny-tail.sh
# Гард перезапуска прогона: упавшее задание не перезапускается, пока его журнал не прочитан.
#
# Красное на прогоне бывает двух родов, и со стороны списка они выглядят одинаково: отказ
# хостинга на шаге подготовки — раннер не скачал действие, ответ `429` — и дефект самой ветки.
# Первый лечится перезапуском, второй перезапуском не лечится вовсе: та же ветка падает тем же
# местом, и круг повторяется, пока кто-нибудь не откроет журнал. Три прогона одного дня так и
# перезапускались подряд.
#
# Гард судит ПОРЯДОК, а не причину падения: журнал раньше перезапуска. Что в журнале написано,
# он не читает и читать не может — красное по существу судит человек.
#
# Признак чтения — вызов за тот же ход, показывающий журнал этого задания: номер задания в
# команде тот же, что и в перезапуске. Номер сверяется, потому что прочитанный журнал соседнего
# задания о нашем не говорит ничего, а по списку прогонов они стоят рядом.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: нет `jq`, нет записи хода, номер задания в команде не назван, вызов не
# похож на перезапуск — пропуск. Гард без номера судить не берётся: перезапуск последнего
# упавшего прогона зовут и без него, а угадывать, о каком задании речь, значит отбивать наугад.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    # Терминал среды и универсальный исполнитель кладут команду в то же поле.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -z "$cmd" ] && exit 0

# Профиль дерева: сперва умолчание пакета, поверх него — надстройка проекта, если она есть.
# Имя клиента хостинга дерево называет само: у каждого вида оно своё, а угаданное не совпадает
# ни с чем.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# Вызов перезапуска: слово перезапуска отдельным словом рядом со словом прогона.
host_cli="${RT_HOST_CLI:-gh}"
printf '%s' "$cmd" | grep -qE "(^|[;&|(]|&&|\|\|)[[:space:]]*${host_cli}([[:space:]]|$)" || exit 0
printf '%s' "$cmd" | grep -qE '(^|[[:space:]])(run|workflow)([[:space:]]|$)' || exit 0
printf '%s' "$cmd" | grep -qE '(^|[[:space:]])rerun([[:space:]]|$)' || exit 0

# Номер задания. Не назван — гард молчит: судить не о чем.
run_id="$(printf '%s' "$cmd" | grep -oE '(^|[[:space:]])[0-9]{6,}([[:space:]]|$)' | tr -d ' ' | head -1)"
[ -z "$run_id" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# Читался ли журнал ЭТОГО задания за тот же ход. Ход — вызовы после последней реплики владельца:
# журнал, прочитанный вчера, о сегодняшнем состоянии прогона не говорит ничего.
seen="$(jq -s -r --arg id "$run_id" '
    [.[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")
       | ((.input.command // "") | tostring)] as $used
    | (($used | join("\n")) | test("run[[:space:]]+view[^\\n]*" + $id + "|" + $id + "[^\\n]*--log")) as $read
    | if $read then "читал" else "не-читал" end
' "$transcript" 2>/dev/null)"

[ "$seen" = "читал" ] && exit 0

reason="BLOCKED by rerun-guard: перезапуск задания ${run_id} без прочитанного журнала. Красное на прогоне бывает двух родов, и в списке они выглядят одинаково: отказ хостинга на шаге подготовки лечится перезапуском, дефект ветки — не лечится им вовсе, и круг повторяется, пока журнал не открыт. Прочитай журнал этого задания — ${host_cli} run view ${run_id} --log-failed — и повтори вызов. Гард судит порядок, а не причину падения: что в журнале написано, судишь ты."

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть.
# Файл может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"rerun-guard: журнал задания за этот ход не читался."}}\n'
exit 0
