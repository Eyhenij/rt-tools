# Plan

**Task:** RT-3418 · **Branch:** RT-3418-flow-engine-stop-refusals
**Behaviour:** unchanged — код приложений не меняется. Меняется поведение проверки конца хода: появляется случай отпуска, и его правило идёт в описание проверки той же правкой. Слово владельца: «доведи все задачи эпика до завершения».

## Points

- **A:** the exit check of the work flow engine holds a turn whenever the scenario is not over. It
  does not tell a turn that waits for its own background task from a turn that simply stopped. The
  count over the session records of 14–19.11, a line per refusal, stands in the grill: 251 refusals
  of the engine at turn ends, 169 of them — 67 % — while a background agent, a background command
  or the push set of the same session was running; 5 stops are true. The forecast of the engine
  over the closed days — `node tools/task-flow-script.mjs forecast --days 5 --until 2026-11-18` —
  gives 16 889 calls, 691 stops, 383 held. The longest run of refusals in a row is 18.
- **This task reaches:** a turn that waits for a background task of its own session ends without a
  refusal and without the owner's menu; the host wakes the session by the notice of the task. A
  turn that stopped with nothing running, or that only says it waits, is held as before.
- **Sign:** the scenarios of the exit check release a stop with a background task running, hold
  one whose task is past the bound and one in the state that itself sends work to the background,
  and name no owner's menu for a waiting stop. The forecast over the same closed days holds fewer
  stops than 383 and names a longest run shorter than 10.
- **Milestone G of the epic:** fewer than five refusals per hundred commands and no dead end. This
  task takes the biggest counted source of refusals at turn ends and the cause of the longest runs.
- **Metric:** отказы проверки конца хода: вниз. Base — the forecast above: 383 held stops of 691
  over 14–18.11, 2,3 per hundred calls. Judged by the forecast of the week after the merge of the
  epic into `main`, counted by the same command, against the bound of the plan of RT-3276 — 0,97 per
  hundred calls.

## The decision the owner takes with this plan

The description of the exit check says today: a turn that wrote to the tree and stops while the
scenario is open is held, whatever its last words are. The scenario `SC-AK-1448` holds a turn that
says «the suite runs in the background». This plan narrows that rule. A stop is released when the
record itself holds a background task of the session with a start and no end. A stop that only
says it waits stays held, and `SC-AK-1448` stays as it is.

The price. A released turn is woken only by the notice of the task. Over 14–19.11 24 of 552
background starts got no notice — 22 commands and 2 agents. After such a start the session stands
until the owner writes. The bound of age is read only at a stop and does not wake the session.

## Task footprint

| What  | Where |
| ----- | ----- |
| Laws  | `docs/constitution/work-conduct.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/turn-conduct/`, `.claude/skills/task-flow/`, `.claude/skills/agent-kit-source/`, `.claude/skills/spec-driven/` |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/session.mjs` |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/records.mjs` |
| Code (правится) | `projects/agent-kit/assets/task-flow/measure/session.mjs` |
| Code (правится) | `projects/agent-kit/assets/task-flow/flow.js` |
| Code (правится) | `projects/agent-kit/assets/checks/flow-forecast.mjs` |
| Code (правится) | `projects/agent-kit/tests/turn-exit-guard.test.sh` |
| Code (правится) | `projects/agent-kit/tests/task-flow-script.test.sh` |
| Code (правится) | `docs/specs/agent-kit/turn-guards/flow-script/exit/` |

## What counts as done

- The session source names the background tasks of a record: a command or an agent started in the
  background, and the end of each — a notice with a status, or a call that stops it. A monitor is
  no background task: it ends by itself.
- A stop with a background task of the session running and younger than the bound is released by
  a release case of its own; the journal names the case.
- The case does not hold in the state whose action itself sends work to the background and goes
  on — `работа-отдана`.
- A stop whose only background task is older than the bound is held as before; so is a stop that
  says it waits with no background task in the record, and a second stop on the same task with no
  call between the two.
- A stop that follows a refusal and waits for a background task gets no owner's menu.
- The session record is read by pieces, in the session source and in the source of the records: a
  record longer than one string of the runtime does not fail the engine.
- The forecast names the longest run of held stops in a row, and over 14–18.11 it is under 10.
- The description of the exit check carries the new rule and its scenarios.

## Stages

### 1. The engine sees the background tasks of a session

Rules: the source of the session gives two more kinds of events — the start of a background task
with its id and time, and its end. The start is a call with `run_in_background` whose result names
a task id, or an agent whose result is asynchronous. The end is a record with a task notice of the
same call and a status, or a call that stops the task. A measurer answers whether a task started in
this session has no end yet and is younger than the bound. The bound is 20 minutes and stands in
the words of the description: of the 165 waiting stops of 14–19.11 it covers 163. The notice of
an end lies in a record of the kind `queue-operation`, which the source does not read today; the
source reads it. The time of «now» is given to the measurer by the caller, so the forecast judges
a stop by the time of that stop. The records are read by pieces; the size of a piece is a
parameter, and the scenario cuts a line across the edge of a piece.

- **Steps:**
    1. The session source names the start and the end of a background task
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1759'` → >= 1
    2. The session record is read by pieces
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1760'` → >= 1
- **Readiness sign:** both scenarios pass, the suite ends with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — exit 0.

### 2. A waiting stop is released

Rules: the description of the flow gets the release case of a background task, asked after the
stop word of the owner and before the case of no write. It does not hold in the state
`работа-отдана`. The measure of an idle stop does not hold while a background task of the session
runs, so a waiting stop names no owner's menu. A task past the bound releases nothing and counts
as no task. One task releases one stop: a second stop with no call between the two is held, so a
chain of background waits does not keep a turn released. The description `flow.md` is generated
from `flow.js`.

- **Steps:**
    1. A stop with a background task of the session running is released
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1761'` → >= 1
    2. A background task past the bound releases nothing
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1762'` → >= 1
    3. A waiting stop after a refusal names no owner's menu
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1763'` → >= 1
    4. A stop in the state that sends work to the background is held
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1764'` → >= 1
- **Readiness sign:** the four scenarios pass; `SC-AK-1448` passes unchanged; the laid-out engine
  matches the package.
- **Verified by:** both suites and `bash projects/agent-kit/tests/turn-replay.test.sh` — exit 0;
  `pnpm run agent-kit:check` — exit 0.

### 3. The forecast counts the runs

Rules: the forecast replays the stops through the release cases, the new one among them, and its
line names the longest run of held stops in a row. A run is broken by a released stop and by a
word of the owner.

- **Steps:**
    1. The forecast lets a waiting stop go and names the longest run
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1765'` → >= 1
    2. Over the closed days the forecast holds fewer stops than the base
       Check: `node --max-old-space-size=8192 tools/task-flow-script.mjs forecast --days 5 --until 2026-11-18 | tail -1 | awk '{print ($6 + 0 < 383) ? 1 : 0}'` → = 1
- **Readiness sign:** the forecast line of 14–18.11 before and after stands in the progress, with
  the longest run.
- **Verified by:** the forecast line.

## What this work does not do

- A background start that never gets its notice: 24 of 552 over 14–19.11. The engine does not wake
  a session; the price stands above.
- The owner's word typed in the middle of a turn, which the owner source does not read — class E2,
  30 refusals by judgement. A task of its own.
- The measure `wrote` that reads the calls of the whole record — class F, 5 refusals. A task of
  its own.
- The wrong state named by the engine — class B2, 16 refusals: RT-3425.
- The move that cannot be made after the folder is taken apart: RT-3434.
- The wrong base of the push set: RT-3426. The option «сделаю сам» of the menu: RT-3420.
- Whether a question reaches the owner after a refusal is not measured here: the card asks for it,
  and the count of the grill does not show it.
- The refusals of the judges are counted in the grill: 21 of the menu judge, none right after a
  refusal that named the owner's menu; 31 of the turn judge. Their texts are not edited here.
- The forecast of the week after the merge is not measured inside the task: the metric judges it.
