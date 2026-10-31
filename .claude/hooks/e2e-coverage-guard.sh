#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# The end-to-end coverage guard: a PR from a branch that changes code an end-to-end suite walks does
# not open while the branch leaves that suite untouched. The law is the section «End-to-end coverage
# of a change» of the verifiability law.
#
# The push gate already runs the suites by subject, so a red suite never leaves. What it does not
# see is a change whose behaviour no suite walks at all: the suite stays green because nothing in it
# reaches the new code. The last point where the executor still sees a refusal is opening the PR,
# so that is the one judged here.
#
# The subjects are read by `rt_push_touched` of the tree profile — the same function the push gate
# takes its suites by, so one place decides what a path belongs to:
#
#   auth, kit2      — the suite `apps/auth-example-e2e/`;
#   receiver, kit2  — the suite `apps/message-bus-admin-e2e/`.
#
# The subject «everything» demands nothing: a shared library or a root setting acts on every subject,
# and no single suite can be named for it.
#
# The bypass is the line `E2E-skip: <reason>` in a commit body of the branch — for a change no suite
# can walk, such as a pure refactor. An empty reason is no bypass.
#
# FAIL-OPEN: no input, no jq, no profile function, no base ref — pass.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null || true
RT_GUARD_NAME=e2e-coverage-guard
rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0
printf '%s' "$cmd" | grep -qE '(^|[^a-z])gh([[:space:]].*)?[[:space:]]pr[[:space:]]+create' || exit 0

root="${CLAUDE_PROJECT_DIR:-.}"
# shellcheck disable=SC1091
[ -f "$root/.claude/rt-kit/project.sh" ] && . "$root/.claude/rt-kit/project.sh" 2>/dev/null
command -v rt_push_touched >/dev/null 2>&1 || exit 0

# The base named by the command, otherwise the main branch; judged by the remote ref.
base_name="$(printf '%s' "$cmd" | sed -nE 's/.*--base[[:space:]=]+([^[:space:]]+).*/\1/p')"
base="${RT_E2E_BASE:-origin/${base_name:-main}}"
git -C "$root" rev-parse --verify --quiet "$base" >/dev/null || exit 0

touched="$(cd "$root" && rt_push_touched "$base")" || exit 0
changed="$(git -C "$root" diff --name-only "$base"...HEAD 2>/dev/null)"

missing=""
need_suite() {
    printf '%s\n' "$changed" | grep -q "^$1" && return 0
    missing="${missing}${missing:+, }$1"
}
case " $touched " in *' auth '* | *' kit2 '*) need_suite 'apps/auth-example-e2e/' ;; esac
case " $touched " in *' receiver '* | *' kit2 '*) need_suite 'apps/message-bus-admin-e2e/' ;; esac
[ -z "$missing" ] && exit 0

git -C "$root" log --format=%B "$base"..HEAD 2>/dev/null | grep -qE '^E2E-skip:[[:space:]]*[^[:space:]]' && exit 0

tail_text="$(rt_deny_tail 'the line `E2E-skip: <reason>` in a commit body of the branch' 2>/dev/null)"
reason="BLOCKED by e2e-coverage-guard: the branch changes code ($touched) that an end-to-end suite walks, and leaves the suite untouched: $missing. Behaviour a change adds or alters is covered by an end-to-end test in the same change — write the test there and run the suite before opening the PR. ${tail_text}"
jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
exit 0
