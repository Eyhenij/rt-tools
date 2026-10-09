#!/usr/bin/env bash
# rt-kit v0.29.4 · hooks/grill-gate-bypass.sh · 4832c977857b · правится надстройкой, не здесь
# The fifth sign of the conversation guard: a question that offers to walk around a check does not
# leave. NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The
# conversation guard sources it — it was moved out when the guard crossed the file length limit.
#
# A red set was explained by a "foreign" cause, and the owner was asked whether to send it past the
# check. Such a question is a miss by itself, even when the owner answers "yes": a check is fixed at
# its cause or fixed itself, and a third option is not named. The sign reads the text the owner
# reads — the menu with its options, or the last reply when it ends with a question — and looks for
# the forms of a bypass: past the check, a bypass line, a disabled rule, a hook switched off.
#
# It expects `$tool`, `$asked_text`, `$transcript` and `$rt_hooks_dir` to be set; it prints the
# refusal and returns zero when the question offers a bypass, and stays silent otherwise.
#
# FAIL-OPEN: no text of a question — the sign stays silent.

rt_grill_bypass() {
    local bypass_re offered_text reason deny_tail_text
    bypass_re='мимо (проверк|гейт|хук)|в обход (проверк|гейт|хук)|обойти (проверк|гейт|хук)|bypass|--no-verify|Epic-stop-skip|Docs-skip|Task-folder-skip|# discard:|eslint-disable|stylelint-disable|отключ[а-я]* (проверк|правил|линтер|хук)|в список известных|allowlist'
    if [ -n "$tool" ]; then
        offered_text="$asked_text"
    else
        offered_text="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
            def is_input:
                .type == "user"
                and ((.isCompactSummary // false) | not)
                and ((.isMeta // false) | not)
                and (((.message.content // []) | if type == "array"
                        then ([.[] | select(.type == "tool_result")] | length)
                        else 0 end) == 0);
            (map(is_input) | rindex(true)) as $i
            | (if $i == null then . else .[$i + 1:] end)
            | [.[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "text") | .text]
            | last // ""
            | if test("\\?[[:space:]]*$") then . else "" end
        ' 2>/dev/null)"
    fi
    [ -n "$offered_text" ] || return 1
    printf '%s' "$offered_text" | grep -qiE "$bypass_re" 2>/dev/null || return 1

    reason="BLOCKED by grill-gate: the question offers the owner to walk around a check.

A question about a bypass is a miss by itself, even when the owner answers «yes». A red check is fixed at its cause — on the machine and in the tree — or the check itself is fixed when it is wrong. A third option is not named, and handing the owner a command to run by hand instead is the same bypass. Ask only the decision the fix needs."

    # shellcheck disable=SC1090
    [ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    deny_tail_text="$(rt_deny_tail "")"
    [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

    if [ -n "$tool" ]; then
        jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
            || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"grill-gate: a question does not offer a bypass of a check."}}\n'
    else
        jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
            || printf '{"decision":"block","reason":"grill-gate: a question does not offer a bypass of a check."}\n'
    fi
    return 0
}
