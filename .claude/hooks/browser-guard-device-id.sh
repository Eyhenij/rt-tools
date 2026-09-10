#!/usr/bin/env bash
# rt-kit v0.27.0 · hooks/browser-guard-device-id.sh · ce71c4fe5ecc · правится надстройкой, не здесь
# rt-hook: PreToolUse mcp__claude-in-chrome__select_browser
# rt-hook: PostToolUse mcp__claude-in-chrome__select_browser
# Requires: hooks/deny-tail.sh
# Guard of the browser choice. It works on two events: before the call and after it.
#
# Before the call it forbids any profile but the pinned one. A foreign profile leads into a browser
# that has none of this project's sessions.
#
# After the call it puts down a session mark, if the answer confirms the connection. The freshness
# guard reads the age of that mark and by it allows further work with the browser.
#
# Why the mark is put down after the call. It used to be put down before the call, on a match of the
# sign, that is, on the attempt to choose. If the pinned profile is switched off, the call returns a
# refusal while the mark is already there — and the freshness guard lets through the tab listing, a
# navigation and a screenshot into whatever browser the extension holds to be active. The mistake
# was noticed by the owner, not by a guard. A mark before the call confirms only the request for a
# profile, not the connection to it.
#
# On an error the guard passes: the helper did not name a profile — the call is allowed. An answer
# without signs of a connection puts down no mark; work does not stop — the next call will be
# forbidden by the freshness guard, which will demand choosing the profile again.
#
# FAIL-OPEN: no pinned device declared, no answer from the tool, an unrecognised call — the call
# goes through. A guard that jams the browser when the pin is missing is switched off on the first
# day, and with it goes the pin itself.

# The guard's name for the observations: it is written by the shared deny tail.
RT_GUARD_NAME=browser-guard-device-id

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"

# The session id is passed to the helper: without it the message about an unconfigured tree is
# marked by the date and arrives once a day, not once per session.
sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" "$sid")"
[ -z "$device_id" ] && exit 0

requested="$(printf '%s' "$input" | jq -r '.tool_input.deviceId // empty' 2>/dev/null)"
event="$(printf '%s' "$input" | jq -r '.hook_event_name // empty' 2>/dev/null)"

if [ "$event" = "PostToolUse" ]; then
    # The answer of the call is brought to a string: it arrives as an object, a string or a list of
    # blocks, and parsing each form separately is expensive. The text is checked — it holds both
    # the profile sign and the word about a refusal.
    answer="$(printf '%s' "$input" | jq -r '.tool_response // empty | if type == "string" then . else tojson end' 2>/dev/null)"

    # A refusal of the choice: there was no connection, no mark is put down. The words of refusal
    # are listed in two languages: the helper answers in its own, the tree prints its text in
    # Russian.
    case "$answer" in
        *'"error"'* | *'"isError":true'* | *"failed"* | *"not found"* | *"not connected"* | *"не найден"* | *"отключ"*)
            exit 0
            ;;
    esac

    # An empty answer does not count as a connection: there is nothing to check by it, while a
    # mark would claim that the profile is connected.
    [ -z "$answer" ] && exit 0

    marker_dir="${TMPDIR:-/tmp}/claude-browser-guard"
    mkdir -p "$marker_dir" 2>/dev/null && : >"$marker_dir/${sid}" 2>/dev/null
    exit 0
fi

# Before the call only the profile sign is checked; no mark is put down here.
[ "$requested" = "$device_id" ] && exit 0

# The shared deny tail: two lawful moves and the lawful form of bypass, if there is one. The file
# may not be laid out — then there is no tail, and the reason for the refusal stays.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

echo "The profile «${requested}» is not the one pinned to the project. Take ${device_id} — the only profile where the sign-in was made. $(rt_deny_tail)" >&2
exit 2
