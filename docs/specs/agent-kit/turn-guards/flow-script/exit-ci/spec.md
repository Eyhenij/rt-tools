# The CI hold at the end of a turn

**Status:** in force · **Revision:** 2026-11-22 · **Scenario prefix:** `SC-AK`
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
- **A watch of a CI run is no wait: it releases no stop of the scenario.**
- **A red run holds the stop until a call of the hosting client after its end, neither refused nor failed, names it, or a command or a read takes the output of its watch.**
- **A head with no run holds the stop for two minutes after the result of its push or the opening of its PR.**
- **A hosting that does not answer about the CI holds nothing.**
- **The owner's stop word passes a fresh head only: a running run still asks for one background watch, and a red run holds until it is read.**
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
- **The watch lifts the hold and releases nothing by itself.** CI here runs 15 to 41 minutes; the
  twenty-minute bound of a wait would drop a live watch, and a released wait in «работа-отдана»
  would stop the session instead of the next task.
- **A read is counted after the end of the attempt.** The call that starts the watch names the run
  before it ends and reads nothing. The red run of PR #3460 on 20.11 (44810853234) was named by no
  record for twelve hours.
- **The stop lifts the wait, not the watch.** The owner chose so by two menu answers on 21.11. The
  first: a red result after «стоп» holds until one read, «so the red does not wait for you till
  morning». The second, asked when review found that only a watch wakes the session: after «стоп»
  the session starts one background watch, and an unread red run holds before the word and after
  it. A fresh head still passes: the watch of a run not yet shown has nothing to name.
- **A watch of a CI run is no wait.** The hold asks for the watch after every merge into the epic
  branch, and CI runs for up to forty minutes there. Counted as a wait, the watch would release the
  stops of the next stage, and the session would wait instead of working.

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
