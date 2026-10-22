#!/usr/bin/env bash
# rt-kit v0.33.0 · hooks/grill-gate-options.sh · 19cdc541d4d2 · правится надстройкой, не здесь
# A part of the fourth sign of the conversation guard: after a refused menu a list of options in
# prose is a question too. NOT a guard: it has no `rt-hook:` declaration and hooks into no agent
# event. The conversation guard sources it — it was moved out when the guard crossed the file
# length limit.
#
# After a refused menu the executor gave the same options as a numbered list with no question mark
# and ended the turn: the sign knew prose only by «?», and the list went out as an ordinary reply.
# In a turn where the menu was refused, a numbered list of two or more items under a line ending
# with a colon is a question too. Outside such a turn a list is not judged: many ordinary reports
# carry one, and a refusal on each would teach to strip lists from replies.
#
# It expects `$transcript` and `$question_text` to be set; it returns zero when the turn ends with
# such a list after a refused menu, and non-zero otherwise.
#
# FAIL-OPEN: no turn record, no parser — the list is not a question.

rt_grill_options_asked() {
    local menu_refused options_re
    menu_refused="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
        def is_input:
            .type == "user"
            and ((.isCompactSummary // false) | not)
            and ((.isMeta // false) | not)
            and (((.message.content // []) | if type == "array"
                    then ([.[] | select(.type == "tool_result")] | length)
                    else 0 end) == 0);
        def asks_menu:
            .type == "assistant" and ((.message.content // []) | any(.[];
                .type == "tool_use" and .name == "AskUserQuestion"));
        def refused:
            .type == "user" and ((.message.content // []) | if type == "array"
                then any(.[]; .type == "tool_result" and (.is_error // false))
                else false end);
        (map(is_input) | rindex(true)) as $i
        | (if $i == null then . else .[$i + 1:] end) as $turn
        | [range(0; ($turn | length) - 1) as $k
            | select(($turn[$k] | asks_menu) and ($turn[$k + 1] | refused))]
        | if length > 0 then "yes" else "no" end
    ' 2>/dev/null)"
    [ "$menu_refused" = "yes" ] || return 1

    options_re='^[[:space:]]*[0-9]+[.)][[:space:]]'
    printf '%s\n' "$question_text" | awk -v re="$options_re" '
        /:[[:space:]]*$/ { lead = 1; items = 0; next }
        lead && $0 ~ re { items++; if (items >= 2) found = 1; next }
        lead && /^[[:space:]]*$/ { next }
        { lead = 0; items = 0 }
        END { exit found ? 0 : 1 }'
}
