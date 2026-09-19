#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/git-guard-push-tests.sh · 30c24d7c90ea · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/profile-check.sh, hooks/deny-tail.sh
# The guard of the checks before a push. PreToolUse on the push call.
#
# A push is the entry into the pipeline: a merge into the main branch starts the rollout, and
# everything not checked locally gets checked on production already. Edits go out this way twice in
# a row, green in a selective run and red in the pipeline: one time only the end-to-end specs were
# run, the other only the affected project.
#
# The guard does not take it on trust: it runs what the tree profile listed itself, and lets the
# push through only on a zero return code. If the runner caches the result, the set takes seconds
# on an unchanged tree, and after an edit it is run anew.
#
# What to run is known by the profile: the function `rt_push_checks <base>` — one command per line.
# The base is the branch the contribution is counted against; empty means there is no remote. The
# function is called from the directory the push goes from and may decide by it itself: a step
# whose checks the tree does not have it simply does not print. There is no profile or no function
# — the guard passes: the package cannot invent the list of checks.
#
# The base is taken from the remote, not from the local main branch: the local one falls behind or
# diverges silently. That has happened already — the local one stood at a merge wiped from the
# history by a force push, and the set counted against it would have been the wrong one. There is
# no network or no remote — the base is empty, and the profile falls back to a full run: the gate
# may turn out stricter than needed, but NEVER weaker.
#
# FAIL-OPEN: not a repository, broken input, no profile — pass.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the guard.
RT_GUARD_NAME=git-guard-push-tests

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

tool="$(rt_hook_tool)"
case "$tool" in
    # The environment terminal and the universal runner put the command into the same field.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"

# A push call is recognised by two signs at once — the `git` command at the start of the line or
# after a separator, and the word `push` as a separate word. By the same technique as the delivery
# guard: the substring "git push" alone does not catch a push — the credentials helper and the
# request header are put between them by `-c` keys, and that is exactly the form pushed with here.
# While the sign was a substring, the whole gate set was not run at all on such a push, and the
# silence of the guard read as "green".
printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}git([[:space:]]|\$)" || exit 0

# A stashed edit is never a push: `git stash push` puts the edit into the stash of this same
# machine and sends nothing outside. The word `push` in it stands separate, and without this line
# the guard ran the whole set on it and then refused the call on the first red check — that is, it
# refused a command that sends nothing anywhere. The stash is cut out of the line, and the sign is
# counted on the remainder: in a compound command a real push may stand next to it.
probe="$(printf '%s' "$cmd" | sed -E 's/git[[:space:]]+stash[[:space:]]+push/git stash/g')"
printf '%s' "$probe" | grep -qE '(^|[[:space:]])push([[:space:]]|$)' || exit 0

# A dry-run push sends nothing: there is no point running the whole set for it.
case "$cmd" in
    *--dry-run*) exit 0 ;;
esac

# The refusal of this gate. The shared deny tail — the two lawful moves and the lawful form of a
# bypass — may not be laid out; then there is no tail, and the reason stays as it was.
push_deny() {
    reason="$1"
    # shellcheck disable=SC1090
    [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
        && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
    deny_tail_text="$(rt_deny_tail "")"
    [ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"The checks before the push did not pass."}}\n'
    exit 0
}

# A branch switch in the same command is refused whole.
#
# The guard is a parse of the command BEFORE it runs: it runs the set in the tree that lies there
# now. A compound "switch and push" passes the gate on the FORMER branch — silently, checking the
# wrong thing. There is no refusal at that, and a green set reads as a check of what goes to the
# hosting. This was caught by chance: the gate refused a push on a red check of file length for a
# file that is not in the pushed branch at all — it was looking at the branch the same command was
# leaving.
#
# What is judged is a switch to an existing branch. Creating a new one (`checkout -b`, `switch -c`)
# does not fall here: a fresh branch has the same tree as it had.
if printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}git[[:space:]]+(checkout|switch)[[:space:]]+" &&
    ! printf '%s' "$cmd" | grep -qE 'git[[:space:]]+(checkout([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-b|switch([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-c)([[:space:]]|$)'; then
    push_deny "BLOCKED: switching the branch and pushing by one command. The gate set runs on the tree that lies there at the minute the command is parsed — that is, on the FORMER branch, not the one that leaves for the hosting. A green set then reads as a check of what left, though it checked something else. Split the calls: switch first, then push by a separate command."
fi

workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ -f package.json ] || exit 0

# Sending from a second working copy is refused whole.
#
# The second copy is taken for reading: the merge of the main branch goes on it while the session's
# copy holds someone else's uncommitted work. A call made from there is judged by the copy the
# session stands in — that is, by a foreign tree: its stale archive and its half-written spec refuse
# the call, while the contribution actually leaving is never checked at all.
moved="$(printf '%s' "$cmd" | sed -nE 's/.*(^|[;&|[:space:]])cd[[:space:]]+([^[:space:];&|]+).*/\2/p' | head -1)"
moved="${moved%\'}"; moved="${moved#\'}"
moved="${moved%\"}"; moved="${moved#\"}"
if [ -n "$moved" ] && [ -d "$moved" ]; then
    moved_root="$(git -C "$moved" rev-parse --show-toplevel 2>/dev/null)"
    here_root="$(git rev-parse --show-toplevel 2>/dev/null)"
    if [ -n "$moved_root" ] && [ -n "$here_root" ] && [ "$moved_root" != "$here_root" ]; then
        push_deny "BLOCKED: the call goes from a second working copy — «${moved_root}», while the session stands in «${here_root}». The gate set runs where the session was started, not where the call was made: someone else's uncommitted work refuses it, and the contribution actually leaving passes unchecked. The second copy is for reading; bring the result of the merge back and send from the copy the session stands in."
    fi
fi

# The tree profile: first the package default, over it the project override, if there is one. A
# function declared in the override replaces the default whole and may call it back by the
# `_default` suffix. There is neither — the hook passes: an empty guard is better than a guard
# that refuses at random.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# A word about a missing profile function: a hook that exited silently is indistinguishable from a
# working one. The file may not be laid out — then the former, silent behaviour stays.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

# An observation line on every outcome. A guard that writes only refusals answers one question out
# of three: how many pushes it stopped. "The set was run and is green" and "no set was found" look
# the same in the record — as silence — and a gate that has not run a single check in a week is
# indistinguishable from a gate where everything is green. This is written into the same
# observations record as guard refusals, and goes out by the same tree switch.
rt_push_gate_note() {
    local outcome="$1" sid
    # shellcheck disable=SC1090
    [ -f "$rt_hooks_dir/observe.sh" ] && . "$rt_hooks_dir/observe.sh" 2>/dev/null
    command -v rt_note >/dev/null 2>&1 || return 0
    sid="$(printf '%s' "$input" | jq -r '.session_id // empty' 2>/dev/null)"
    if [ -n "$sid" ]; then
        rt_note push-gate "res=$outcome" "sid=$sid"
    else
        rt_note push-gate "res=$outcome"
    fi
    return 0
}

if ! rt_needs rt_push_checks git-guard-push-tests; then
    rt_push_gate_note no-checks
    exit 0
fi

main_branch="${RT_MAIN_BRANCH:-main}"
base=''
if git fetch --quiet origin "$main_branch" 2>/dev/null && git rev-parse --verify --quiet "origin/$main_branch" >/dev/null 2>&1; then
    base="origin/$main_branch"
fi

# The code by which a check declares that there was nothing to look at: neither "it matched" nor
# "a divergence". Before, such a check said so by a line of output and exited with zero — in the
# set that zero stood next to the passed ones and differed from them in nothing, while the summary
# read as checked whole. It does not refuse the push: a check with nothing to look at is not a
# breakage.
rt_skip_code="${RT_SKIP_CODE:-7}"

failed=""
output=""
skipped=""
ran=0
while IFS= read -r check; do
    [ -z "$check" ] && continue
    ran=$((ran + 1))
    out="$(eval "$check" 2>&1)"
    status=$?
    [ "$status" -eq 0 ] && continue
    if [ "$status" -eq "$rt_skip_code" ]; then
        skipped="${skipped}${skipped:+
}${check}"
        continue
    fi
    failed="$check"
    output="$out"
    break
done <<EOF
$(rt_push_checks "$base")
EOF

# What was skipped is named aloud even when the set passed: silence about it is exactly the
# indistinguishability this code was created for. The push goes through at that — there is no
# refusal here.
# The profile function is there, but it has nothing to print in this tree: the outcome is the same
# as without it — no set was found, and silence about that would read as a green run.
if [ "$ran" -eq 0 ]; then
    rt_push_gate_note no-checks
    exit 0
fi

if [ -z "$failed" ] && [ -n "$skipped" ]; then
    printf 'the push gate: the set passed, but these checks had nothing to look at:\n%s\n' "$skipped" >&2
fi

# How the gate set is narrower than the pipeline set — said once per session.
#
# The delivery rule demands that the gate not be narrower than the pipeline, and there is nothing
# to assemble that requirement from: the pipeline file differs from tree to tree, and the package
# cannot derive the steps of the set from it. Silence at that reads as "everything is checked": the
# divergence is learnt from a red pipeline after the PR, when the edit has already been handed to a
# person.
#
# The mark lives in the temporary files directory, as with the word about a missing profile
# function: on every push the same line would repeat dozens of times per session and would stop
# being read.
gap_key="$(printf '%s' "$input" | jq -r '.session_id // empty' 2>/dev/null)"
[ -z "$gap_key" ] && gap_key="$(date +%Y%m%d 2>/dev/null || printf 'nosession')"
gap_mark="${TMPDIR:-/tmp}/rt-kit-push-gate-gap-$gap_key"
if [ ! -f "$gap_mark" ]; then
    printf 'the push gate: the gate set is not the pipeline set. Image builds, showcase snapshots and
' >&2
    printf 'the check of assembled packages are not part of it: what stands in it is shown by the
' >&2
    printf 'state review (agent-kit doctor, the section on the set before a push) — run what is
' >&2
    printf 'missing before the request.
' >&2
    : >"$gap_mark" 2>/dev/null || true
fi

if [ -z "$failed" ]; then
    rt_push_gate_note green
    exit 0
fi

rt_push_gate_note red

# The tail of the output, not all of it: the runner prints a long one, and what is needed is the
# reason for the refusal.
tail_out="$(printf '%s' "$output" | tail -n 40 | tr -d '\000')"
# Red comes in two kinds, and the guard does not tell them apart: it checks only the return code.
# When a check of the code fails, "fix it and push again" is right. When the check itself is wrong,
# the same text orders fixing code nobody touched: a refusal once taken apart lay wholly in
# documents untouched by any commit of the branch. The verifiability law says a broken check does
# not stop the work, and until this line there was no such option in the refusal.
reason="BLOCKED: a push without a green local run. «${failed}» failed — fix it and push again, the guard must not be bypassed. A push is the entry into the pipeline, and red from here is checked already in production.

Three moves from here: fix what is named and repeat the call; fix the check itself, if it is the one that is wrong — take the refusals apart one by one, show the analysis to the owner and correct the check; or bring the owner the price of a bypass and wait for their word. What is in dispute is not added to the known list: it holds what was accepted, not the results of a broken check.

The tail of the output:

${tail_out}"

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the reason for the refusal stays as it
# was.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"The checks before the push did not pass."}}\n'

exit 0
