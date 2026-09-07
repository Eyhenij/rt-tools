#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/browser-guard-require-select.sh · 5988d0c128ef · правится надстройкой, не здесь
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
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

# The reason for the refusal goes as a field of the answer, not into the error stream.
#
# What is said into the error stream the executor does not see: "No stderr output" reaches him
# without a single word about what happened, and browser calls failing one after another read as a
# breakage of the extension. Half an hour spent looking for what the guard already knows and says is
# the price of one chosen channel.
deny() {
    reason="$1 $(rt_deny_tail)"
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$1"
    exit 0
}

if [ ! -f "$marker" ]; then
    deny "В этой сессии браузер не выбран. Вызови выбор браузера с профилем ${device_id} до любого другого вызова."
fi

now="$(date +%s)"
stamped="$(stat -f %m "$marker" 2>/dev/null || stat -c %Y "$marker" 2>/dev/null || echo 0)"
age=$(( now - stamped ))

if [ "$age" -gt "$ttl" ]; then
    rm -f "$marker" 2>/dev/null
    deny "Последний выбор браузера был ${age} с назад (предел ${ttl} с) — на таких перерывах активный браузер расширения уплывает, и это может быть уже не закреплённый профиль. Вызови выбор с профилем ${device_id} заново и повтори."
fi

: >"$marker" 2>/dev/null
exit 0
