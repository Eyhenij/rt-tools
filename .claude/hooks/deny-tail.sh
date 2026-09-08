#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/deny-tail.sh · b6a7fe3fc0c7 · правится надстройкой, не здесь
# The shared deny tail. NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event.
# The guards source it themselves — the same way they source the observation record and the word
# about a missing profile function.
#
# Why it exists. A guard's refusal names the miss and the way to lift it, and nobody names what to
# do when lifting it does not work out. The empty place is taken by a third move that is in no rule:
# bypass silently — by a shell command, by a neighbouring tool, by editing the guard itself. That is
# what happened: within one hour a refusal was bypassed twice, and both times the edit landed past
# the guard. There are two lawful moves, and both are named right in the refusal text instead of
# being left to the reader's guess.
#
# WHAT IS SAID. Fix what was named and repeat the call — or bring the owner the price of the bypass
# and wait for their word. Where the bypass has a lawful form — a line in the commit body, a line
# in the plan, a command flag — the same tail names it: a bypass known to be lawful is looked for by
# the guard's own words, not past the guard.
#
# WHAT THE TAIL DOES NOT DO. It does not judge whether the bypass fits this case: the owner decides
# that. And it does not replace the refusal reason — that stands before it and names the miss by
# name.
#
# THE REFUSAL RECORD GOES FROM HERE TOO. The tail is the one place every refusal passes through: the
# tree's rule demands that the two lawful moves be named at every refusal, and a guard that refuses
# past the tail breaks that rule before it loses count. Written inside the guard itself, the record
# stood in five guards out of thirty, and the digest answered by that fifth. A guard declares itself
# by the line `RT_GUARD_NAME=<name>` at its top; one that has not declared writes nothing — that is
# how the rules gate counts its own refusals by itself.

# The deny tail as a string. The first parameter is the lawful form of bypass, if the refusal has
# one; empty means there is no lawful form at all, and this is said outright.
#
#   reason="BLOCKED: <reason>. $(rt_deny_tail 'the line `Docs-skip: <reason>` in the commit body')"
#   reason="BLOCKED: <reason>. $(rt_deny_tail)"
rt_deny_tail() {
    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/guard-note.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/guard-note.sh" 2>/dev/null
    command -v rt_guard_note >/dev/null 2>&1 && rt_guard_note

    if [ -n "$1" ]; then
        printf 'Two moves from here: fix what is named and repeat the call, or bring the owner the price of a bypass and wait for their word. The lawful form of bypass: %s. An edit is not laid past the guard in silence: it refuses one call, and a bypassed one lifts the requirement from the whole tree and says nothing about it.' "$1"
        return 0
    fi

    printf 'Two moves from here: fix what is named and repeat the call, or bring the owner the price of a bypass and wait for their word. There is no lawful form of bypass for this refusal. An edit is not laid past the guard in silence: it refuses one call, and a bypassed one lifts the requirement from the whole tree and says nothing about it.'
}
