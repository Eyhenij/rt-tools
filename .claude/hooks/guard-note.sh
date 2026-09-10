#!/usr/bin/env bash
# rt-kit v0.27.0 · hooks/guard-note.sh · d95e4eedd989 · правится надстройкой, не здесь
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
# WHAT IS RECORDED. The guard name and the session id. Cleaning the values and deciding whether to
# write at all is done by the observation record itself; here only the call is assembled.
#
# FAIL-OPEN. There may be no record at all — no file, the tree switched observations off, the
# directory is unavailable. A guard that fell over on recording a refusal would stop work for the
# sake of statistics.

# A guard refusal into the observations. The name is taken from `RT_GUARD_NAME`, the session id
# from the hook input; without a name nothing is written.
rt_guard_note() {
    local rt_gn_dir rt_gn_sid rt_gn_name
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
        rt_note guard-deny "res=$rt_gn_name" "sid=$rt_gn_sid"
    else
        rt_note guard-deny "res=$rt_gn_name"
    fi

    return 0
}
