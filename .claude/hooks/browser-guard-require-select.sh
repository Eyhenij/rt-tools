#!/usr/bin/env bash
# PreToolUse guard for every other mcp__claude-in-chrome__* tool (tabs_context, navigate,
# computer, read_page, …).
#
# WHY THIS EXISTS — the failure it is built from:
# The extension acts on whatever browser it currently considers active, and that choice DRIFTS.
# A select_browser early in a session does NOT hold: after a long stretch of non-browser work
# the next tabs_context_mcp opened a tab in a DIFFERENT profile, silently. Guarding only
# select_browser cannot catch this, because select_browser is never called at that point — the
# id it was given was correct, and the drift happened afterwards.
#
# So this gate is about FRESHNESS, not about "was select ever called":
#   - browser-guard-device-id.sh stamps a marker on every accepted select_browser;
#   - every browser tool that passes here RE-STAMPS it, so an active burst keeps flowing;
#   - once the marker goes older than the window, the next browser tool is denied and must
#     re-select. A pause is exactly when drift happens, so a pause is what re-arms the gate.
#
# select_browser is one cheap idempotent call, so re-selecting costs far less than landing in
# the wrong browser.
#
# Window: RT_TOOLS_BROWSER_DEVICE_ID_TTL seconds from .env, default 300.
# list/switch/select have their own guards and are skipped here.
#
# FAIL-OPEN when RT_TOOLS_BROWSER_DEVICE_ID is unset.

input="$(cat 2>/dev/null)"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    *list_connected_browsers|*switch_browser|*select_browser) exit 0 ;;
esac

ttl="$(sed -n 's/^[[:space:]]*RT_TOOLS_BROWSER_DEVICE_ID_TTL[[:space:]]*=[[:space:]]*//p' "${CLAUDE_PROJECT_DIR:-.}/.env" 2>/dev/null \
    | head -n 1 | tr -d '"'"'"' \r')"
case "$ttl" in
    ''|*[!0-9]*) ttl=300 ;;
esac

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
marker="${TMPDIR:-/tmp}/claude-browser-guard/rt-tools-${sid}"

if [ ! -f "$marker" ]; then
    echo "No browser selected in this session. Call select_browser with deviceId ${device_id} — the pinned Chrome profile — before any other browser tool." >&2
    exit 2
fi

now="$(date +%s)"
stamped="$(stat -f %m "$marker" 2>/dev/null || stat -c %Y "$marker" 2>/dev/null || echo 0)"
age=$(( now - stamped ))

if [ "$age" -gt "$ttl" ]; then
    rm -f "$marker" 2>/dev/null
    echo "Last select_browser was ${age}s ago (limit ${ttl}s) — the extension's active browser drifts across gaps like this, so it may no longer be the pinned Chrome profile. Call select_browser with deviceId ${device_id} again, then retry." >&2
    exit 2
fi

: >"$marker" 2>/dev/null
exit 0
