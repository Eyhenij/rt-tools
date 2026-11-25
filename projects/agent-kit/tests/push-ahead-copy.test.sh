#!/usr/bin/env bash
# Scenarios of a run ahead whose copy changed under it, and of a run that was stopped: the run calls
# nothing green that its marks do not vouch for, and leaves no process behind.
#
# Scenarios of the agreement: SC-AK-1980, SC-AK-1981, SC-AK-1982, SC-AK-1983.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the run ahead and its copy"

BOX="$(mktemp -d)"
trap 'rm -rf "$BOX"' EXIT

# A tree whose set is the steps given, one per argument. The profile is ignored, so that a step is
# changed without a commit; the last step of the calls leaves its trace outside the copy.
tree_of() {
    local t step
    t="$(fixture_repo_branched main work)"
    mkdir -p "$t/.claude/rt-kit" "$t/docs"
    printf '.claude/\n' >"$t/.gitignore"
    printf 'a\n' >"$t/docs/a.md"
    : >"$BOX/steps"
    for step in "$@"; do printf '%s\n' "$step" >>"$BOX/steps"; done
    cp "$BOX/steps" "$t/.claude/steps"
    cat >"$t/.claude/rt-kit/project.sh" <<'EOF'
rt_push_checks() { cat "$CLAUDE_PROJECT_DIR/.claude/steps"; }
rt_push_check_unread() { case "$1" in *heavy*) printf '%s\n' ':(exclude)docs' ;; esac; }
EOF
    git -C "$t" add -A 2>/dev/null
    git -C "$t" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false commit -q -m 'feat: x' 2>/dev/null
    printf '%s' "$t"
}

# One run of the set: the output in $BOX/log, the code in $code.
run() {
    (cd "$1" && CLAUDE_PROJECT_DIR="$1" bash "$HOOKS/git-guard-push-ahead.sh" >"$BOX/log" 2>&1)
    code=$?
}
said() { if grep -qF -- "$1" "$BOX/log"; then printf yes; else printf no; fi; }
verdict() { grep '^push ahead:' "$BOX/log" | tail -1; }
marks() { ls "$1/.git/rt-kit/push-green" 2>/dev/null | wc -l | tr -d ' '; }

COMMIT='git -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false commit -q -m x'

# --- SC-AK-1980 — an edit left in the copy ----------------------------------------------------------
t="$(tree_of 'true # first' 'echo b >>docs/a.md # editor' "touch $BOX/next # next")"
run "$t"
report "SC-AK-1980 — a run whose copy was edited ends with its own code" "$code" 101
report "SC-AK-1980 — the run names the edited file" "$(said ' M docs/a.md')" yes
report "SC-AK-1980 — the run names the step it was seen after" "$(said 'seen after: echo b >>docs/a.md # editor')" yes
report "SC-AK-1980 — no step starts after it" "$([ -e "$BOX/next" ] && echo started || echo held)" held
report "SC-AK-1980 — the run is not called green" "$(said 'the set is green')" no
report "SC-AK-1980 — the last verdict says not judged" "$(verdict)" 'push ahead: not judged — the copy changed under it; run the set again'
report "SC-AK-1980 — the steps before the edit keep their marks, the edited one has none" "$(marks "$t")" 1
rm -rf "$t"

t="$(tree_of 'true # first' 'echo b >>docs/a.md; false # red editor')"
run "$t"
report "SC-AK-1980 — a red step outweighs the edit" "$code" 1
report "SC-AK-1980 — and the edit is named still" "$(said 'the copy changed while the set ran')" yes
rm -rf "$t"

# --- SC-AK-1981 — a commit made under the run -------------------------------------------------------
t="$(tree_of 'true # first' "echo b >>x.txt; git add -A; $COMMIT # committer" 'true # last')"
run "$t"
report "SC-AK-1981 — a run whose head moved ends with its own code" "$code" 101
report "SC-AK-1981 — the step it moved under is named" "$(sed -n '/no mark for/,$p' "$BOX/log" | grep -c '# committer')" 1
report "SC-AK-1981 — a step that ran before it is named too" "$(sed -n '/no mark for/,$p' "$BOX/log" | grep -c '# first')" 1
report "SC-AK-1981 — a step that ran on the new head is not" "$(sed -n '/no mark for/,$p' "$BOX/log" | grep -c '# last')" 0
rm -rf "$t"

# The second run finds the first step green already, and a commit of a text takes its mark away: the
# heavy step does not read the text and keeps its own.
t="$(tree_of 'true # first' 'true # heavy' 'true # last')"
run "$t"
printf '%s\n' 'true # first' 'true # heavy' "echo c >>docs/a.md; git add -A; $COMMIT # heavy committer" >"$t/.claude/steps"
run "$t"
report "SC-AK-1981 — the first step was green already" "$(said '= green already: true # first')" yes
report "SC-AK-1981 — a run that lost the mark of such a step is not judged" "$code" 101
report "SC-AK-1981 — the lost one is named and the heavy one is not" \
    "$(sed -n '/no mark for/,/^$/p' "$BOX/log" | grep -c '# first') $(sed -n '/no mark for/,/^$/p' "$BOX/log" | grep -c 'true # heavy')" '1 0'
rm -rf "$t"

# --- SC-AK-1982 — a copy nobody touched -------------------------------------------------------------
t="$(tree_of 'true # first' 'exit 7 # nothing' 'mkdir -p .claude/rt-kit/observations; echo x >.claude/rt-kit/observations/a # watcher')"
run "$t"
report "SC-AK-1982 — a copy nobody touched passes as before" "$code" 0
report "SC-AK-1982 — the last verdict says green" "$(verdict)" 'push ahead: the set is green, the push passes from the marks'
report "SC-AK-1982 — a step with nothing to look at spoils nothing" "$(said '~ nothing to look at: exit 7 # nothing')" yes
rm -rf "$t"

t="$(tree_of 'mkdir -p .claude/rt-kit/observations; echo x >.claude/rt-kit/observations/a # watcher')"
printf '\n' >"$t/.gitignore"
git -C "$t" add -A 2>/dev/null
git -C "$t" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false commit -q -m 'chore: open' 2>/dev/null
run "$t"
report "SC-AK-1982 — the record of observations is no edit, ignored or not" "$code" 0
rm -rf "$t"

t="$(tree_of 'read line; echo "got $line" # reader' "touch $BOX/after # after")"
rm -f "$BOX/after"
run "$t"
report "SC-AK-1982 — a step that reads its input does not eat the next steps" "$([ -e "$BOX/after" ] && echo ran || echo eaten)" ran
printf 'b\n' >>"$t/docs/a.md"
run "$t"
report "SC-AK-1982 — a run that did not start keeps its code" "$code:$(said 'edits outside the index')" 3:yes
rm -rf "$t"

# --- SC-AK-1983 — a run that was stopped ------------------------------------------------------------
# The step keeps a server in a group of its own and takes it down by INT alone, some time after it: a
# stand of end-to-end suites behaves so. A second process of the step takes its child down by TERM.
cat >"$BOX/stand.mjs" <<'EOF'
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const [, , box, signal] = process.argv;
const server = spawn('sleep', ['300'], { detached: true, stdio: 'ignore' });
writeFileSync(`${box}/server-${signal}`, String(server.pid));
for (const name of ['SIGINT', 'SIGTERM', 'SIGHUP'])
    process.on(name, () => {
        if (name !== signal) return;
        setTimeout(() => {
            process.kill(server.pid);
            writeFileSync(`${box}/cleaned-${signal}`, '');
            process.exit(1);
        }, 1500);
    });
writeFileSync(`${box}/ready-${signal}`, '');
setInterval(() => {}, 1000);
EOF
alive() { if kill -0 "$(cat "$1" 2>/dev/null)" 2>/dev/null; then printf alive; else printf gone; fi; }
wait_for() { local n=0; until [ -e "$1" ] || [ "$n" -ge 100 ]; do sleep 0.1; n=$((n + 1)); done; }

for signal in SIGINT SIGTERM; do
    t="$(tree_of 'true # first' "node $BOX/stand.mjs $BOX $signal # heavy stand" "touch $BOX/late-$signal # late")"
    (cd "$t" && CLAUDE_PROJECT_DIR="$t" RT_PUSH_STOP_WAIT=4 exec bash "$HOOKS/git-guard-push-ahead.sh" >"$BOX/log" 2>&1) &
    ahead=$!
    wait_for "$BOX/ready-$signal"
    pid="$(sed -n 's/^push ahead: base .*, pid \([0-9]*\)$/\1/p' "$BOX/log")"
    kill -TERM "$pid" 2>/dev/null
    wait "$ahead" 2>/dev/null
    code=$?
    report "SC-AK-1983 — a stopped run ends with the code of the signal ($signal)" "$code" 143
    report "SC-AK-1983 — the server a step takes down by $signal is gone" "$(alive "$BOX/server-$signal")" gone
    report "SC-AK-1983 — the step cleans up by $signal itself before it is killed" "$([ -e "$BOX/cleaned-$signal" ] && echo cleaned || echo killed)" cleaned
    report "SC-AK-1983 — no step starts after the stop ($signal)" "$([ -e "$BOX/late-$signal" ] && echo started || echo held)" held
    report "SC-AK-1983 — the steps before keep their marks, the stopped one has none ($signal)" "$(marks "$t")" 1
    report "SC-AK-1983 — the copy is clean after the stop ($signal)" "$(git -C "$t" status --porcelain | wc -l | tr -d ' ')" 0
    report "SC-AK-1983 — the run names the stopped step ($signal)" "$(said '~ stopped, no mark: node')" yes
    kill "$(cat "$BOX/server-$signal")" 2>/dev/null
    rm -rf "$t"
done

# A step that ignores both is killed: nothing is left of it.
cat >"$BOX/deaf.sh" <<'EOF'
trap '' INT TERM
echo $$ >"$1/server-deaf"
: >"$1/ready-deaf"
while :; do sleep 1; done
EOF
t="$(tree_of "bash $BOX/deaf.sh $BOX # heavy deaf")"
(cd "$t" && CLAUDE_PROJECT_DIR="$t" RT_PUSH_STOP_WAIT=1 exec bash "$HOOKS/git-guard-push-ahead.sh" >"$BOX/log" 2>&1) &
ahead=$!
wait_for "$BOX/ready-deaf"
kill -TERM "$(sed -n 's/^push ahead: base .*, pid \([0-9]*\)$/\1/p' "$BOX/log")" 2>/dev/null
wait "$ahead" 2>/dev/null
report "SC-AK-1983 — a step deaf to both signals is gone" "$(alive "$BOX/server-deaf")" gone
kill -KILL "$(cat "$BOX/server-deaf")" 2>/dev/null
rm -rf "$t"

suite_result "the run ahead and its copy"
