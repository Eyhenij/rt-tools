#!/usr/bin/env bash
# rt-hook: PreToolUse Edit|Write|MultiEdit
# Requires: rules/task-flow.md, hooks/deny-tail.sh
# Handover entry guard: a session started from a handover edits no file until the work-conduct rule
# is loaded.
#
# The handover was written by the previous session, lies outside the tree and is read by no check.
# It gets read as an assignment, and work begins past the rule: the state is not checked against the
# tree, the numbers are taken on trust, the entry order is followed from memory. An order written
# only in words is followed as long as someone remembers it.
#
# The session is recognised by the owner's first message: it names the handover path or carries its
# text. The rule load is recognised by a call of the rules tool in the same session.
#
# FAIL-OPEN: no `jq`, no transcript, no handover in the message → pass.

# Its own name in the observations: the refusal is recorded by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=handoff-entry-guard

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

# The work-conduct rule has its own name in each tree, but the handover directory is shared: the
# guard looks at both signs.
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

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the refusal reason stays as it is.
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
