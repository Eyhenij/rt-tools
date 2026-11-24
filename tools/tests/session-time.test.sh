#!/usr/bin/env bash
# Where the time of agent sessions goes: the command reads short journals made here and its numbers
# are compared. The real journals lie outside the tree and hold what people wrote, so a scenario reads
# only its own.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the time of a session by step"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# A journal from lines of `HH:MM:SS|kind|payload`; the payload is free text, empty where not needed.
# Kinds: ask — a message of the owner, say — an answer, call:<tool>:<id>:<command>, res:<id>,
# stop — the Stop hooks, end:<id> — the notice about a background call, back — a hand-back.
journal() {
    node - "$WORK/$1.jsonl" <<'JS' 3>/dev/null
const { readFileSync, writeFileSync } = require('node:fs');
const spec = process.env.SPEC.trim().split('\n');
const out = spec.map((line, i) => {
    const [time, kind, ...rest] = line.trim().split('|');
    const base = { uuid: 'u' + i, timestamp: '2026-11-21T' + time + '.000Z', gitBranch: process.env.BRANCH || 'main' };
    const text = rest.join('|');
    if (kind === 'raw') return text;
    if (kind === 'ask') return JSON.stringify({ ...base, type: 'user', origin: { kind: 'human' }, message: { content: 'секрет владельца' } });
    if (kind === 'say') return JSON.stringify({ ...base, type: 'assistant', message: { content: [{ type: 'text', text: 'ответ' }] } });
    if (kind.startsWith('call:')) {
        const [, name, id, ...cmd] = kind.split(':');
        const role = new Map((process.env.ROLES || '').split(' ').map((pair) => pair.split('='))).get(id);
        return JSON.stringify({ ...base, type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input: { command: cmd.join(':') || text, subagent_type: role } }] } });
    }
    if (kind.startsWith('res:')) return JSON.stringify({ ...base, type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: kind.slice(4) }] } });
    if (kind === 'stop') return JSON.stringify({ ...base, type: 'system', subtype: 'stop_hook_summary' });
    if (kind === 'side') return JSON.stringify({ ...base, isSidechain: true, type: 'assistant', message: { content: [] } });
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

# 4. A repeated uuid is read once, a broken line is counted, a record of a subagent is not an event.
{ cat "$WORK/menu.jsonl"; cat "$WORK/menu.jsonl"; } > "$WORK/twice.jsonl"
report 'a record with a known uuid is skipped' "$(run --file "$WORK/twice.jsonl" | field 'ownerHours')" 2
cp "$WORK/menu.jsonl" "$WORK/copy.jsonl"
report 'a second journal with the same records adds nothing' "$(run --file "$WORK/menu.jsonl" --file "$WORK/copy.jsonl" | field 'ownerHours')" 2
SPEC='00:00:00|ask
00:10:00|raw|{not json
00:20:00|side
01:00:00|say' journal broken
OUT="$(run --file "$WORK/broken.jsonl")"
report 'a line that is not JSON is counted' "$(printf '%s' "$OUT" | field 'broken')" 1
report 'a record of a subagent splits no gap' "$(printf '%s' "$OUT" | field 'categories.model.hours')" 1

# 5. The period, and the branches.
SPEC='00:00:00|ask
01:00:00|say' journal period
report 'a day outside the period leaves no time' "$(run --file "$WORK/period.jsonl" --since 2026-11-22 | field 'activeHours')" 0
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
BRANCH='RT-2-step' SPEC='00:00:00|ask
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
01:13:00|say' ROLES='s1=product-strategist q1=qa-engineer q2=qa-engineer' journal steps
OUT="$(run --steps --file "$WORK/steps.jsonl")"
report 'the steps of a full course' "$(printf '%s' "$OUT" | field 'steps.branches + ":" + Object.values(j.steps.medians).join(" ")')" '1:5 4 21 8 5 9 3 15 3'
report 'a branch without rounds has no row of steps' "$(run --steps --file "$WORK/branch.jsonl" | field 'steps.branches')" 0
report 'the mean of a named branch' "$(run --branches RT-2 --file "$WORK/steps.jsonl" | field 'means.branches + ":" + j.means.activeMinutes')" '1:73.2'
node "$TOOLS/session-time.mjs" --branches RT-2,RT-77 --file "$WORK/steps.jsonl" > "$WORK/out" 2>&1
report 'a branch that is not there is refused' "$?:$(grep -c 'RT-77' "$WORK/out")" 1:1

# 8. No text of people reaches the output, and the refusals name their reason.
OUT="$(node "$TOOLS/session-time.mjs" --by-branch --file "$WORK/base.jsonl" 2>&1)"
case "$OUT" in *секрет* | *push-ahead* | *'nx test'*) leak=yes ;; *) leak=no ;; esac
report 'neither a message nor a command is printed' "$leak" no
node "$TOOLS/session-time.mjs" --file "$WORK/none.jsonl" > "$WORK/out" 2>&1
report 'a journal that is not there is refused' "$?:$(grep -c 'no such journal' "$WORK/out")" 1:1
(cd "$WORK" && HOME="$WORK" node "$TOOLS/session-time.mjs") > "$WORK/out" 2>&1
report 'no journal at all is refused' "$?:$(grep -c 'no journal found' "$WORK/out")" 1:1
node "$TOOLS/session-time.mjs" --since yesterday > "$WORK/out" 2>&1
report 'a date of another form is refused' "$?:$(grep -c 'incomplete argument' "$WORK/out")" 1:1

suite_result 'session-time'
