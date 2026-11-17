# Plan

**Task:** RT-3277 · **Branch:** RT-3277-checks-real-record
**Behaviour:** unchanged — the work adds suites on saved real data and a check that demands them; no
application code is touched.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** every package check is tested only on records and hosting answers invented by the suite.
  The record is read by the facts in `facts.sh` and by the engine of the course of work — the owner's
  approval and the role calls in `flow-plan.mjs`, the reminders in `owner-nudges.mjs`. The hosting is
  read through one client, `board-gh.github.mjs`, by the work queue audit, the epic table, task
  creation and the delivery hooks. 18 suites build records inline, 13 fake the host by a `gh` stub
  that answers whatever the test wrote and never asks which token came. On 13.11.2026 the check of
  the epic end was green on its suite and refused the owner's consent on the real record; the fix was
  green again and let eight of twenty-three foreign answers pass. An audit edit green on its suite
  failed on the real host: the token had no right to read pull requests.
- **This task reaches:** the readers of the record are asked on a cut of the session of 13.11.2026
  at the moments that failed then, with the answers a person reads off the record. The readers of
  the hosting run on answers recorded under the machine token, refusals of rights included, and a
  stub that is asked with the wrong token answers as the host does. The hooks-kind suite refuses a
  reader with no run on saved data.
- **Sign:** the moments of 13.11 — the refused consent and the foreign answers — answer right on the
  cut; the audit case «a pull request read with the token» is red on the stub as it was on the host;
  the hooks-kind suite names a fixture reader without a run, and prints every real reader as run.
- **Milestone G of the epic:** fewer than five refusals per hundred commands and no dead end. A
  check that refuses on real data while green on its suite is a refusal the agent meets and no suite
  counted; this task turns such a check red before it is laid out. The rate itself is RT-3270.
- **Metric:** readers of the record or the hosting with a run on saved data, printed by the
  hooks-kind suite as `real data: N of M readers` — 0 of M now, M of M after.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/agent-kit/board/`, `docs/specs/agent-kit/hooks/` (the hooks-kind demand), a new subdomain for the saved real data if no spec takes it |
| Laws  | none |
| Rules | `.claude/skills/testing/` companion — the place of the saved data |
| Code  | `projects/agent-kit/tests/` (new suites, `lib-board.sh`, `hooks-kind.test.sh`), `projects/agent-kit/tests/fixtures/real-record/`, `projects/agent-kit/tests/fixtures/real-host/`, the cut and record scripts in `projects/agent-kit/tests/real-data/` |

## What counts as done

- The cut of session `f2c03ded` of 13.11.2026 lies in the fixtures: it keeps what the readers read —
  roles, times, tool names, `subagent_type`, menu answers verbatim, exit codes, the refusal texts of
  the hooks — and replaces the rest of the text; the script that cut it lies next to it.
- The readers of the record — the facts of `facts.sh`, `flow-plan.mjs`, `owner-nudges.mjs` — are
  asked on the cut at named moments, among them the refused consent and the foreign answers of 13.11.
- The hosting answers are recorded under the machine token with the token named on each, the login
  of the token among them, a refusal of rights among them; the stub answers a request with another
  token by an error; every hosting reader runs on them.
- The hooks-kind suite finds the readers of the record and the hosting, demands that a suite run
  each of them on a file of the saved data, and refuses a fixture reader without such a run.
- All package suites are green on a full run.

## Stages

All checks run from the tree root.

### 1. The cut of the real record

- **Steps:**
    1. A script cuts a session record into what the readers read and replaces the rest of the text; its self-test cuts a sample and compares the owner's approval read on the cut with the one read on the sample
       Check: `node projects/agent-kit/tests/real-data/cut-record.mjs --self-test | tail -1` → `cut-record: self-test ok`
    2. The cut of 13.11.2026 lies in the fixtures, carries the refusals of the epic end, and holds no home path and no mail address
       Check: `f=projects/agent-kit/tests/fixtures/real-record/2026-11-13.jsonl; test -s $f && test $(grep -c 'epic-stop' $f) -ge 1 && grep -c -E "$HOME|@[a-z0-9-]+\.(com|ru|org)" $f` → `0`
- **Readiness sign:** the cut exists, keeps the moments of 13.11 and carries nothing personal.
- **Verified by:** the two checks.

### 2. The readers of the record on the cut

- **Steps:**
    1. A suite asks the facts of `facts.sh`, `flow-plan.mjs` and `owner-nudges.mjs` on the cut; each case names its moment of the record and the answer a person read there
       Check: `grep -cE 'rt_fact_|planApproval|menuAnswers|roleCalls|owner-nudges' projects/agent-kit/tests/real-record.test.sh` → >= 12
    2. The moments of 13.11 stand among the cases: the consent refused then and the foreign answers let through then
       Check: `grep -cE 'SC-AK-[0-9]+ .*(consent|foreign answer)' projects/agent-kit/tests/real-record.test.sh` → >= 2
    3. The suite is green
       Check: `bash projects/agent-kit/tests/real-record.test.sh 2>&1 | tail -1` → `/: [0-9]+ ok, 0 провалов$/`
- **Readiness sign:** the readers of the record answer on the real record as a person reads it.
- **Verified by:** the three checks.

### 3. The recorded hosting answers

- **Steps:**
    1. A script records the answers the hosting readers ask for under the machine token, names the token kind on each answer, keeps a refusal of rights and the login of the token; no token text lands in the files
       Check: `d=projects/agent-kit/tests/fixtures/real-host; { grep -l '"login": *"rt-tools-dev"' $d/*.json | grep -c .; grep -rcE 'gh[pousr]_[A-Za-z0-9]{20}' $d | awk -F: '{s+=$2} END{print s}'; } | tr '\n' ' '` → `/^[1-9][0-9]*\s+0 ?$/`
    2. The `gh` stub of `lib-board.sh` answers from the recorded files and answers a request under another token by the recorded refusal
       Check: `bash projects/agent-kit/tests/checks-board-real.test.sh 2>&1 | grep -c 'token'` → >= 2
    3. Every hosting reader of the package runs on the recorded answers, and the suite is green
       Check: `bash projects/agent-kit/tests/checks-board-real.test.sh 2>&1 | tail -1` → `/: [0-9]+ ok, 0 провалов$/`
- **Readiness sign:** the readers meet the hosting as the machine account sees it, rights included.
- **Verified by:** the three checks.

### 4. The demand in the hooks-kind suite

- **Steps:**
    1. The hooks-kind suite refuses a fixture reader of the record and a fixture reader of the hosting that no suite runs on saved data, naming each
       Check: `bash projects/agent-kit/tests/hooks-kind.test.sh 2>&1 | grep -c 'no run on saved data: fixture-'` → >= 2
    2. Every reader of the package is run on saved data: a suite calls it on a file under `fixtures/real-`
       Check: `bash projects/agent-kit/tests/hooks-kind.test.sh 2>&1 | grep -oE 'real data: [0-9]+ of [0-9]+ readers' | awk '$3==$5 && $3>0 {print "all"}'` → `all`
- **Readiness sign:** a new reader of real data cannot enter the package without a run on it.
- **Verified by:** the two checks.

### 5. Specs, layout, suites

- **Steps:**
    1. The specs name the saved data and the demand; the spec check is green
       Check: `node tools/check-specs.mjs > /dev/null && grep -c 'saved data' docs/specs/agent-kit/hooks/spec.md` → >= 1
    2. The layout matches the package, and the testing companion names the place of the saved data
       Check: `{ pnpm run -s agent-kit:check 2>&1 | grep -c 'сходится с пакетом'; grep -c 'fixtures/real-' .claude/skills/testing/implementation.md; } | tr '\n' ' '` → `/^1 [1-9][0-9]* ?$/`
    3. All package suites are green on a full run, the new suites among them
       Check: `test -f projects/agent-kit/tests/real-record.test.sh && env -u RT_SUITES_BASE bash projects/agent-kit/tests/run.sh 2>&1 | tail -1` → `ВСЕ НАБОРЫ ЗЕЛЁНЫЕ`
- **Readiness sign:** the texts describe the saved data, the tree matches the package, every suite is green.
- **Verified by:** the three checks.

## What this work does not do

- A reader that answers wrong on the real data is not rewritten here, unless the fix is one line:
  the wrong answer becomes a finding with a task, and the case names it.
- The hosting is not called live in a suite: the recorded answers are refreshed by the script by
  hand, under the machine token.
- The conversation checks removed or handed to a model in RT-3271 and RT-3276 are not brought back
  to be tested.
