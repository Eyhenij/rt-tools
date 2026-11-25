#!/usr/bin/env bash
# Where the time of agent sessions goes: the command reads short journals made here and its numbers
# are compared. The real journals lie outside the tree and hold what people wrote, so a scenario reads
# only its own.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the time of a session by step"

# The days of the period are the days of the machine.
export TZ=UTC

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# A journal from lines of `HH:MM:SS|kind|payload`; the payload is free text, empty where not needed.
# Kinds: ask — a message of the owner, say — an answer, call:<tool>:<id>:<command>, res:<id>,
# res:<id>:<agent> — the launch of an agent, stop — the Stop hooks, end:<id> — the notice about a
# background call, att:<id> — the same as an attachment, amsg:<agent> — a report of an agent, back — a
# hand-back, fg:<id> — the result of a foreground agent. The time may name the day: `22T01:00:00`. A line `branch|<name>` sets the branch of the lines below it; `\n` in a command is a newline.
journal() {
    node - "$WORK/$1.jsonl" <<'JS' 3>/dev/null
const { readFileSync, writeFileSync } = require('node:fs');
const spec = process.env.SPEC.trim().split('\n');
let branch = process.env.BRANCH || 'main';
const out = spec.flatMap((line, i) => {
    const [time, kind, ...rest] = line.trim().split('|');
    if (time === 'branch') {
        branch = kind;
        return [];
    }
    const base = { uuid: (process.env.MARK || 'u') + i, timestamp: '2026-11-' + (time.includes('T') ? time : '21T' + time) + '.000Z', gitBranch: branch };
    const text = rest.join('|').replace(/\\n/g, '\n');
    if (kind === 'raw') return text;
    if (kind === 'ask') return JSON.stringify({ ...base, type: 'user', origin: { kind: 'human' }, message: { content: 'секрет владельца' } });
    if (kind === 'say') return JSON.stringify({ ...base, type: 'assistant', message: { content: [{ type: 'text', text: 'ответ' }] } });
    if (kind.startsWith('call:')) {
        const [, name, id, ...cmd] = kind.split(':');
        const role = new Map((process.env.ROLES || '').split(' ').map((pair) => pair.split('='))).get(id);
        return JSON.stringify({ ...base, type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input: { command: cmd.join(':') || text, subagent_type: role } }] } });
    }
    if (kind.startsWith('res:')) {
        const [, id, agent] = kind.split(':');
        const said = [{ type: 'text', text: 'Async agent launched\nagentId: ' + (agent || 'none') }];
        return JSON.stringify({ ...base, type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, content: said }] } });
    }
    if (kind.startsWith('fg:')) return JSON.stringify({ ...base, type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: kind.slice(3), content: 'отчёт' }] } });
    if (kind === 'stop') return JSON.stringify({ ...base, type: 'system', subtype: 'stop_hook_summary' });
    if (kind === 'side') return JSON.stringify({ ...base, isSidechain: true, type: 'system', subtype: 'stop_hook_summary' });
    if (kind.startsWith('att:')) return JSON.stringify({ ...base, type: 'attachment', attachment: { prompt: '<tool-use-id>' + kind.slice(4) + '</tool-use-id>' } });
    if (kind.startsWith('amsg:')) return JSON.stringify({ ...base, type: 'user', origin: { kind: 'peer' }, message: { content: '<agent-message from="' + kind.slice(5) + '">' } });
    if (kind === 'back') return JSON.stringify({ ...base, type: 'user', origin: { kind: 'peer' }, message: { content: 'Subagent hand-back' } });
    if (kind.startsWith('end:')) return JSON.stringify({ ...base, type: 'user', origin: { kind: 'task-notification' }, message: { content: '<tool-use-id>' + kind.slice(4) + '</tool-use-id>' } });
    throw new Error('kind ' + kind);
});
writeFileSync(process.argv[2], out.join('\n') + '\n');
JS
}

# run <journal>: the JSON of the command, and one field of it by a path in node.
run() { node "$TOOLS/session-time.mjs" --json --by-branch "$@" 2>/dev/null; }
field() { node -e 'const j = JSON.parse(require("fs").readFileSync(0)); console.log(String(eval("j." + process.argv[1])))' "$1"; }

# 1. Each category by the event that ends the gap: 10 minutes each.
SPEC='00:00:00|ask
00:10:00|say
00:20:00|call:Edit:a:
00:30:00|res:a
00:40:00|call:Bash:b:npx nx test kit
00:50:00|res:b
01:00:00|call:Bash:c:bash .claude/hooks/git-guard-push-ahead.sh
01:10:00|res:c
01:20:00|call:Bash:d:npm run task:move -- 1 in-progress
01:30:00|res:d
01:40:00|stop
01:50:00|ask' journal base
OUT="$(run --file "$WORK/base.jsonl")"
report 'the model is counted to its answer' "$(printf '%s' "$OUT" | field 'categories.model.hours')" 0.83
report 'a tool result goes to tools' "$(printf '%s' "$OUT" | field 'categories.tools.hours')" 0.17
report 'a test run goes to checks' "$(printf '%s' "$OUT" | field 'categories.checks.hours')" 0.17
report 'the push set goes to its own' "$(printf '%s' "$OUT" | field 'categories.pushset.hours')" 0.17
report 'the board goes to its own' "$(printf '%s' "$OUT" | field 'categories.board.hours')" 0.17
report 'the Stop hooks go to their own' "$(printf '%s' "$OUT" | field 'categories.stop.hours')" 0.17
report 'a message of the owner is their waiting' "$(printf '%s' "$OUT" | field 'ownerHours')" 0.17
report 'the active time leaves the owner out' "$(printf '%s' "$OUT" | field 'activeHours')" 1.67
report 'a share is taken of the active time' "$(printf '%s' "$OUT" | field 'categories.model.share')" 0.5

# The category of one call by the hour its result took: the tool, the command, the category.
kind_is() {
    SPEC="00:00:00|call:$1:k:|$2
01:00:00|res:k" journal kind
    report "$3: $1 $2" "$(run --file "$WORK/kind.jsonl" | field 'ownerHours === 1 ? "owner" : Object.entries(j.categories).find((e) => e[1].hours === 1)[0]')" "$3"
}
kind_is Bash 'git push -u origin x' pushset
kind_is Bash "git -c credential.helper= -c credential.helper='!gh auth git-credential' push" pushset
kind_is Bash 'until ! pgrep -f git-guard-push-ahead.sh; do sleep 5; done' pushset
kind_is Bash 'cat .claude/hooks/git-guard-push-ahead.sh' tools
kind_is Bash 'git commit -m "before git push"' tools
kind_is Bash "cat > note <<'E'\\ngit push\\nE" tools
kind_is Bash 'cd projects/agent-kit && ls' tools
kind_is Bash 'npx playwright test' checks
kind_is Bash 'node tools/ngdoctor.mjs --check' checks
kind_is Bash 'bash tools/tests/run.sh' checks
kind_is Bash 'pnpm run lint' checks
kind_is Bash 'node tools/check-dupes.mjs' checks
kind_is Bash 'gh pr list' board
kind_is Bash 'gh run watch 1' ci
kind_is Agent '' agents
kind_is Workflow '' agents
kind_is ExitPlanMode '' owner

# What counts as a run of the set and as a call that opens a PR: a file of one command a line.
marks_is() {
    node --input-type=module -e "
        import { $1 } from '$TOOLS/session-time-model.mjs';
        import { readFileSync } from 'node:fs';
        const lines = readFileSync(0, 'utf8').trim().split('\n').map((line) => line.replace(/\\\\n/g, '\n'));
        console.log(lines.filter((line) => $1(line) !== $2).join(' ;; ') || 'all');
    "
}
report 'the forms of a run of the set' "$(marks_is runsSet true <<'E'
bash .claude/hooks/git-guard-push-ahead.sh > log 2>&1
cd x && TMPDIR=/t /bin/bash -x ".claude/hooks/git-guard-push-ahead.sh"
cat > b <<'X' && bash .claude/hooks/git-guard-push-ahead.sh\ntext\nX
E
)" all
report 'what is no run of the set' "$(marks_is runsSet false <<'E'
cat .claude/hooks/git-guard-push-ahead.sh
bash -n .claude/hooks/git-guard-push-ahead.sh
bash tests/git-guard-push-ahead.sh.test.sh
git commit -am "bash git-guard-push-ahead.sh"
ls # bash git-guard-push-ahead.sh
E
)" all
report 'the forms of a call that opens a PR' "$(marks_is opensPr true <<'E'
test -s t && GH_TOKEN="$(cat t)" /opt/homebrew/bin/gh pr create --title x
gh -R o/r pr new
$GH pr create --draft
cat <<'X' | gh pr create --body-file -\ntext\nX
E
)" all
report 'what opens no PR' "$(marks_is opensPr false <<'E'
gh pr view 1
gh pr create --help
echo gh pr create
gh issue create --body "then gh pr create"
git commit -qm "run gh pr create"
cat > n <<'X-1'\ngh pr create\nX-1
E
)" all

# 2. A menu is the waiting of the owner, not a tool.
SPEC='00:00:00|ask
00:30:00|call:AskUserQuestion:q:
02:30:00|res:q' journal menu
report 'an open menu is the waiting of the owner' "$(run --file "$WORK/menu.jsonl" | field 'ownerHours')" 2

# 3. The background: what ran during the gap names the wait; a hand-back is always a subagent.
SPEC='00:00:00|ask
00:01:00|call:Agent:g:
00:01:00|res:g
00:02:00|call:Bash:p:bash .claude/hooks/git-guard-push-ahead.sh
00:02:00|res:p
01:02:00|end:p
01:03:00|say
02:03:00|end:g
02:04:00|say
02:34:00|back' journal bg
OUT="$(run --file "$WORK/bg.jsonl")"
report 'a subagent running names the wait over the set' "$(printf '%s' "$OUT" | field 'categories.agents.hours')" 2.5
SPEC='00:00:00|ask
00:02:00|call:Bash:p:bash .claude/hooks/git-guard-push-ahead.sh
00:02:00|res:p
01:02:00|end:p' journal set
report 'the set alone is the wait for it' "$(run --file "$WORK/set.jsonl" | field 'categories.pushset.hours')" 1
SPEC='00:00:00|ask
00:02:00|call:Bash:h:gh run watch 1
00:02:00|res:h
01:02:00|end:h' journal ci
report 'the host client is the wait for the pipeline' "$(run --file "$WORK/ci.jsonl" | field 'categories.ci.hours')" 1

SPEC='00:00:00|ask
00:02:00|call:Bash:n:npx nx test kit
00:02:00|res:n
01:02:00|end:n' journal wait
report 'another command of the background is a check' "$(run --file "$WORK/wait.jsonl" | field 'categories.checks.hours')" 1
SPEC='00:00:00|call:Agent:g:
00:00:00|res:g
00:01:00|end:g
00:02:00|call:Bash:p:bash .claude/hooks/git-guard-push-ahead.sh
00:02:00|res:p
01:02:00|end:p' journal over
report 'an agent that ended names no later wait' "$(run --file "$WORK/over.jsonl" | field 'categories.pushset.hours')" 1

# 4. A repeated uuid is read once, a broken line is counted, a record of a subagent is not an event.
{ cat "$WORK/menu.jsonl"; cat "$WORK/menu.jsonl"; } > "$WORK/twice.jsonl"
report 'a record with a known uuid is skipped' "$(run --file "$WORK/twice.jsonl" | field 'ownerHours')" 2
cp "$WORK/menu.jsonl" "$WORK/copy.jsonl"
report 'a second journal with the same records adds nothing' "$(run --file "$WORK/menu.jsonl" --file "$WORK/copy.jsonl" | field 'ownerHours')" 2
SPEC='00:00:00|ask
00:10:00|raw|{not json
00:15:00|raw|null
00:20:00|side
01:00:00|say' journal broken
OUT="$(run --file "$WORK/broken.jsonl" --file "$WORK/menu.jsonl")"
report 'a line that is not a record is counted' "$(printf '%s' "$OUT" | field 'broken')" 2
report 'a record of a subagent splits no gap' "$(run --file "$WORK/broken.jsonl" | field 'categories.model.hours')" 1
report 'the lines are named in the text' "$(node "$TOOLS/session-time.mjs" --file "$WORK/broken.jsonl" | grep -c 'Строк без разбора: 2')" 1
SPEC='00:00:00|ask
01:00:00|say
00:30:00|stop' journal mixed
report 'the records are taken in the order of time' "$(run --file "$WORK/mixed.jsonl" | field 'categories.stop.hours')" 0.5
MARK=o SPEC='10:00:00|ask
11:00:00|say
12:00:00|say
13:00:00|say' journal resumed
head -2 "$WORK/resumed.jsonl" > "$WORK/origin.jsonl"
report 'a resumed journal is counted whole in either order' \
    "$(run --file "$WORK/origin.jsonl" --file "$WORK/resumed.jsonl" | field 'activeHours'):$(run --file "$WORK/resumed.jsonl" --file "$WORK/origin.jsonl" | field 'activeHours')" 3:3

# 5. The period, and the branches.
SPEC='00:00:00|ask
01:00:00|say' journal period
report 'the last day of the period is whole' "$(run --file "$WORK/period.jsonl" --until 2026-11-21 | field 'activeHours')" 1
MARK=d SPEC='22:00:00|ask
22T01:00:00|say
22T02:00:00|say' journal night
report 'the days add up to the whole' \
    "$(run --file "$WORK/period.jsonl" --file "$WORK/night.jsonl" --until 2026-11-21 | field 'activeHours'):$(run --file "$WORK/period.jsonl" --file "$WORK/night.jsonl" --since 2026-11-22 | field 'activeHours')" 1:4
BRANCH='RT-1-x' SPEC='00:00:00|ask
01:00:00|say' journal branch
report 'a branch holds its own hours' "$(run --file "$WORK/branch.jsonl" | field 'branches["RT-1-x"].activeHours')" 1

# 6. Two journals are two clocks: the gap between them is nobody's time.
BRANCH=main SPEC='05:00:00|ask
06:00:00|say' journal later
sed -i.bak 's/"u\([0-9]*\)"/"w\1"/g' "$WORK/later.jsonl"
report 'the gap between two journals is not counted' "$(run --file "$WORK/period.jsonl" --file "$WORK/later.jsonl" | field 'activeHours')" 2

# 7. The steps of the task flow and the mean of the named branches. The reading of the plan holds no
# `qa-engineer`, so it is not a round; two rounds, the set and a PR call make a full course.
medians() { field 'steps.branches + ":" + Object.values(j.steps.medians).join(" ")'; }
COURSE='00:00:00|ask
00:05:00|call:Agent:s1:
00:05:00|res:s1
00:09:00|end:s1
00:30:00|call:Agent:q1:
00:30:00|res:q1
00:38:00|end:q1
00:43:00|call:Agent:q2:
00:43:00|res:q2
00:52:00|end:q2
00:55:00|call:Bash:ps:bash .claude/hooks/git-guard-push-ahead.sh
00:55:00|res:ps
01:10:00|call:Bash:pr:gh pr create --title x
01:10:00|res:pr
01:13:00|say'
export BRANCH='RT-2-step' ROLES='s1=goal-critic s2=goal-critic t1=product-strategist q1=qa-engineer q2=qa-engineer r1=qa-engineer r2=qa-engineer'
SPEC="$COURSE" journal steps
OUT="$(run --steps --file "$WORK/steps.jsonl")"
report 'the steps of a full course' "$(printf '%s' "$OUT" | medians)" '1:5 4 21 8 5 9 3 15 3'
report 'the categories of a step' "$(printf '%s' "$OUT" | field 'steps.kinds.round1.agents')" 8
report 'every launch has its end' "$(printf '%s' "$OUT" | field 'steps.open')" 0
SPEC="$COURSE
22T00:30:00|say" journal late
report 'a step is of the period alone' "$(run --steps --since 2026-11-22 --file "$WORK/late.jsonl" | field 'steps.branches')" 0
node "$TOOLS/session-time.mjs" --branches RT-2 --since 2026-11-22 --file "$WORK/late.jsonl" > "$WORK/out" 2>&1
report 'a task cut by the period is refused' "$?:$(grep -c 'cuts RT-2' "$WORK/out")" 1:1
report 'the text holds the steps and what was left out' \
    "$(node "$TOOLS/session-time.mjs" --steps --file "$WORK/steps.jsonl" | grep -cE 'Код и живая проверка +21|Вне полного хода: веток 0')" 2
OUT="$(run --steps --file "$WORK/branch.jsonl")"
report 'a branch without rounds has no row of steps' "$(printf '%s' "$OUT" | field 'steps.branches')" 0
report 'its hours are named as left out' "$(printf '%s' "$OUT" | field 'steps.left.branches + ":" + j.steps.left.hours')" 1:1
report 'no full course is said in words' \
    "$(node "$TOOLS/session-time.mjs" --steps --file "$WORK/branch.jsonl" | grep -cE 'Веток полного хода нет|без двух кругов 1')" 2
SPEC="${COURSE/Bash:ps:bash/Bash:ps:cat}" journal noset
report 'a branch without the set lacks it' "$(run --steps --file "$WORK/noset.jsonl" | field 'steps.branches + ":" + j.steps.left.lacks.set')" 0:1
SPEC="${COURSE/gh pr create/gh pr view}" journal nopr
report 'a branch without a PR call lacks it' "$(run --steps --file "$WORK/nopr.jsonl" | field 'steps.branches + ":" + j.steps.left.lacks.pr')" 0:1
SPEC="${COURSE/Agent:s1:/Edit:s1:}" journal unread
report 'with no reading of the plan all before round one is the code' "$(run --steps --file "$WORK/unread.jsonl" | medians)" '1:0 0 30 8 5 9 3 15 3'
SPEC="${COURSE/00:30:00|call/00:12:00|call:Agent:t1:
00:12:00|res:t1
00:20:00|end:t1
00:30:00|call}" journal reread
report 'a second reading of the plan is of the reading' "$(run --steps --file "$WORK/reread.jsonl" | medians)" '1:5 15 10 8 5 9 3 15 3'
SPEC="${COURSE/00:38:00|end:q1/00:32:00|call:Agent:s2:
00:32:00|res:s2
00:36:00|end:q1
00:38:00|end:s2}" journal group
report 'a round ends with the last report of its roles' "$(run --steps --file "$WORK/group.jsonl" | medians)" '1:5 4 21 8 5 9 3 15 3'
SPEC="${COURSE/00:38:00|end:q1/00:38:00|fg:q1}"
SPEC="${SPEC/00:30:00|res:q1
/}" journal front
report 'the result of a foreground agent is its end' "$(run --steps --file "$WORK/front.jsonl" | field 'steps.open + ":" + Object.values(j.steps.medians).join(" ")')" '0:5 4 21 8 5 9 3 15 3'
SPEC="${COURSE/00:30:00|call/00:15:00|say
00:20:00|ask
00:30:00|call}" journal waited
report 'the waiting for the owner is in no step' "$(run --steps --file "$WORK/waited.jsonl" | medians)" '1:5 4 16 8 5 9 3 15 3'
SPEC="${COURSE/01:10:00|res:pr/01:12:00|res:pr}" journal slow
report 'the delivery ends with the result of the PR call' "$(run --steps --file "$WORK/slow.jsonl" | medians)" '1:5 4 21 8 5 9 3 17 1'

# The work on another branch in the middle of a step is not a minute of it, and the steps add up to the
# active time of their branch.
SPEC="${COURSE/00:30:00|call/00:12:00|say
branch|RT-3-other
00:22:00|say
branch|RT-2-step
00:30:00|call}" journal two
OUT="$(run --steps --file "$WORK/two.jsonl")"
report 'another branch is out of a step' "$(printf '%s' "$OUT" | medians)" '1:5 4 11 8 5 9 3 15 3'
report 'the steps add up to the active time of the branch' "$(printf '%s' "$OUT" | field 'steps.perBranch["RT-2-step"] + ":" + Math.round(j.branches["RT-2-step"].activeHours * 60)')" 63:63
report '--branches picks the branches of the steps' "$(run --steps --branches RT-3 --file "$WORK/two.jsonl" | field 'steps.branches')" 0

# The set that ran before the end of round two, a mention of it and of a PR call move no bound.
SPEC="$COURSE
01:14:00|call:Bash:m:|echo \"gh pr create\"
01:14:00|res:m"
SPEC="${SPEC/00:55:00|call/00:20:00|call:Bash:e:bash .claude/hooks/git-guard-push-ahead.sh
00:20:00|res:e
00:53:00|call:Bash:c:cat .claude/hooks/git-guard-push-ahead.sh
00:53:00|res:c
00:55:00|call}" journal marks
report 'a mention and an early set move no bound' "$(run --steps --file "$WORK/marks.jsonl" | medians)" '1:5 4 21 8 5 9 3 15 4'
SPEC="${COURSE/00:55:00|call:Bash:ps:/00:20:00|call:Bash:ps:}" journal early
report 'a set only before round two leaves no step below zero' "$(run --steps --file "$WORK/early.jsonl" | medians)" '1:5 4 21 8 5 9 0 18 3'

# A task handed over to another session is one branch; the gap between the two is nobody's time.
head -7 "$WORK/steps.jsonl" > "$WORK/first.jsonl"
tail -n +8 "$WORK/steps.jsonl" > "$WORK/second.jsonl"
report 'a branch of two journals is one row' "$(run --steps --file "$WORK/first.jsonl" --file "$WORK/second.jsonl" | medians)" '1:5 4 21 8 0 9 3 15 3'

# The other forms of the end of an agent, and a launch with no end at all.
SPEC="${COURSE/00:09:00|end:s1/00:09:00|att:s1
00:09:00|say}"
SPEC="${SPEC/res:q1/res:q1:a77}"
SPEC="${SPEC/00:38:00|end:q1/00:38:00|amsg:a77}" journal ends
OUT="$(run --steps --file "$WORK/ends.jsonl")"
report 'an attachment and a message end an agent' "$(printf '%s' "$OUT" | medians):$(printf '%s' "$OUT" | field 'steps.open')" '1:5 4 21 8 5 9 3 15 3:0'
SPEC="${COURSE/00:38:00|end:q1/00:38:00|say}" journal open
OUT="$(run --steps --file "$WORK/open.jsonl")"
report 'a launch with no end is counted' "$(printf '%s' "$OUT" | field 'steps.open')" 1

# The middle of two branches, and the mean of the named ones.
OTHER="${COURSE//s1/t1}"
OTHER="${OTHER//q1/r1}"
OTHER="${OTHER//q2/r2}"
OTHER="${OTHER//:ps/:zs}"
OTHER="${OTHER//:pr/:zr}"
OTHER="${OTHER//00:05:00/00:08:00}"
MARK=z BRANCH='RT-22-step' SPEC="$OTHER" journal next
report 'the median of two is the middle between them' "$(run --steps --file "$WORK/steps.jsonl" --file "$WORK/next.jsonl" | field 'steps.branches + ":" + j.steps.medians.plan')" 2:7
report 'the mean of a named task' "$(run --branches RT-2 --file "$WORK/steps.jsonl" --file "$WORK/next.jsonl" | field 'means.branches + ":" + j.means.activeMinutes')" '1:73'
report 'a repeated key counts once' "$(run --branches RT-2,RT-2,RT-2-step --file "$WORK/steps.jsonl" | field 'means.branches')" 1
MARK=y BRANCH='RT-1-y' SPEC='00:00:00|ask
02:00:00|say' journal more
report 'a task is all the branches of its key' "$(run --branches RT-1 --file "$WORK/branch.jsonl" --file "$WORK/more.jsonl" | field 'means.activeMinutes')" 180
report 'the mean is over the tasks' "$(run --branches RT-1,RT-2 --file "$WORK/more.jsonl" --file "$WORK/steps.jsonl" | field 'means.branches + ":" + j.means.activeMinutes')" 2:96.5
report 'the mean is printed' "$(node "$TOOLS/session-time.mjs" --branches RT-1 --file "$WORK/more.jsonl" | grep -c 'В среднем на задачу (1): 120 мин')" 1
node "$TOOLS/session-time.mjs" --branches RT-2,RT-77 --file "$WORK/steps.jsonl" > "$WORK/out" 2>&1
report 'a branch that is not there is refused' "$?:$(grep -c 'RT-77' "$WORK/out")" 1:1
unset BRANCH ROLES

# 8. No text of people reaches the output, and the refusals name their reason.
for form in '--by-branch' '--json --by-branch --steps --branches RT-2' '--steps --branches RT-2'; do
    OUT="$(eval "node \"\$TOOLS/session-time.mjs\" $form --file \"\$WORK/base.jsonl\" --file \"\$WORK/next.jsonl\" --file \"\$WORK/steps.jsonl\"" 2>&1)"
    case "$OUT" in *секрет* | *push-ahead* | *'nx test'* | *'gh pr'* | *отчёт*) leak=yes ;; *) leak=no ;; esac
    report "neither a message nor a command is printed: $form" "$leak:${#OUT}" "no:${#OUT}"
done
node "$TOOLS/session-time.mjs" --file "$WORK/none.jsonl" > "$WORK/out" 2>&1
report 'a journal that is not there is refused' "$?:$(grep -c 'no such journal' "$WORK/out")" 1:1
(cd "$WORK" && HOME="$WORK" node "$TOOLS/session-time.mjs") > "$WORK/out" 2>&1
report 'no journal at all is refused' "$?:$(grep -c 'no journal found' "$WORK/out")" 1:1
refused() {
    node "$TOOLS/session-time.mjs" "${@:3}" > "$WORK/out" 2>&1
    report "$1" "$?:$(grep -c "^session-time: .*$2" "$WORK/out")" 1:1
}
refused 'a date of another form is refused' 'incomplete argument' --since yesterday
refused 'a day the calendar does not hold is refused' 'incomplete argument' --since 2026-02-31
refused 'a month that is not there is refused' 'incomplete argument' --since 2026-13-45
refused 'a period that ends before it begins is refused' 'before it begins' --since 2026-11-24 --until 2026-11-21
refused 'a flag in place of a value is refused' 'incomplete argument' --branches --json
refused 'an empty list of branches is refused' 'incomplete argument' --branches ,
refused 'a directory is no journal' 'not a journal file' --file "$WORK"
: > "$WORK/empty.jsonl"
refused 'a journal with no event is refused' 'no time' --file "$WORK/empty.jsonl"
refused 'a period with no time is refused' 'no time' --since 2026-11-23 --file "$WORK/period.jsonl"
report 'a bare double dash is passed over' "$(run -- --file "$WORK/period.jsonl" | field 'activeHours')" 1
mkdir -p "$WORK/.claude/projects/$(cd "$WORK" && node -p 'process.cwd().replace(/[^a-zA-Z0-9]/g, "-")')"
cp "$WORK/period.jsonl" "$WORK/.claude/projects/"*/
report 'the journals of the working copy are found' "$(cd "$WORK" && HOME="$WORK" run | field 'activeHours')" 1

suite_result 'session-time'
