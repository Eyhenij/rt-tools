#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/utf8.sh · 011f00d0b621 · правится надстройкой, не здесь
# The locale a guard runs in. Sourced as the first line of the body: `. "<guards directory>/utf8.sh"`.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The guards source it
# as the first line of their body: the locale is one for all of them.
#
# Guard patterns are written in the words of the language the tree speaks, and matching against
# them depends on the process locale. In the C locale case folding works only for Latin letters:
# «В дереве этого нет» is not found under the pattern `(в дереве|здесь)…` at all, the guard exits
# with zero and lets through the turn it was bound to return. The `{0,30}` count there counts bytes,
# not letters, and a non-Latin letter weighs two.
#
# There is nothing to notice this with on one's own machine: the developer's terminal runs in UTF-8,
# while the service that runs the same work inherits an empty locale. Three scenarios failed in the
# pipeline exactly so, passing on the machine where they were written.
#
# FAIL-OPEN: no UTF-8 locale found in the system — nothing is declared, and the guard works as
# before. Taking its work away over a missing locale is worse than keeping the old behaviour.

rt_use_utf8_locale() {
    case "${LC_ALL:-${LC_CTYPE:-${LANG:-}}}" in
        *UTF-8* | *utf-8* | *UTF8* | *utf8*) return 0 ;;
    esac

    local available candidate
    available="$(locale -a 2>/dev/null)" || return 0

    for candidate in C.UTF-8 en_US.UTF-8 ru_RU.UTF-8; do
        if printf '%s\n' "$available" | grep -qx -- "$candidate"; then
            export LC_ALL="$candidate"
            return 0
        fi
    done

    return 0
}

rt_use_utf8_locale
