#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# The package release guard: a start of a publication workflow of a package without a framework is
# refused at once when its release wiring is broken. The rule is `package-release`.
#
#   gh workflow run publish-<package>.yml  — `tools/check-package-release.mjs --package <package>`,
#                                             once for every publication file named in the command
#
# This is the quick refusal, not the barrier. The barrier is the root build command `build:<package>`,
# which ends in `nx verify` and is the one the publication workflow runs, so a package that does not
# load is stopped at the release however the workflow is started: the browser, the API, another
# session. The guard saves the minutes of a run that would fail on that. It sees only a command line
# of this agent with `gh workflow run` and a literal file name: a name in a variable, a call by the
# workflow's title and `gh api` pass it. A package that is not built without a framework is not judged.
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
packages="$(printf '%s' "$cmd" | tr '\n' ' ' | grep -oE '(^|[^a-z])gh([[:space:]].*)?[[:space:]]workflow[[:space:]]+run[[:space:]].*' | grep -oE 'publish-[a-z0-9-]+\.ya?ml' | sed -E 's/^publish-//; s/\.ya?ml$//' | sort -u)"
[ -z "$packages" ] && exit 0

out=''
for package in $packages; do
    one="$(cd "$root" && node "$check" --package "$package" --lenient 2>&1)" || out="$out$one "
done
[ -z "$out" ] && exit 0

tail_text="$(rt_deny_tail 2>/dev/null)"
reason="BLOCKED by package-release: ${out} ${tail_text}"
jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
exit 0
