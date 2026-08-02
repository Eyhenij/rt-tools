#!/usr/bin/env bash
# PreToolUse guard for every OTHER way to reach a browser.
#
# The pin is only worth something if claude-in-chrome is the ONLY door. These are the doors that
# bypass it entirely — none of them consult the pinned deviceId:
#   - mcp__playwright__*        a second driver, on a profile that is NOT logged in
#   - mcp__chrome-devtools__*   a third driver, same problem
#   - Bash: open <url>, open -a "Google Chrome", osascript telling Chrome to do things,
#     chrome-cli, a raw chrome/chromium binary, playwright open|codegen|screenshot|cr
#
# Writing Playwright E2E *scripts* stays allowed: `playwright test` runs a spec, it does not
# hand the agent an interactive browser. Only the driving verbs are denied.
#
# FAIL-OPEN when RT_TOOLS_BROWSER_DEVICE_ID is unset.

input="$(cat 2>/dev/null)"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"

deny() {
    echo "$1 Use claude-in-chrome instead: select_browser with deviceId ${device_id} — the pinned Chrome profile — then drive it with mcp__claude-in-chrome__* tools." >&2
    exit 2
}

case "$tool" in
    mcp__playwright__*)
        deny "Playwright MCP is not a browser driver in this project — its profile is not logged in." ;;
    mcp__chrome-devtools__*)
        deny "Chrome DevTools MCP is not a browser driver in this project — it does not honour the pinned profile." ;;
esac

[ "$tool" = "Bash" ] || exit 0

cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -z "$cmd" ] && exit 0

# `playwright test` (and its runner aliases) are the legitimate E2E path — never block them.
case "$cmd" in
    *playwright\ open*|*playwright\ codegen*|*playwright\ screenshot*|*playwright\ cr*)
        deny "Driving a browser through the Playwright CLI bypasses the pinned profile." ;;
esac

case "$cmd" in
    *open\ http*|*open\ -a\ *Chrome*|*open\ -a\ *chrome*)
        deny "Opening a URL with \`open\` launches the default browser, not the pinned profile." ;;
    *osascript*Chrome*|*osascript*chrome*)
        deny "Driving Chrome via osascript bypasses the pinned profile." ;;
    *chrome-cli*)
        deny "chrome-cli bypasses the pinned profile." ;;
esac

# A Chrome/Chromium BINARY, and only in command position.
#
# A bare "*chromium *" glob is NOT usable here: it also matches `--project=chromium`, which is
# the mandatory flag on every legitimate Playwright E2E run — that glob denied the e2e suite
# itself the moment it shipped. So anchor on a command boundary and require an executable-looking
# token, never a flag value.
printf '%s' "$cmd" | grep -qE '(^|[;&|(]|[[:space:]]&&|[[:space:]]\|\|)[[:space:]]*(/[^[:space:]]*/)?(google-chrome|chromium)([[:space:]]|$)' \
    && deny "Launching a Chrome binary directly bypasses the pinned profile."

printf '%s' "$cmd" | grep -qF 'Google Chrome.app/Contents/MacOS' \
    && deny "Launching the Chrome binary directly bypasses the pinned profile."

exit 0
