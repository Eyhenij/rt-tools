#!/usr/bin/env bash
# rt-kit v0.34.0 · hooks/guard-note.sh · 2bcd1cff6768 · правится надстройкой, не здесь
# The record of a guard refusal. NOT a guard: it has no `rt-hook:` declaration and hooks into no
# agent event. The shared deny tail sources it — the one place every refusal passes through.
#
# Why it exists. The refusal record stood inside the guard itself as five lines: sourcing the
# record, checking the function exists, the call with the name and the session id. Writing them in
# every guard did not work out — of thirty guards, five had them, and the observation digest
# answered by that fifth: a guard that can refuse but cannot record is listed in it neither as
# refusing nor as silent, and the question "it stood there and did not work" cannot be asked about
# it at all.
#
# HOW A GUARD DECLARES ITSELF. By one line `RT_GUARD_NAME=<name>` at its top. The declaration is
# voluntary and exact: a hook that counts its own refusals by itself — like the rules gate — does
# not set it, and the same event is not counted a second time.
#
# THE RULE. A line `RT_GUARD_RULE=<rule>` next to the name says which rule the guard enforces. A
# refusal after that rule was loaded in the session counts against the rule: its text taught nothing.
#
# WHAT IS RECORDED. The guard name, its rule and the session id. Cleaning the values and deciding whether to
# write at all is done by the observation record itself; here only the call is assembled.
#
# FAIL-OPEN. There may be no record at all — no file, the tree switched observations off, the
# directory is unavailable. A guard that fell over on recording a refusal would stop work for the
# sake of statistics.

# A guard refusal into the observations. The name is taken from `RT_GUARD_NAME`, the session id
# from the hook input; without a name nothing is written.
rt_guard_note() {
    local rt_gn_dir rt_gn_sid rt_gn_name rt_gn_empty=''
    # A default, not a bare read: a guard may be written to abort on an undeclared variable, and a
    # record that reads it bare brings such a guard down whole — on every call, not on a refusal.
    rt_gn_name="${RT_GUARD_NAME:-}"
    [ -n "$rt_gn_name" ] || return 0

    rt_gn_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    # shellcheck disable=SC1090
    [ -f "$rt_gn_dir/observe.sh" ] && . "$rt_gn_dir/observe.sh" 2>/dev/null
    command -v rt_note >/dev/null 2>&1 || return 0

    rt_gn_sid="$(printf '%s' "${RT_HOOK_INPUT:-}" | jq -r '.session_id // empty' 2>/dev/null)"

    if [ -n "$rt_gn_sid" ]; then
        # shellcheck disable=SC1090
        [ -f "$rt_gn_dir/metric-marks.sh" ] && . "$rt_gn_dir/metric-marks.sh" 2>/dev/null
        command -v rt_refusal_empty >/dev/null 2>&1 \
            && rt_gn_empty="$(rt_refusal_empty "$rt_gn_name" "$rt_gn_sid" \
                "$(printf '%s' "${RT_HOOK_INPUT:-}" | jq -c '.tool_input // empty' 2>/dev/null)")"
        rt_note guard-deny "res=$rt_gn_name" "sid=$rt_gn_sid" "empty=$rt_gn_empty" "rule=${RT_GUARD_RULE:-}"
    else
        rt_note guard-deny "res=$rt_gn_name"
    fi

    return 0
}
