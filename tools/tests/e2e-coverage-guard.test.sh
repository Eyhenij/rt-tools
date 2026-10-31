#!/usr/bin/env bash
# The scenarios of the end-to-end coverage guard: a PR from a branch that changes code an
# end-to-end suite walks, and leaves that suite untouched, does not open.
#
# The guard is this tree's own: the suites and their subjects exist only here. It is called from
# the tree's hooks directory, and the subjects of paths come from the tree profile copied into a
# one-off repository.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ROOT="$(cd "$TOOLS/.." && pwd)"
GUARD="$ROOT/.claude/hooks/e2e-coverage-guard.sh"

echo "the end-to-end coverage guard"

REPOS=""
trap 'rm -rf $REPOS' EXIT

# A file and a commit with it: the path, the content, the message.
commit() {
    mkdir -p "$1/$(dirname "$2")"
    printf '%s\n' "$3" > "$1/$2"
    git -C "$1" add -A
    git -C "$1" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false \
        commit -q -m "$4"
}

# A repository with a commit on main and a work branch from it, with the tree profile inside. The
# path is written into the variable named by the second argument: a subshell would lose the cleanup
# list.
repo() {
    local dir
    dir="$(mktemp -d)"
    REPOS="$REPOS $dir"
    git -C "$dir" init -q
    git -C "$dir" checkout -q -b main
    mkdir -p "$dir/.claude/rt-kit"
    cp "$ROOT/.claude/rt-kit/project.sh" "$dir/.claude/rt-kit/project.sh"
    commit "$dir" package.json '{"name":"probe"}' 'chore: start'
    git -C "$dir" checkout -q -b "$1"
    printf -v "$2" '%s' "$dir"
}

input() {
    jq -n --arg c "$1" --arg d "$2" '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}'
}

run_guard() {
    input "$2" "$1" | CLAUDE_PROJECT_DIR="$1" RT_E2E_BASE=main bash "$GUARD" 2>/dev/null
}

# The decision: PASS or deny.
decision() {
    local out
    out="$(run_guard "$1" "$2")"
    if [ -z "$out" ]; then
        printf 'PASS'
    else
        printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision'
    fi
}

reason_has() {
    if run_guard "$1" "$2" | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' | grep -qF "$3"; then
        printf 'yes'
    else
        printf 'no'
    fi
}

OPEN="gh pr create --draft --base main --title '[RT-1] probe'"

repo RT-1-probe A
commit "$A" projects/auth-keycloak-theme/src/a.ts 'export const a = 1;' 'fix: theme'
report "a theme edit without its suites is refused" "$(decision "$A" "$OPEN")" deny
report "the refusal names the entry suite" "$(reason_has "$A" "$OPEN" 'apps/auth-example-e2e/')" yes
report "the refusal names the receiver suite" "$(reason_has "$A" "$OPEN" 'apps/message-bus-admin-e2e/')" yes
report "the refusal names the bypass" "$(reason_has "$A" "$OPEN" 'E2E-skip')" yes
commit "$A" apps/auth-example-e2e/src/a.spec.ts 'test' 'test: entry'
report "one suite of two touched is still refused" "$(decision "$A" "$OPEN")" deny
commit "$A" apps/message-bus-admin-e2e/src/a.spec.ts 'test' 'test: receiver'
report "both suites touched pass" "$(decision "$A" "$OPEN")" PASS

repo RT-2-probe B
commit "$B" prisma/schema.prisma 'model A {}' 'fix: schema'
report "a receiver edit without its suite is refused" "$(decision "$B" "$OPEN")" deny
commit "$B" prisma/note.prisma 'model B {}' "$(printf 'refactor: move\n\nE2E-skip: a move without a change of behaviour')"
report "the bypass line with a reason passes" "$(decision "$B" "$OPEN")" PASS

repo RT-3-probe C
commit "$C" docs/note.md 'text' 'docs: text'
report "a text edit is not judged" "$(decision "$C" "$OPEN")" PASS
commit "$C" prisma/schema.prisma 'model A {}' "$(printf 'fix: schema\n\nE2E-skip:')"
report "the bypass line without a reason does not pass" "$(decision "$C" "$OPEN")" deny
report "a command other than opening a PR is not judged" "$(decision "$C" 'git status')" PASS

suite_result "the end-to-end coverage guard"
