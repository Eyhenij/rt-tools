#!/usr/bin/env bash
# rt-kit v0.42.1 · hooks/browser-guard-require-select.sh · 2dceea9bca6b · правится надстройкой, не здесь
# rt-hook: PreToolUse mcp__claude-in-chrome__.*
# Requires: hooks/deny-tail.sh
# Guard of the freshness of the browser choice. PreToolUse on all the other extension calls.
#
# WHY IT EXISTS — the failure it grew out of: the extension acts on the browser it holds to be
# active right now, and that choice DRIFTS. A choice made at the start of the session does not hold:
# after a long break for work without the browser, the very next call opened a tab in another
# profile — silently. A guard on the choice itself catches nothing of the kind: at that moment
# nobody calls the choice, and the one made earlier was right.
#
# That is why the guard is about FRESHNESS, not about "was a choice made at all":
#   - the choice guard puts down a mark on every accepted choice;
#   - every call that passes here refreshes the mark, so continuous work goes freely;
#   - as soon as the mark is older than the window, the next call is refused and demands choosing
#     again. A break is exactly when the choice drifts, so it is the break that arms the guard.
#
# The choice is one cheap repeatable call, and repeating it costs incomparably less than landing in
# the wrong browser.
#
# FAIL-OPEN: the helper did not name a profile — pass.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=browser-guard-require-select
RT_GUARD_RULE=browser-verification

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

tool="$(rt_hook_tool)"
# Listing, switching and the choice itself have guards of their own.
case "$tool" in
    *list_connected_browsers|*switch_browser|*select_browser) exit 0 ;;
esac

ttl=300

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
marker="${TMPDIR:-/tmp}/claude-browser-guard/${sid}"

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the refusal reason stays as it is.
# shellcheck disable=SC1090
# The decision and the words come from the decision table; the hook names what it found about the
# selection. The named move is the selection, and the rules gate refuses it while its rule is not
# loaded: that is a fact of the state.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/decide.sh" 2>/dev/null
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null

refuse() {
    command -v rt_decide >/dev/null 2>&1 || exit 0
    rt_decide browser-guard-require-select.sh browser_call \
        "$(jq -cn --arg r "$(rt_fact_rule_loaded browser-verification "$sid")" --arg s "$1" '{pinned:"yes", rule_loaded:$r, selection:$s}')" \
        "$(jq -cn --arg s "$2" --arg t "$3" '{said:$s, then:$t}')" PreToolUse "$input"
    exit 0
}

if [ ! -f "$marker" ]; then
    refuse none "No browser is selected in this session." "Call the browser selection with the profile ${device_id} before any other call."
fi

now="$(date +%s)"
stamped="$(stat -f %m "$marker" 2>/dev/null || stat -c %Y "$marker" 2>/dev/null || echo 0)"
age=$(( now - stamped ))

if [ "$age" -gt "$ttl" ]; then
    rm -f "$marker" 2>/dev/null
    refuse stale "The last browser selection was ${age} s ago (the limit is ${ttl} s) — over such a break the active browser of the extension drifts away, and it may no longer be the pinned profile." \
        "Call the selection with the profile ${device_id} anew and repeat."
fi

: >"$marker" 2>/dev/null
exit 0
