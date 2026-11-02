#!/usr/bin/env bash
# The scenarios of the end-to-end coverage guard: a PR from a branch that changes code an
# end-to-end suite walks, and adds no test of that suite, does not open.
#
# The guard is this tree's own: the suites and their subjects exist only here. It is called from
# the tree's hooks directory, and the subjects of paths come from the tree profile copied into a
# one-off repository. The base is read from the command as the guard reads it in work: each
# repository carries the remote ref of its main branch, and nothing substitutes it.
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

# The remote ref of a branch, as a fetch leaves it.
publish() {
    git -C "$1" update-ref "refs/remotes/origin/$2" "$2"
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
    publish "$dir" main
    git -C "$dir" checkout -q -b "$1"
    printf -v "$2" '%s' "$dir"
}

input() {
    jq -n --arg c "$1" --arg d "$2" '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}'
}

# The directory of the call, the command, and the tree of the session — the same directory unless
# named. The parsed hook fields of the caller are dropped: run from the push gate, the set inherits
# the parsed `git push` of the outer hook, and the guard would judge that instead of the input given.
run_guard() {
    input "$2" "$1" | env -u RT_HOOK_PARSED -u RT_HOOK_INPUT -u RT_HOOK_TOOL -u RT_HOOK_CMD \
        -u RT_HOOK_FILE -u RT_HOOK_CWD -u RT_HOOK_SOURCE \
        CLAUDE_PROJECT_DIR="${3:-$1}" bash "$GUARD" 2>/dev/null
}

# The decision: PASS or deny.
decision() {
    local out
    out="$(run_guard "$@")"
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

# --- which suite a subject demands ---------------------------------------------------------------

repo RT-1-probe A
commit "$A" projects/auth-keycloak-theme/src/a.ts 'export const a = 1;' 'fix: theme'
report "a theme edit without its suite is refused" "$(decision "$A" "$OPEN")" deny
report "the refusal names the entry suite" "$(reason_has "$A" "$OPEN" 'apps/auth-example-e2e/')" yes
report "a theme edit does not demand the receiver suite" "$(reason_has "$A" "$OPEN" 'apps/message-bus-admin-e2e/')" no
report "the refusal names the bypass" "$(reason_has "$A" "$OPEN" 'E2E-skip')" yes
commit "$A" apps/auth-example-e2e/src/a.spec.ts 'test' 'test: entry'
report "a theme edit with an entry test passes" "$(decision "$A" "$OPEN")" PASS

repo RT-2-probe B
commit "$B" projects/auth-server/src/a.ts 'export const a = 1;' 'fix: auth package'
report "an auth package edit names the entry suite" "$(reason_has "$B" "$OPEN" 'apps/auth-example-e2e/')" yes
report "an auth package edit names the receiver suite" "$(reason_has "$B" "$OPEN" 'apps/message-bus-admin-e2e/')" yes
commit "$B" apps/auth-example-e2e/src/a.spec.ts 'test' 'test: entry'
report "one suite of two touched is still refused" "$(decision "$B" "$OPEN")" deny
commit "$B" apps/message-bus-admin-e2e/src/a.spec.ts 'test' 'test: receiver'
report "both suites touched pass" "$(decision "$B" "$OPEN")" PASS

repo RT-3-probe C
commit "$C" projects/ui-kit-v2/src/a.ts 'export const a = 1;' 'fix: kit'
report "a second kit edit names the entry suite" "$(reason_has "$C" "$OPEN" 'apps/auth-example-e2e/')" yes
report "a second kit edit names the receiver suite" "$(reason_has "$C" "$OPEN" 'apps/message-bus-admin-e2e/')" yes

repo RT-4-probe D
commit "$D" libs/message-bus-admin/src/a.ts 'export const a = 1;' 'fix: admin screen'
report "an admin library edit without its suite is refused" "$(decision "$D" "$OPEN")" deny
report "an admin library edit names the receiver suite" "$(reason_has "$D" "$OPEN" 'apps/message-bus-admin-e2e/')" yes

repo RT-5-probe E
commit "$E" package.json '{"name":"probe2"}' 'chore: root'
commit "$E" projects/auth-keycloak-theme/src/a.ts 'export const a = 1;' 'fix: theme'
report "a root edit together with a theme edit is refused" "$(decision "$E" "$OPEN")" deny
report "the refusal names the entry suite" "$(reason_has "$E" "$OPEN" 'apps/auth-example-e2e/')" yes

# --- what counts as a test -----------------------------------------------------------------------

repo RT-6-probe F
commit "$F" prisma/schema.prisma 'model A {}' 'fix: schema'
report "a receiver edit without its suite is refused" "$(decision "$F" "$OPEN")" deny
commit "$F" apps/message-bus-admin-e2e/README.md 'text' 'docs: suite'
report "a suite README is not a test" "$(decision "$F" "$OPEN")" deny
commit "$F" apps/message-bus-admin-e2e/src/a.spec.ts-snapshots/a.png 'png' 'test: snapshot'
report "a re-shot snapshot is not a test" "$(decision "$F" "$OPEN")" deny
commit "$F" apps/message-bus-admin-e2e/src/a.spec.ts 'test' 'test: receiver'
report "a test file of the suite passes" "$(decision "$F" "$OPEN")" PASS

# --- the bypass ----------------------------------------------------------------------------------

repo RT-7-probe G
commit "$G" prisma/schema.prisma 'model A {}' "$(printf 'fix: schema\n\nE2E-skip:')"
report "the bypass line without a reason does not pass" "$(decision "$G" "$OPEN")" deny
commit "$G" prisma/a.prisma 'model B {}' "$(printf 'fix: schema\n\nE2E-skip: <reason>')"
report "the sample of the bypass does not pass" "$(decision "$G" "$OPEN")" deny
commit "$G" prisma/b.prisma 'model C {}' "$(printf 'fix: schema\n\nE2E-skip: x')"
report "a reason shorter than three characters does not pass" "$(decision "$G" "$OPEN")" deny
commit "$G" docs/note.md 'text' "$(printf 'docs: text\n\nE2E-skip: a text edit walks no screen')"
report "the bypass in a commit of texts only does not pass" "$(decision "$G" "$OPEN")" deny
commit "$G" prisma/c.prisma 'model D {}' "$(printf 'refactor: move\n\nE2E-skip: a move without a change of behaviour')"
report "the bypass with a reason in a commit of code passes" "$(decision "$G" "$OPEN")" PASS

# --- what is judged ------------------------------------------------------------------------------

repo RT-8-probe H
commit "$H" docs/note.md 'text' 'docs: text'
report "a text edit is not judged" "$(decision "$H" "$OPEN")" PASS
commit "$H" prisma/schema.prisma 'model A {}' 'fix: schema'
report "a command other than opening a PR is not judged" "$(decision "$H" 'git status')" PASS
report "a mention in echo is not a call" "$(decision "$H" "echo 'gh pr create --base main'")" PASS
report "a mention in a commit message is not a call" "$(decision "$H" "git commit -m 'next: gh pr create'")" PASS
report "a call after a separator is judged" "$(decision "$H" "git push && $OPEN")" deny
report "a call without a base is judged against main" "$(decision "$H" "gh pr create --draft --title probe")" deny

# --- the base of a chain -------------------------------------------------------------------------

# The branch below carries a covered receiver edit; the branch above adds an uncovered one. Against
# main the test of the branch below covers both, against its own base nothing covers the edit above.
repo RT-9-probe I
commit "$I" prisma/schema.prisma 'model A {}' 'fix: schema'
commit "$I" apps/message-bus-admin-e2e/src/a.spec.ts 'test' 'test: receiver'
publish "$I" RT-9-probe
git -C "$I" checkout -q -b RT-10-probe
commit "$I" prisma/b.prisma 'model B {}' 'fix: schema above'
report "--base of the branch below is read" "$(decision "$I" "gh pr create --base RT-9-probe --title probe")" deny
report "-B of the branch below is read" "$(decision "$I" "gh pr create -B RT-9-probe --title probe")" deny
report "a base in single quotes is read" "$(decision "$I" "gh pr create --base 'RT-9-probe' --title probe")" deny
report "a base in double quotes is read" "$(decision "$I" "gh pr create --base \"RT-9-probe\" --title probe")" deny
report "--base= is read" "$(decision "$I" "gh pr create --base=RT-9-probe --title probe")" deny
report "a --base inside the body does not count" "$(decision "$I" "gh pr create --body 'stands on --base main' -B RT-9-probe")" deny
report "the same chain against main passes" "$(decision "$I" "gh pr create --base main --title probe")" PASS

# --- the tree and the head -----------------------------------------------------------------------

repo RT-11-probe J
commit "$J" prisma/schema.prisma 'model A {}' 'fix: schema'
repo RT-12-probe K
commit "$K" docs/note.md 'text' 'docs: text'
report "the directory of the call is judged, not the session tree" "$(decision "$J" "$OPEN" "$K")" deny
report "a clean directory of the call passes in a dirty session tree" "$(decision "$K" "$OPEN" "$J")" PASS
report "a move named in the command is judged" "$(decision "$K" "cd $J && $OPEN" "$K")" deny
publish "$J" RT-11-probe
git -C "$J" checkout -q main
report "--head names the branch judged" "$(decision "$J" "gh pr create --base main --head RT-11-probe --title probe")" deny
report "a checked-out main without --head passes" "$(decision "$J" "$OPEN")" PASS

suite_result "the end-to-end coverage guard"
