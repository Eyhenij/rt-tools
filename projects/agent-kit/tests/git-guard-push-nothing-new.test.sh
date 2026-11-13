#!/usr/bin/env bash
# Scenarios of the push gate for a head that adds nothing to its base: every commit of it already
# lies in that branch on the remote, so the set has nothing new to judge and is not run.
#
# A set of its own next to the scenarios of the gate: these need a repository with a remote, and the
# gate's own file stands at the length limit.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the push gate: a head that adds nothing to its base"

# A working copy with a remote: the main branch is on the remote, the work branch is taken from it.
# The set of the tree is one red check — whatever runs it refuses.
remote_fixture() {
    local work="$1" remote dir
    remote="$(mktemp -d)"
    dir="$(mktemp -d)"
    git -C "$remote" init -q --bare 2>/dev/null
    git -C "$dir" init -q 2>/dev/null
    git -C "$dir" config commit.gpgsign false
    git -C "$dir" config user.name probe
    git -C "$dir" config user.email probe@example.invalid
    git -C "$dir" checkout -q -b main 2>/dev/null
    printf '{"name":"probe"}\n' > "$dir/package.json"
    mkdir -p "$dir/.claude/rt-kit"
    printf 'rt_push_checks() { printf "%%s\\n" false; }\n' > "$dir/.claude/rt-kit/project.sh"
    git -C "$dir" add -A 2>/dev/null
    git -C "$dir" commit -q -m 'chore: the start' 2>/dev/null
    git -C "$dir" remote add origin "$remote"
    git -C "$dir" push -q origin main 2>/dev/null
    git -C "$dir" checkout -q -b "$work" 2>/dev/null
    printf '%s' "$dir"
}

gate() {
    local label="$1" dir="$2" cmd="$3" want="$4" out
    out="$(CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-push-tests.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

ahead_says() {
    (cd "$1" && CLAUDE_PROJECT_DIR="$1" bash "$HOOKS/git-guard-push-ahead.sh" 2>&1 | grep -c 'adds no commit')
}

EQUAL="$(remote_fixture RT-3282-equal)"
gate "SC-AK-1345 — a head equal to its base is pushed with no check run" "$EQUAL" 'git push origin RT-3282-equal' PASS
report "SC-AK-1345 — the run ahead names that there is nothing to run" "$(ahead_says "$EQUAL")" 1

# The pair of the assertion above: the same tree with one commit over the base runs its red check.
printf 'one\n' > "$EQUAL/note.txt"
git -C "$EQUAL" add -A 2>/dev/null
git -C "$EQUAL" commit -q -m 'chore: one commit over the base' 2>/dev/null
gate "SC-AK-1346 — a head with a commit over its base is judged by the set" "$EQUAL" 'git push origin RT-3282-equal' deny
report "SC-AK-1346 — the run ahead does not call such a head empty" "$(ahead_says "$EQUAL")" 0

# A repository with no remote has no base to compare with, and the set runs as before.
LONE="$(fixture_repo RT-3282-lone)"
mkdir -p "$LONE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" false; }\n' > "$LONE/.claude/rt-kit/project.sh"
gate "SC-AK-1346 — a head with no base on a remote is judged by the set" "$LONE" 'git push origin RT-3282-lone' deny

suite_result "the push gate: a head that adds nothing to its base"
