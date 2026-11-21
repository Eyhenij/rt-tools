#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# The kit approval guard: a PR with a visible kit edit and a release of a kit go out only with two
# approvals of the owner — of the Figma mockup and of the showcase. The rule is `kit-approval`.
#
# The push is held by the same check from the push set (`rt_push_checks` in the tree profile); the
# push guard has no place for a refusal of its own on opening a PR or on starting a release, so
# both are judged here:
#
#   gh pr create                          — the branch against origin/main;
#   gh workflow run publish-ui-kit-v2.yml — every merge into main since the last version bump.
#
# The decision is the check's own, `tools/check-kit-approval.mjs`: the guard only recognises the
# call and passes the refusal on. A record in place on `gh pr create` opens the owner's window with
# its two quotes — the owner confirms them there.
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
check="$root/tools/check-kit-approval.mjs"
[ -f "$check" ] || exit 0

# The sign errs towards firing: `gh` by any path or wrapper, `pr create` and the release file.
mode=""
if printf '%s' "$cmd" | grep -qE '(^|[^a-z])gh([[:space:]].*)?[[:space:]]pr[[:space:]]+create'; then
    mode="branch"
elif printf '%s' "$cmd" | grep -qE '(^|[^a-z])gh([[:space:]].*)?[[:space:]]workflow[[:space:]]+run[[:space:]].*publish-ui-kit-v2'; then
    mode="ui-kit-v2"
fi
[ -z "$mode" ] && exit 0

if [ "$mode" = "branch" ]; then
    out="$(cd "$root" && node "$check" 2>&1)"
else
    out="$(cd "$root" && node "$check" --publish "$mode" 2>&1)"
fi
code=$?

# A record in place is confirmed by the owner, not by a search of the conversations: the window shows
# both quotes, and the owner allows the PR or forbids it. The check no longer reads the records of
# the conversations — it missed answers given in other words and on another machine.
if [ "$code" -eq 0 ]; then
    [ "$mode" = "branch" ] || exit 0
    quotes="$(cd "$root" && node "$check" --quotes 2>/dev/null)"
    [ -n "$quotes" ] || exit 0
    reason="The branch carries a visible kit edit, and its approval record says: ${quotes}. Allow the PR if these are your words about this mockup and this showcase; forbid it otherwise."
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r}}'
    exit 0
fi

tail_text="$(rt_deny_tail 2>/dev/null)"
reason="BLOCKED by kit-approval: ${out} ${tail_text}"
jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
exit 0
