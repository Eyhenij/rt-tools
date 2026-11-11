#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# The end-to-end coverage guard: a PR from a branch that changes code an end-to-end suite walks does
# not open while the branch adds or edits no test of that suite. The law is the section «End-to-end
# coverage of a change» of the verifiability law.
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
# For `kit2` the profile function `rt_kit2_reaches` narrows this: a suite is demanded only when the
# change touches a kit component its application draws, directly or inside another one, or a kit
# file outside the components. The showcase, the snapshot references, the specs and the texts of
# the kit reach no application.
#
# The subject «everything» demands nothing: a root setting or the build harness acts on every
# subject, and no single suite can be named for it.
#
# A suite counts as touched by a test file of it — `*.spec.ts`. A README, a stand script or a
# re-shot snapshot walks no new behaviour, and counting them let a branch through with no test.
#
# The tree, the base and the head are taken from the command itself: the move into a directory, the
# working directory of the call, `--base`/`-B` and `--head`/`-H` with or without quotes. A PR opened
# from another copy is judged by that copy, a chain PR by its own base. The flags are read as words
# of the call, so a `--base` inside the text of `--body` does not count.
#
# The bypass is the line `E2E-skip: <reason>` in the body of a commit that itself changes code — for
# a change no suite can walk, such as a pure refactor. The reason is at least three characters and
# carries no `<`: otherwise the sample printed in this refusal, copied as is, lifts it. A line in a
# commit that touches only texts lifts nothing — it speaks of no code.
#
# FAIL-OPEN: no input, no jq, no profile function, no base ref — pass.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$rt_hooks_dir/utf8.sh" 2>/dev/null || true
. "$rt_hooks_dir/hook-input.sh" 2>/dev/null || true
. "$rt_hooks_dir/deny-tail.sh" 2>/dev/null || true
# shellcheck disable=SC1091
. "$rt_hooks_dir/git-guard-delivery-tree.sh" 2>/dev/null || true
RT_GUARD_NAME=e2e-coverage-guard
rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0
[ -n "${RT_CMD_BOUND:-}" ] || exit 0
# The call from the start of a line or after a separator: a mention in quotes is not a call.
printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}gh[[:space:]]+pr[[:space:]]+create([[:space:]]|\$)" || exit 0

# The tree the command runs in: the move named in it, then the directory of the call, then the tree
# of the session.
root="$(rt_delivery_exec_dir 2>/dev/null)"
if [ -z "$root" ]; then
    workdir="$(rt_hook_cwd)"
    [ -n "$workdir" ] && [ -d "$workdir" ] && root="$(git -C "$workdir" rev-parse --show-toplevel 2>/dev/null)"
fi
root="${root:-${CLAUDE_PROJECT_DIR:-.}}"
# shellcheck disable=SC1091
[ -f "$root/.claude/rt-kit/project.sh" ] && . "$root/.claude/rt-kit/project.sh" 2>/dev/null
command -v rt_push_touched >/dev/null 2>&1 || exit 0

# The value of a flag of the `gh pr create` call: the words are split as the shell splits them,
# quotes are taken off, and the search stops at the end of that call.
flag_of() {
    command -v perl >/dev/null 2>&1 || return 0
    printf '%s' "$cmd" | RT_FLAGS="$1" perl -0ne '
        my @w = map { my $x = $_; $x =~ s/"((?:[^"\\]|\\.)*)"/$1/g; $x =~ s/\x27([^\x27]*)\x27/$1/g; $x }
            (/(?:[^\s"\x27;&|]+|"(?:[^"\\]|\\.)*"|\x27[^\x27]*\x27|[;&|]+)+/g);
        my %flag = map { $_ => 1 } split /\|/, $ENV{RT_FLAGS};
        my $i = 0;
        $i++ while $i + 2 <= $#w && !($w[$i] eq "gh" && $w[$i + 1] eq "pr" && $w[$i + 2] eq "create");
        for (my $j = $i + 3; $j <= $#w; $j++) {
            last if $w[$j] =~ /^[;&|]+$/;
            if ($flag{$w[$j]}) { print $w[$j + 1] // ""; exit }
            for my $f (grep { /^--/ } keys %flag) {
                if ($w[$j] =~ /^\Q$f\E=(.*)$/s) { print $1; exit }
            }
        }
    ' 2>/dev/null
}

# The base named by the command, otherwise the main branch; judged by the remote ref.
base_name="$(flag_of '--base|-B')"
base="origin/${base_name:-main}"
git -C "$root" rev-parse --verify --quiet "$base" >/dev/null || exit 0

# The head named by the command, otherwise the checked-out branch. `owner:branch` names a fork; the
# branch is the same.
head_name="$(flag_of '--head|-H')"
head_name="${head_name##*:}"
head='HEAD'
if [ -n "$head_name" ]; then
    if git -C "$root" rev-parse --verify --quiet "origin/$head_name" >/dev/null; then
        head="origin/$head_name"
    elif git -C "$root" rev-parse --verify --quiet "$head_name" >/dev/null; then
        head="$head_name"
    else
        exit 0
    fi
fi

touched="$(cd "$root" && rt_push_touched "$base" "$head")" || exit 0
changed="$(git -C "$root" diff --name-only "$base...$head" 2>/dev/null)"

missing=""
need_suite() {
    printf '%s\n' "$changed" | grep -qE "^$1.*\\.spec\\.ts\$" && return 0
    missing="${missing}${missing:+, }$1"
}
# A second-kit change demands the suite of an application only when it reaches what that application
# draws. Without the profile function every kit change demands every suite, as before.
kit2_reaches() {
    command -v rt_kit2_reaches >/dev/null 2>&1 || return 0
    (cd "$root" && rt_kit2_reaches "$changed" "$@")
}
case " $touched " in
    *' auth '*) need_suite 'apps/auth-example-e2e/' ;;
    *' kit2 '*) kit2_reaches apps/auth-example projects/auth-* && need_suite 'apps/auth-example-e2e/' ;;
esac
case " $touched " in
    *' receiver '*) need_suite 'apps/message-bus-admin-e2e/' ;;
    *' kit2 '*) kit2_reaches apps/message-bus-admin libs/message-bus-admin && need_suite 'apps/message-bus-admin-e2e/' ;;
esac
[ -z "$missing" ] && exit 0

# The bypass counts only in a commit that changes code itself.
skip_re='^E2E-skip:[[:space:]]*[^[:space:]<"'"'"'][^<"'"'"']{2,}'
for commit in $(git -C "$root" rev-list "$base..$head" 2>/dev/null); do
    git -C "$root" log -1 --format=%B "$commit" | grep -qE "$skip_re" || continue
    git -C "$root" diff-tree --no-commit-id --name-only -r "$commit" \
        | grep -qvE '^(docs/|\.claude/)|\.md$' && exit 0
done

tail_text="$(rt_deny_tail 'the line `E2E-skip: <reason>` in the body of a commit that changes code' 2>/dev/null)"
reason="BLOCKED by e2e-coverage-guard: the branch changes code ($touched) that an end-to-end suite walks, and adds or edits no test of that suite: $missing. Behaviour a change adds or alters is covered by an end-to-end test (\`*.spec.ts\` of the suite) in the same change — write the test there and run the suite before opening the PR. ${tail_text}"
jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
exit 0
