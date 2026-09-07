#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/browser-guard-no-other-drivers.sh · 5495ecb604e9 · правится надстройкой, не здесь
# rt-hook: PreToolUse mcp__playwright__.*|mcp__chrome-devtools__.*|Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh
# Guard of the bypass routes to the browser. PreToolUse.
#
# Pinning a profile is worth something only while there is one door. Listed here are the doors
# that go around it entirely and never ask for the pinned profile: a second driver, a third
# driver, opening a link with system tools, driving the browser through an automation script,
# a separate utility, a direct launch of the binary, and a browser raised by a library from
# inside a script.
#
# The last door is not visible in the command line at all: there stand the interpreter name and
# a file path, and the driving lives inside the file itself. So both the content of the launched
# file and the code passed as an argument instead of a file are judged — against the known entry
# points of browser libraries. That is how the pinned profile was bypassed twice in one session,
# and nothing stopped it.
#
# Writing end-to-end specs stays lawful: a run of a spec gives the agent no interactive browser.
# Only the driving verbs are refused.
#
# FAIL-OPEN: the helper did not name a profile — pass.

# Own name in the observations: the refusal is written by the shared refusal tail, not by the
# guard itself.
RT_GUARD_NAME=browser-guard-no-other-drivers

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"

device_id="$("${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/browser-device-id.sh" 2>/dev/null)"
[ -z "$device_id" ] && exit 0

tool="$(rt_hook_tool)"

# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

deny() {
    echo "$1 Води браузер закреплённым расширением: выбери профиль ${device_id} и работай его инструментами. $(rt_deny_tail)" >&2
    exit 2
}

case "$tool" in
    mcp__playwright__*)
        deny "Второй драйвер браузера в этом проекте не используется — в его профиле вход не сделан." ;;
    mcp__chrome-devtools__*)
        deny "Третий драйвер браузера в этом проекте не используется — закреплённый профиль он не спрашивает." ;;
esac

# The IDE terminal launches the same drivers with the same command line.
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0

if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

# A run of end-to-end specs is the lawful route, and it is never refused.
case "$cmd" in
    *playwright\ open*|*playwright\ codegen*|*playwright\ screenshot*|*playwright\ cr*)
        deny "Вождение браузера из командной строки драйвера обходит закреплённый профиль." ;;
esac

case "$cmd" in
    *open\ http*|*open\ -a\ *Chrome*|*open\ -a\ *chrome*)
        deny "Открытие адреса средствами системы поднимает браузер по умолчанию, а не закреплённый профиль." ;;
    *osascript*Chrome*|*osascript*chrome*)
        deny "Управление браузером сценарием автоматизации обходит закреплённый профиль." ;;
    *chrome-cli*)
        deny "Эта утилита обходит закреплённый профиль." ;;
esac

# The browser binary — and only in the command position.
#
# A bare pattern with the engine name is no good here: it also matches the value of the flag
# that marks the engine in a run of end-to-end specs — such a pattern would have refused the run
# itself on the day it appeared. Hence the anchor at the command boundary and the demand for a
# word that looks like an executable, not a flag value.
printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}(/[^[:space:]]*/)?(google-chrome|chromium)([[:space:]]|\$)" \
    && deny "Прямой запуск бинарника браузера обходит закреплённый профиль."

printf '%s' "$cmd" | grep -qF 'Google Chrome.app/Contents/MacOS' \
    && deny "Прямой запуск бинарника браузера обходит закреплённый профиль."

# Entry points of browser libraries — what a browser is raised with from code. Listed are both
# the launch verb and the verb of attaching to an already raised one: the second bypasses the
# profile in exactly the same way. Attaching over the debug port and launching with a profile
# directory of one's own also stand without an engine name before the dot: they are brought in
# by a direct import of the name, and then there is nothing to judge but the verb itself.
launch='(chromium|firefox|webkit|browserType|puppeteer|chromeLauncher)[[:space:]]*\.[[:space:]]*(launch|connect)|launchPersistentContext[[:space:]]*\(|connectOverCDP[[:space:]]*\(|webdriver\.(Chrome|Firefox)|chrome-launcher'

# Code passed as an argument instead of a file. Judged only together with the interpreter name
# and its code flag: a bare pattern would also refuse a search over the tree where such a word
# is merely looked for.
if printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}(node|bun|deno|python3?)([[:space:]]+-[^[:space:]]+)*[[:space:]]+(-e|--eval|-c|-p|--print)[[:space:]]" \
    && printf '%s' "$cmd" | grep -qE "$launch"; then
    deny "Браузер, поднятый библиотекой из кода довода, закреплённый профиль не спрашивает."
fi

# Files the command runs with an interpreter. Package manager wrappers are stripped: under them
# stands the same interpreter, and it must be seen in the command position.
launched="$(printf '%s' "$cmd" | sed -E '
        s/(^|[[:space:]])(npx|bunx)[[:space:]]+/\1/g
        s/(^|[[:space:]])(pnpm|npm|yarn)[[:space:]]+(exec|dlx)[[:space:]]+/\1/g
        s/(^|[[:space:]])deno[[:space:]]+run[[:space:]]+/\1deno /g
    ' | tr '|&;' '\n\n\n' | sed -nE '
        s/.*(^|[[:space:]])(node|bun|deno|tsx|ts-node|python3?)[[:space:]]+((-[^[:space:]]+|[A-Za-z_][A-Za-z0-9_]*=[^[:space:]]+)[[:space:]]+)*([^[:space:]]+).*/\5/p
    ' | tr -d "\"'\`")"

cwd="$(rt_hook_cwd)"
for file in $launched; do
    for base in '' "${cwd:-.}/" "${CLAUDE_PROJECT_DIR:-.}/"; do
        path="${base}${file}"
        [ -f "$path" ] || continue
        if head -c 200000 "$path" 2>/dev/null | grep -qE "$launch"; then
            deny "Браузер, поднятый библиотекой изнутри ${file}, закреплённый профиль не спрашивает."
        fi
        break
    done
done

exit 0
