#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_run_configuration|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh
# Guard against a second dev server. PreToolUse.
#
# The applications are already raised by the owner, and every check through the browser goes there.
# A second instance takes an extra port, serves a different build and leads the investigation
# astray: a difference between two servers reads as a defect of the edit. On top of that, a build
# started in passing silently kills the server already raised.
#
# Everything that RAISES a server is refused. Builds, tests, linters, requests to raised ports and
# looking at listeners pass.
#
# Where exactly the applications are raised is known to the project profile:
# .claude/rt-kit/project.sh, variable RT_STANDS. No profile — the refusal text stays general, the
# guard itself works.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=dev-server-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"

tool="$(rt_hook_tool)"
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    # A ready run configuration does not show the command line — only its name is visible. Hence
    # the rule: "serve", "dev" and "start" in the name are refused, because the guard cannot check
    # what stands behind them, and a second server costs more than an extra refusal.
    mcp__webstorm__execute_run_configuration)
        name="$(printf '%s' "$input" | jq -r '.tool_input.configurationName // empty' 2>/dev/null)"
        # The tool's second mode is a temporary configuration made of a file and a line: it has
        # no name at all, and the check by name let it through. That is exactly how a script from
        # the package manifest is raised.
        if [ -z "$name" ]; then
            file="$(printf '%s' "$input" | jq -r '.tool_input.filePath // empty' 2>/dev/null)"
            case "$file" in
                */package.json|package.json)
                    echo "A launch of a script straight from the manifest: the guard sees only the file and the line, not the script itself, so it cannot tell raising a server from a build. The applications are already raised by the owner — if a build or a test is needed, run them by a command in the terminal." >&2
                    exit 2 ;;
            esac
            exit 0
        fi
        # The word "start" without a boundary also caught "restart", which raises no server.
        case "$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]')" in
            *serve*|*dev*|start*|*\ start*|*:start*)
                echo "The configuration «${name}» looks like raising a development server, and the applications are already raised by the owner — check those. If the configuration does something else, run it by a command: by the name alone the guard does not see the content." >&2
                exit 2 ;;
        esac
        exit 0 ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0

# The universal executor of the environment passes the real command as a nested string. It is the
# one to parse, not the wrapper: otherwise the runner name stands right after a quote and no rule
# reaches it.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

# Git listens on no port, while message and branch texts freely contain words like "serve" —
# without this branch the guard catches its own commit about itself.
case "$cmd" in
    git\ *|*/git\ *)
        printf '%s' "$cmd" | grep -qE '(^|[[:space:]])git[[:space:]]+daemon([[:space:]]|$)' || exit 0 ;;
esac

# The tree profile: first the package default, and over it the project override, if there is one.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done
stands="${RT_STANDS:-}"

# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

deny() {
    if [ -n "$stands" ]; then
        echo "$1 The applications are already raised by the owner: ${stands} — check those. Do not raise an instance of your own; if a port does not answer, tell the owner instead of launching a second one. $(rt_deny_tail)" >&2
    else
        echo "$1 The applications are already raised by the owner — check those. Do not raise an instance of your own; if a port does not answer, tell the owner instead of launching a second one. $(rt_deny_tail)" >&2
    fi
    exit 2
}

# The runners are listed outright. A group meaning "any word before the name" refused even a note
# saying that the server is raised by the owner.
RUNNER='((npx|pnpm|yarn|bun|npm)([[:space:]]+(exec|run|dlx))?[[:space:]]+)?'

# The start of a call: the start of the line or a command separator. A quote must not be put into
# the boundary — then a text search and killing a process by pattern read as a start.
BOUND="$RT_CMD_BOUND"

printf '%s' "$cmd" | grep -qE "${BOUND}${RUNNER}(nx|ng)[[:space:]]+(run[[:space:]]+[^[:space:]]*:)?(serve|dev)" \
    && deny "A launch of one more development server through the framework."

# Requiring a space right after the name broke the match on a colon: the guard let through scripts
# like "serve:site" — that is, exactly the commands it is written for.
printf '%s' "$cmd" | grep -qE "${BOUND}(npm|pnpm|yarn|bun)([[:space:]]+run)?[[:space:]]+(dev|start|serve)([:._-][A-Za-z0-9:._-]*)?([[:space:]]|\$)" \
    && deny "A launch of one more development server through the package runner."

# The subcommand is mandatory: while it was optional, the bare name of the bundler fell under the
# rule — that is, any one-liner where it occurs inside the text.
printf '%s' "$cmd" | grep -qE "${BOUND}${RUNNER}vite([[:space:]]+(dev|serve|preview))?[[:space:]]*(\$|[;&|\"'])" \
    && deny "A launch of one more development server."
printf '%s' "$cmd" | grep -qE "${BOUND}${RUNNER}(next|astro|nuxt)[[:space:]]+(dev|start|preview)([[:space:]]|\$)" \
    && deny "A launch of one more development server."

# Static files served over a build are the same second instance. Every name sits under the shared
# anchor of the command start: without it a package listing and a search through documents read as
# a start.
printf '%s' "$cmd" | grep -qE "${BOUND}(python3?[[:space:]]+-m[[:space:]]+http\.server|${RUNNER}(http-server|live-server|serve)([[:space:]]|\$))" \
    && deny "Raising a static server on top of a build — the same second instance."

exit 0
