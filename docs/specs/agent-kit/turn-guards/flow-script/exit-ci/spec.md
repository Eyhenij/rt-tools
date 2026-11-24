# The CI hold at the end of a turn

**Status:** in force · **Revision:** 2026-11-24 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/turn-guards/flow-script/exit/spec.md`
**Laws:** `work-conduct`, `delivery`
**Procedures:** none

## Why

A session that hands a PR over answers for its CI run: the run goes 15 to 41 minutes, and a red one
waits for the owner when nobody reads it. The guard of the exits of a turn reads the CI hold before
every release case, so a stop over a run nobody watches or a red run nobody read is held with the
number of the run and its ready command.

This subdomain holds the rules of that hold. They came from the guard of the exits of a turn when
its scenario file outgrew the length limit, and they keep the prefix `SC-AK` and their numbers.

## Terminology

- **The CI hold** — the answer of the measurer `measure.ci.hold`: the run of an open PR the session
  answers for that nobody watches, a red run nobody read, or a fresh head with no run yet.
- **A watch** — a background task of the session whose command calls the hosting client and names
  the run, the PR, the branch or the head.
- **A read** — a call of the hosting client after the end of a red run that names it, neither
  refused nor failed, or a command or a read that takes the output of its watch.

### What it is called in the interface

There is no interface: the refusal is read by the executor and names the run and its command.

## Rules

- **The CI hold is read before the release cases and the menu: a CI run nobody watches or a red run nobody read holds the stop, at the end of the scenario too.**
- **The CI hold judges the open PRs whose base wakes the pipeline and whose branch is the current one, the epic branch of the work, or one pushed in this record.**
- **A running run holds the stop until an open background task watches it by the hosting client, naming the run, the PR, the branch or the head; the watch lifts the hold, and the release cases decide the turn.**
- **A watch of a CI run is a wait like any other background task of the session.**
- **A red run holds the stop until a call of the hosting client after its end, neither refused nor failed, names it, or a command or a read takes the output of its watch.**
- **A head with no run holds the stop for two minutes after the result of its push or the opening of its PR.**
- **A hosting that does not answer about the CI holds nothing.**
- **The owner's stop word passes a fresh head with no run and nothing else: a running run still asks for its watch, and a red one for its read.**
- **After the mark of Esc the CI hold holds nothing until the owner writes again.**
- **The host adapter reads the open PRs and the runs of the PR pipeline file on a head past the clock.**
- **A call event carries its time and the branch of its record entry, and a background event the command of its call.**

## What is out of scope

The release cases, the menu and the verdict of a held turn are in the guard of the exits of a turn,
`docs/specs/agent-kit/turn-guards/flow-script/exit/`. The pipeline itself and its checks are in the
delivery of the tree.

## Contract

The hold is the measurer `measure.ci.hold` of the description, read by `task-flow-script.mjs
verdict` before the release cases. A held stop answers `{"decision":"block","reason":…}` with the
run and its ready command.

### Refusal codes

Not applicable: the refusal comes as text naming the run and the command.

## Data

The open PRs of the hosting, the runs of the pipeline file on their heads, the `on` block of that
file, and the calls and background tasks of the session record.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The refusal is written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Every open PR the session answers for is judged; the first run that holds names the refusal.

## Decisions

- **The CI hold stands before the release cases.** The case «the scenario is over» releases the turn
  of a finished epic and of a task outside an epic with its PR handed — the minutes when CI runs. A
  menu in place of the run would leave the run to the owner.
- **The PRs are taken from the pushes of the record and the epic of the work, not from the current
  branch alone.** A task merged into the epic branch in the browser moves the head of the epic's PR
  with no call of the session, and a session that switched branches still answers for the PR it
  pushed. A PR into a base the pipeline does not wake for never gets a run: waiting for one is a
  dead end.
- **The watch lifts the hold, and the scenario decides the stop.** CI here runs 15 to 41 minutes,
  under the ninety-minute bound of a wait. In «работа-отдана» a wait releases nothing: a released
  stop there would stop the session instead of the next task.
- **A read is counted after the end of the attempt.** The call that starts the watch names the run
  before it ends and reads nothing. The red run of PR #3460 on 20.11 (44810853234) was named by no
  record for twelve hours.
- **A stop word passes a fresh head only.** On 21.11 the owner chose by two menu answers that a red
  run holds until one read and a running run asks for one background watch, after «стоп» too. On
  24.11 the stop word releases a turn again, and a fresh head has its pass back.
- **A watch of a CI run is a wait.** The owner named CI as the first long process the agent waits
  for: the agent waits, and after the notice it goes on with the current step. One watch releases
  one stop, as any task does.

## Open questions

None.

## History of changes

- 2026-11-21 — the CI hold: a CI run of a PR the session answers for, running with no watch, red
  with no read, or not there yet within two minutes of the push, holds the stop before every release
  case. The refusal names the run and its ready command. The stop word passes a fresh head only.
  The read of a red run shows the last 200
  lines of its failed log: the error of a failed step stands at its end, past the cut of a tool.
- 2026-11-22 — the rules of the CI hold moved here from the guard of the exits of a turn: its
  scenario file outgrew the length limit.
- 2026-11-22 — the hold reads no typed word of the owner, and a watch of a CI run is a wait.
  Scenario 1813 is removed with its test: no typed word stops the work, the owner stops it by Esc.
  After Esc the hold holds nothing: a red run or a running one does not put the work back on.
- 2026-11-24 — the stop word passes a fresh head again, and only it: the cases stand in scenario 1912.
