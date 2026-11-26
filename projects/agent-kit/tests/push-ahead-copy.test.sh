#!/usr/bin/env bash
# Scenarios of a run ahead whose copy changed under it, and of a run that was stopped: the run calls
# nothing green that its marks do not vouch for, and leaves no process behind.
#
# Scenarios of the agreement: SC-AK-1980, SC-AK-1981, SC-AK-1982, SC-AK-1983.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the run ahead and its copy"

BOX="$(mktemp -d)"
# A scenario that fell leaves its run and its servers: they end with the set.
sweep() {
    local file
    for file in "$BOX"/pid "$BOX"/server-*; do
        [ -s "$file" ] && kill -KILL "$(cat "$file")" 2>/dev/null
    done
    rm -rf "$BOX"
}
trap sweep EXIT

# A tree whose set is the steps given, one per argument. The profile is ignored, so that a step is
# changed without a commit.
tree_of() {
    local t step
    t="$(fixture_repo_branched main work)"
    mkdir -p "$t/.claude/rt-kit" "$t/docs"
    printf '.claude/\n' >"$t/.gitignore"
    printf 'a\n' >"$t/docs/a.md"
    for step in "$@"; do printf '%s\n' "$step"; done >"$t/.claude/steps"
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
# How many times a step is named among the ones without a mark.
unmarked() { sed -n '/^✗ no mark on the head/,/^$/p' "$BOX/log" | grep -cF -- "$1"; }

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

# A new file is an edit whatever the machine says of untracked ones, and its name is readable.
t="$(tree_of 'echo b >docs/новый.md # adder')"
git -C "$t" config status.showUntrackedFiles no
run "$t"
report "SC-AK-1980 — a new file is an edit, hidden by the settings or not" "$code:$(said '?? docs/новый.md')" 101:yes
rm -rf "$t"

# A process the step left in the background writes after the step: it is waited for.
t="$(tree_of '(sleep 1; echo late >>docs/a.md) & echo started # leaver')"
run "$t"
report "SC-AK-1980 — an edit of a process the step left behind is seen" "$code" 101
rm -rf "$t"

# --- SC-AK-1981 — a commit made under the run -------------------------------------------------------
t="$(tree_of 'true # first' "echo b >>x.txt; git add -A; $COMMIT # committer" 'true # last')"
run "$t"
report "SC-AK-1981 — a run whose head moved ends with its own code" "$code" 101
report "SC-AK-1981 — the step it moved under is named" "$(unmarked '# committer')" 1
report "SC-AK-1981 — a step that ran before it is named too" "$(unmarked '# first')" 1
report "SC-AK-1981 — a step that ran on the new head is not" "$(unmarked '# last')" 0
report "SC-AK-1981 — the verdict says the head moved" "$(verdict)" 'push ahead: not judged — the head moved under it; run the set again'
rm -rf "$t"

t="$(tree_of 'true # first' "echo b >>x.txt; git add -A; $COMMIT; false # red committer")"
run "$t"
report "SC-AK-1981 — a red step outweighs the commit, and the lost mark is named" "$code:$(unmarked '# first')" 1:1
rm -rf "$t"

# The second run finds the first step green already, and a commit of a text takes its mark away: the
# heavy step does not read the text and keeps its own.
t="$(tree_of 'true # first' 'true # heavy' 'true # last')"
run "$t"
printf '%s\n' 'true # first' 'true # heavy' "echo c >>docs/a.md; git add -A; $COMMIT # heavy committer" >"$t/.claude/steps"
run "$t"
report "SC-AK-1981 — the first step was green already" "$(said '= green already: true # first')" yes
report "SC-AK-1981 — a run that lost the mark of such a step is not judged" "$code" 101
report "SC-AK-1981 — the lost one is named and the heavy one is not" "$(unmarked '# first') $(unmarked 'true # heavy')" '1 0'
rm -rf "$t"

# Marks that cannot be written are no moved head.
t="$(tree_of 'true # first')"
mkdir -p "$t/.git/rt-kit"
: >"$t/.git/rt-kit/push-green"
run "$t"
report "SC-AK-1981 — marks that cannot be written are named by their own words" \
    "$code:$(said 'marks of green steps are missing'):$(said 'the head moved')" 101:yes:no
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
run "$t"
report "SC-AK-1982 — a step that reads its input does not eat the next steps" "$([ -e "$BOX/after" ] && echo ran || echo eaten)" ran
printf 'b\n' >>"$t/docs/a.md"
run "$t"
report "SC-AK-1982 — a run that did not start keeps its code" "$code:$(said 'edits outside the index')" 3:yes
rm -rf "$t"

# The output of a red step and its code pass through the pipe whole.
t="$(tree_of 'seq 1 30; exit 5 # red talker')"
run "$t"
report "SC-AK-1982 — the output of a red step reaches the line" "$code:$(grep -cx 30 "$BOX/log")" 1:1
rm -rf "$t"

# --- SC-AK-1983 — a run that was stopped ------------------------------------------------------------
# The run is started by node: it gives the child the default answer to every signal, as the call of
# an agent does. A shell that starts it by `&` makes it and all its steps deaf to INT.
cat >"$BOX/launch.mjs" <<'EOF'
import { spawn } from 'node:child_process';
import { openSync, writeFileSync } from 'node:fs';
const [, , box, hook, tree] = process.argv;
const log = openSync(`${box}/log`, 'w');
const child = spawn('bash', [hook], {
    cwd: tree,
    stdio: ['ignore', log, log],
    env: { ...process.env, CLAUDE_PROJECT_DIR: tree },
});
writeFileSync(`${box}/pid`, String(child.pid));
child.on('close', (code) => writeFileSync(`${box}/code`, String(code)));
EOF
# A step with a server in a group of its own, taken down by one signal alone, some time after it: a
# stand of end-to-end suites does so by INT, a builder by TERM.
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
            // A broken output ends the step here, before the end of its cleaning; the console would swallow it.
            process.stdout.write('down\n');
            setTimeout(() => {
                writeFileSync(`${box}/cleaned-${signal}`, '');
                process.exit(1);
            }, 200);
        }, 1500);
    });
writeFileSync(`${box}/ready`, '');
setInterval(() => {}, 1000);
EOF
# A step that dies by the first signal and holds a child deaf to every one, in a group of its own. In
# the same group the child left one whose parent is gone: the group alone names it.
cat >"$BOX/keeper.mjs" <<'EOF'
import { spawn } from 'node:child_process';
const [, , box] = process.argv;
const deaf = 'while :; do sleep 1; done';
const script = `trap '' INT TERM; (${deaf.replace(/done$/, 'done &')} echo $! >${box}/server-lost); echo $$ >${box}/server-keeper; : >${box}/ready; ${deaf}`;
spawn('bash', ['-c', script], { detached: true, stdio: 'ignore' });
setInterval(() => {}, 1000);
EOF
# A step that dies by the first signal, and its child in a group of its own cleans up by TERM.
cat >"$BOX/loner.mjs" <<'EOF'
import { spawn } from 'node:child_process';
const [, , box] = process.argv;
const script = `trap ': >${box}/cleaned-loner; exit 0' TERM; echo $$ >${box}/server-loner; : >${box}/ready; while :; do sleep 0.2; done`;
spawn('bash', ['-c', script], { detached: true, stdio: 'ignore' });
setInterval(() => {}, 1000);
EOF
# A command that ends by INT itself: the shell of the step would go on to the next one.
printf '%s\n' "trap 'exit 1' INT" 'echo $$ >"$1/server-polite"' ': >"$1/ready"' 'while :; do sleep 0.2; done' >"$BOX/polite.sh"
# A step whose child outlived its parent and stayed in the group of the step.
cat >"$BOX/orphan.sh" <<'EOF'
(sleep 300 & echo $! >"$1/server-orphan")
: >"$1/ready"
sleep 300
EOF
printf '%s\n' "trap '' INT TERM" 'echo $$ >"$1/server-deaf"' ': >"$1/ready"' 'while :; do sleep 1; done' >"$BOX/deaf.sh"
printf '%s\n' "trap '' INT" 'echo $$ >"$1/server-half"' ': >"$1/ready"' 'while :; do sleep 1; done' >"$BOX/half.sh"
mkdir -p "$BOX/no-ps"
printf '#!/bin/sh\nexit 1\n' >"$BOX/no-ps/ps"
# A table of processes that is not given once: the third time it is asked for.
mkdir -p "$BOX/torn-ps"
printf '%s\n' '#!/bin/sh' "echo x >>$BOX/asked" "[ \"\$(wc -l <$BOX/asked | tr -d ' ')\" = 3 ] && exit 1" 'exec /bin/ps "$@"' >"$BOX/torn-ps/ps"
chmod +x "$BOX/no-ps/ps" "$BOX/torn-ps/ps"

# Whether a process of a step still runs. One that never came up is neither: a scenario that did not
# reach its subject proves nothing.
alive() {
    local pid
    pid="$(cat "$BOX/server-$1" 2>/dev/null)"
    rm -f "$BOX/server-$1"
    if [ -z "$pid" ]; then
        printf absent
    elif kill -0 "$pid" 2>/dev/null; then
        kill -KILL "$pid" 2>/dev/null
        printf alive
    else
        printf gone
    fi
}
wait_for() {
    local n=0
    until [ -e "$1" ] || [ "$n" -ge "${2:-150}" ]; do
        sleep 0.1
        n=$((n + 1))
    done
    [ -e "$1" ]
}
# A run stopped in the middle of a step: the tree, the signal, the seconds of the wait, and one more
# signal when a fourth argument stands. The code in $code, the seconds in $took.
stopped() {
    local started
    rm -f "$BOX/ready" "$BOX/code" "$BOX/pid"
    RT_PUSH_STOP_WAIT="$3" node "$BOX/launch.mjs" "$BOX" "$HOOKS/git-guard-push-ahead.sh" "$1" &
    wait_for "$BOX/ready" 300 || report "SC-AK-1983 — the step the run is stopped in came up" absent up
    started="$(date +%s)"
    kill "-$2" "$(cat "$BOX/pid")" 2>/dev/null
    if [ -n "${4:-}" ]; then
        sleep 0.4
        kill "-$2" "$(cat "$BOX/pid")" 2>/dev/null
    fi
    wait_for "$BOX/code" 300 || kill -KILL "$(cat "$BOX/pid")" 2>/dev/null
    took=$(($(date +%s) - started))
    code="$(cat "$BOX/code" 2>/dev/null)"
    run_pid="$(cat "$BOX/pid" 2>/dev/null)"
    wait 2>/dev/null
    # The number of an ended run may go to a process of another: the sweep does not kill by it.
    [ -n "$code" ] && rm -f "$BOX/pid"
}

for signal in SIGINT SIGTERM; do
    t="$(tree_of 'true # first' "node $BOX/stand.mjs $BOX $signal # heavy stand" "touch $BOX/late-$signal # late")"
    stopped "$t" TERM 4 again
    report "SC-AK-1983 — a stopped run ends with the code of the signal ($signal)" "$code" 143
    report "SC-AK-1983 — the first line names the process of the run ($signal)" \
        "$(sed -n 's/^push ahead: base .*, pid \([0-9]*\)$/\1/p' "$BOX/log")" "$run_pid"
    report "SC-AK-1983 — the server a step takes down by $signal is gone" "$(alive "$signal")" gone
    report "SC-AK-1983 — the step cleans up by $signal itself, a second signal to the run or not" "$([ -e "$BOX/cleaned-$signal" ] && echo cleaned || echo killed)" cleaned
    report "SC-AK-1983 — no step starts after the stop ($signal)" "$([ -e "$BOX/late-$signal" ] && echo started || echo held)" held
    report "SC-AK-1983 — the steps before keep their marks, the stopped one has none ($signal)" "$(marks "$t")" 1
    report "SC-AK-1983 — the copy is clean after the stop ($signal)" "$(git -C "$t" status --porcelain | wc -l | tr -d ' ')" 0
    report "SC-AK-1983 — the run names the stopped step ($signal)" "$(said '~ stopped, no mark: node')" yes
    rm -rf "$t"
done

t="$(tree_of "bash $BOX/orphan.sh $BOX # heavy orphan")"
stopped "$t" INT 1
report "SC-AK-1983 — INT ends the run with its own code" "$code:$(said 'stopped by INT')" 130:yes
report "SC-AK-1983 — a child that outlived its parent in the group of the step is gone" "$(alive orphan)" gone
rm -rf "$t"

t="$(tree_of "node $BOX/keeper.mjs $BOX # heavy keeper")"
stopped "$t" TERM 1
report "SC-AK-1983 — a deaf child of a step that died at once is gone" "$code:$(alive keeper)" 143:gone
report "SC-AK-1983 — a child that outlived its parent in that group is gone too" "$(alive lost)" gone
rm -rf "$t"

t="$(tree_of "node $BOX/loner.mjs $BOX # heavy loner")"
stopped "$t" TERM 2
report "SC-AK-1983 — a child whose parent died at once hears TERM and cleans up" \
    "$code:$([ -e "$BOX/cleaned-loner" ] && echo cleaned || echo killed):$(alive loner)" 143:cleaned:gone
rm -rf "$t"

t="$(tree_of "bash $BOX/deaf.sh $BOX # heavy deaf")"
stopped "$t" TERM 1
report "SC-AK-1983 — a step deaf to both signals is gone" "$code:$(alive deaf)" 143:gone
PATH="$BOX/no-ps:$PATH" stopped "$t" TERM 1
report "SC-AK-1983 — and it is gone with no table of processes too" "$code:$(alive deaf)" 143:gone
rm -rf "$t"

t="$(tree_of "bash $BOX/polite.sh $BOX; touch $BOX/late-polite # heavy polite")"
stopped "$t" TERM 2
report "SC-AK-1983 — a step of two commands does not go on to the second one" \
    "$code:$(alive polite):$([ -e "$BOX/late-polite" ] && echo started || echo held)" 143:gone:held
stopped "$t" HUP 2
report "SC-AK-1983 — HUP ends the run and its step" "$code:$(alive polite)" 129:gone
rm -rf "$t"

t="$(tree_of "bash $BOX/half.sh $BOX # heavy half")"
PATH="$BOX/no-ps:$PATH" stopped "$t" TERM 1
report "SC-AK-1983 — with no table of processes the group of the step still ends" \
    "$(alive half):$code:$([ "$took" -lt 10 ] && echo soon || echo "late ($took)")" gone:143:soon
rm -f "$BOX/asked"
PATH="$BOX/torn-ps:$PATH" stopped "$t" TERM 2
report "SC-AK-1983 — a table of processes that failed once does not stop the stop" \
    "$([ "$(wc -l <"$BOX/asked")" -ge 3 ] && echo asked):$(alive half):$code:$([ "$took" -lt 10 ] && echo soon || echo "late ($took)")" asked:gone:143:soon
rm -rf "$t"

suite_result "the run ahead and its copy"
