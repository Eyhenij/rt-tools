#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# The package release guard: a publication workflow of a package without a framework starts only
# when the package builds, is loaded as a consumer loads it, and its release wiring is whole. The
# rule is `package-release`.
#
#   gh workflow run publish-<package>.yml  — `tools/check-package-release.mjs --package <package> --build`
#
# The first release of `ai-chat-protocol` went out unloadable because nothing between the build and
# the registry loaded the built package. The decision is the check's own: the guard only recognises
# the call and passes the refusal on. A package that is not built without a framework is not judged.
#
# FAIL-OPEN: no input, no jq, no node, no check file — pass.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null || true
rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v node >/dev/null 2>&1 || exit 0
cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0
root="${CLAUDE_PROJECT_DIR:-.}"
check="$root/tools/check-package-release.mjs"
[ -f "$check" ] || exit 0

# The sign errs towards firing: `gh` by any path or wrapper, `workflow run` and a publication file.
package="$(printf '%s' "$cmd" | grep -oE '(^|[^a-z])gh([[:space:]].*)?[[:space:]]workflow[[:space:]]+run[[:space:]].*publish-[a-z0-9-]+\.yml' | grep -oE 'publish-[a-z0-9-]+\.yml' | head -n 1 | sed -E 's/^publish-//; s/\.yml$//')"
[ -z "$package" ] && exit 0

out="$(cd "$root" && node "$check" --package "$package" --build 2>&1)"
[ $? -eq 0 ] && exit 0

tail_text="$(rt_deny_tail 2>/dev/null)"
reason="BLOCKED by package-release: ${out} ${tail_text}"
jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
exit 0
