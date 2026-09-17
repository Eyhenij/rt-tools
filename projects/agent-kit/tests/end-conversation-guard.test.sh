#!/usr/bin/env bash
# Сценарии проверки на закрытие разговора: вызов инструмента завершения отклоняется всегда,
# другие инструменты проходят, без разборчика JSON отказ остаётся.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверка на закрытие разговора"

call() {
    printf '{"tool_name":%s,"tool_input":{"reason":"done"}}' "$(printf '%s' "$1" | jq -Rs .)"
}

decision() {
    local out
    out="$(call "$1" | "$HOOKS/end-conversation-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        printf 'PASS'
    else
        printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"' 2>/dev/null
    fi
}

report "SC-AK-1121 — вызов инструмента завершения разговора отклоняется" "$(decision EndConversation)" deny
report "SC-AK-1121 — то же имя с префиксом поставщика отклоняется" "$(decision mcp__host__EndConversation)" deny
report "SC-AK-1121 — довод отказа называет владельца" \
    "$(call EndConversation | "$HOOKS/end-conversation-guard.sh" 2>/dev/null | jq -r '.hookSpecificOutput.permissionDecisionReason' | grep -c 'ended by the owner')" 1
report "SC-AK-1121 — код возврата нулевой при отказе" \
    "$(call EndConversation | "$HOOKS/end-conversation-guard.sh" >/dev/null 2>&1; printf '%s' "$?")" 0
report "SC-AK-1121 — другой инструмент проходит" "$(decision Bash)" PASS
report "SC-AK-1121 — вопрос владельцу проходит" "$(decision AskUserQuestion)" PASS

# Без разборчика JSON имя читается grep по сырому вводу: отказ остаётся.
NOJQ="$(mktemp -d)"
for bin in bash grep printf cat sed head tr dirname; do
    p="$(command -v "$bin")"; [ -n "$p" ] && ln -s "$p" "$NOJQ/$bin"
done
report "SC-AK-1121 — без jq отказ остаётся" \
    "$(call EndConversation | PATH="$NOJQ" bash "$HOOKS/end-conversation-guard.sh" 2>/dev/null | grep -c '"permissionDecision":"deny"')" 1
report "SC-AK-1121 — без jq другой инструмент проходит" \
    "$(call Bash | PATH="$NOJQ" bash "$HOOKS/end-conversation-guard.sh" 2>/dev/null | grep -c 'deny')" 0
rm -rf "$NOJQ"

# Объявление проверки: диспетчер зовёт её по имени инструмента.
report "SC-AK-1121 — объявлена на событие перед вызовом по имени инструмента" \
    "$(sed -n '2p' "$HOOKS/end-conversation-guard.sh")" '# rt-hook: PreToolUse .*EndConversation.*'

suite_result "проверка на закрытие разговора"
