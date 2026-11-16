#!/usr/bin/env bash
# rt-kit v0.37.0 · hooks/browser-guard-no-listing.sh · 481972d8846e · правится надстройкой, не здесь
# rt-hook: PreToolUse mcp__claude-in-chrome__(list_connected_browsers|switch_browser)
# Requires: hooks/deny-tail.sh
# Guard against listing and switching browsers. PreToolUse.
#
# The project's sessions live in one pinned profile. Listing and switching return generic unstable
# names that identify nothing, and picking from them lands in a profile that is not signed in — so
# the only supported way is selection by the pinned id.
#
# FAIL-OPEN: the helper did not name a profile — pass. A guard that cannot name the wanted profile
# offers nothing in return, and a blind refusal would only drive the work into a dead end.

# Its own name in the observations: the refusal is recorded by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=browser-guard-no-listing
RT_GUARD_RULE=browser-verification

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

input="$(cat 2>/dev/null)"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the refusal reason stays as it is.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

# The named move is the selection, and the rules gate refuses it while its rule is not loaded.
sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
first=""
command -v rt_gate_pending >/dev/null 2>&1 && [ -n "$(rt_gate_pending browser-verification "$sid")" ] \
    && first="Load the rule «browser-verification» by the tool Skill first — the rules gate refuses the selection until then. "
echo "Do not list and do not switch browsers. ${first}Call the browser selection with the profile ${device_id} — the only one where the sign-in was made. $(rt_deny_tail)" >&2
exit 2
