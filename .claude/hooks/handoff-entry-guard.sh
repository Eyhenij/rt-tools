#!/usr/bin/env bash
# rt-kit v0.12.0 · hooks/handoff-entry-guard.sh · 2dd9e84cd2d6 · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit
# Требует: rules/task-flow.md, hooks/deny-tail.sh
# Гард входа из передачи: заход, начатый с передачи, не правит файлов, пока не загружено правило
# ведения работы.
#
# Передача написана прошлым заходом, лежит вне дерева и не читается ни одной проверкой. Её
# читают как задание — и берутся за работу мимо правила: состояние не сверено с деревом, числа
# взяты на веру, порядок входа исполняется по памяти. Порядок, записанный только словами,
# исполняется, пока о нём помнят.
#
# Заход узнаётся по первой реплике владельца: в ней назван путь к передаче либо её текст.
# Загрузка правила — по вызову инструмента правил за тот же заход.
#
# FAIL-OPEN: нет `jq`, нет записи хода, передачи в реплике нет → пропуск.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"
case "$tool" in
    Edit | Write | MultiEdit) ;;
    *) exit 0 ;;
esac

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# Имя правила ведения работы у дерева своё, но каталог передач общий: гард смотрит оба признака.
rule="${RT_TASK_FLOW_RULE:-task-flow}"

verdict="$(jq -s -r --arg rule "$rule" '
    [.[] | select(.type == "user") | .message.content
       | if type == "string" then . elif type == "array"
         then (map(if type == "object" then (.text // "") else "" end) | join("\n")) else "" end] as $said
    | [.[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")
       | ((.name // "") + " " + ((.input.skill // .input.command // "") | tostring))] as $used
    | (($said | join("\n")) | test("handoff|передач[аи][[:space:]]+захода")) as $from_handoff
    | (($used | join("\n")) | test("Skill[[:space:]]+" + $rule + "|skills/" + $rule)) as $loaded
    | if ($from_handoff and ($loaded | not)) then "нет-правила" else "ладно" end
' "$transcript" 2>/dev/null)"

[ "$verdict" = "нет-правила" ] || exit 0

reason="BLOCKED by handoff-entry-guard: заход начат с передачи, а правило ведения работы за него не загружено.

Передача написана прошлым заходом, лежит вне дерева и не читается ни одной проверкой: всё, что в ней стоит, проверяется деревом. Порядок входа — четыре шага:

    1. правило ведения работы и паттерн возвращения — первым движением;
    2. ветка и состояние работы читаются в дереве, а не в передаче;
    3. числа из передачи пересчитываются на текущем коммите;
    4. следующий шаг берётся из хода работы.

Загрузи правило и повтори правку."

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
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"handoff-entry-guard: правило ведения работы не загружено."}}\n'
exit 0
