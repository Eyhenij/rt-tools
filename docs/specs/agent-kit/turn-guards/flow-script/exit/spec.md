# The guard of the exits of a turn

**Status:** in force · **Revision:** 2026-11-20 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`
**Procedures:** none

## Why

A turn used to be judged by its last action and by a row of tiers, one per kind of stop seen in an
incident. Each new kind needed a new tier, and the work still stopped where no tier stood. The guard
now asks the engine of the task flow: a turn does not end before the scenario does, unless a release
case of the description says it may.

## Terminology

- **The verdict** — the answer of the engine at the end of a turn: released with the case that
  released it, or held with the one move that comes next.
- **A release case** — an entry of the section `release` of the description: a condition over the
  measurers and its order.
- **The journal** — the file in the common directory of git where a release nobody decided is
  written: a failed engine and the eighth refusal in a row. A release on a wait is written there
  too.
- **A service message** — a record entry under the role of the owner that the owner did not write:
  the load of a rule, the summary of a compaction, the feedback of a guard of the stop.

### What it is called in the interface

The subdomain does not come outward: the guard has no screens. Its refusal is read by the executor,
not by a person.

## Rules

- **A turn ends with the scenario: the engine measures the branch, and a turn whose scenario is not over is held.**
- **A turn is released by the first release case of the description that is met, in the order of the cases.**
- **A held turn names one move: the action of the measured state, and in a running stage the current step with the command that measures it.**
- **The owner's last word releases the turn when it begins with a stop word and nothing after it asks to go on.**
- **A session that wrote nothing to the tree releases the turn unless the owner's last word pushes the work on, and a branch outside the scenario releases it always.**
- **A role session with no edit tool ends with its report.**
- **The silent hosting releases the turn only when the measurement itself stopped on the silence.**
- **A menu of a refusal that did not reach the owner a second time in a row releases the turn.**
- **The session source names the background tasks of a record: the start of a command or an agent sent to the background, and its end by a notice with a final status or by a call that stops it.**
- **A turn that waits for a background task of its own session is released while the task has a start, no end, and is younger than twenty minutes.**
- **One background task releases one stop: a second stop with no call of a tool between the two is held.**
- **A turn has ended when the record holds something after the agent closed it, other than the feedback of a stop hook.**
- **A wait releases nothing once the work is handed over: the state whose action sends work to the background goes on by itself.**
- **A stop made while a background task of the session runs names no owner's menu.**
- **A background task the session has not read is the first move, and no owner's menu is offered over it: the refusal names the task and its output file.**
- **Two running tasks release two stops, and the end of a task gives its stop back.**
- **A release on a wait is written to the journal with the session.**
- **The session source and the source of the records read a record by pieces and never hold it as one string.**
- **The forecast judges a background task by the time of the stop it replays and names the longest run of held stops in a row; a released stop and a word of the owner break a run.**
- **When another check refused the same step twice for the same reason, or the executor stopped again with no call after a refusal, the one move is the owner's menu.**
- **The menu of a refusal carries exactly the options of the description: «отложить RT-N» with the task number and «стоп».**
- **The owner's choice is carried out: a deferral marks the task «отложено» and the next unblocked task is taken; «стоп» releases the turn.**
- **An engine that fails, runs past its limit or cannot be called releases the turn and writes «движок упал» to the journal.**
- **The eighth refusal in a row is written to the journal.**
- **A service message is no word of the owner.**
- **The engine measures the copy the session works in, and a worktree copy whose branch does not carry the engine is not judged.**
- **The CI hold is read before the release cases and the menu: a CI run nobody watches or a red run nobody read holds the stop, at the end of the scenario too.**
- **The CI hold judges the open PRs whose base wakes the pipeline and whose branch is the current one, the epic branch of the work, or one pushed in this record.**
- **A running run holds the stop until an open background task of the session calls the hosting client with the run, the PR or the head; the watch lifts the hold, and the release cases decide the turn.**
- **A red run holds the stop until a command after its end, neither refused nor failed, names it, or a read of the output of a watch of it.**
- **A head with no run holds the stop for two minutes after the result of its push or the opening of its PR.**
- **A hosting that does not answer about the CI holds nothing.**
- **The owner's stop word passes a running run and a fresh head, not a red attempt that ended after the word.**
- **The host adapter reads the open PRs and the runs of the PR pipeline file on a head past the clock.**
- **A call event carries its time and the branch of its record entry, and a background event the command of its call.**

## What is out of scope

The description, its measurers and the measured state are the subdomain one level up,
`docs/specs/agent-kit/turn-guards/flow-script/`. The guard of the conversation, the guard of the
window of the session and the guard of waiting are in the domain `docs/specs/agent-kit/turn-guards/`.
The line about a failure at the start of the next turn is written by the dispatcher, and its rule is
in `docs/specs/agent-kit/dispatch/`; its scenario stands here, because it is the second half of a
release by a failed engine.

## Contract

The guard is called by the event of a stop, hands its input to `task-flow-script.mjs verdict` and
answers with the verdict: silence for a released turn, `{"decision":"block","reason":…}` for a held
one. The engine has 75 seconds; the hook declares its own limit of 90 in its header.

### Refusal codes

Not applicable: the refusal comes as text naming the measured state and the next move.

## Data

The guard reads nothing itself but the role header of a role session. It writes the journal and the
count of the refusals in a row into `rt-kit/` under the common directory of git.

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

Not applicable: the guard judges one turn of one session.

## Decisions

- **Refusing in favour of the work, but never in silence.** A broken engine releases the turn, and
  the release is written; the next turn begins with it.
- **The measured state instead of a row of tiers.** Nine incident analyses over a day described nine
  kinds of stopping; a tier for every kind was a race without end. The tiers of the former guard are
  removed together with their scenarios.
- **The silent hosting is read from the measurement.** A read that failed for a state the
  measurement passed over says nothing about a later local exit that is unmet.

- **A wait is read from the record, not from the words of the turn.** A turn that says «the suite
  runs in the background» with no background task in the record is held as before. Over 14–19.11
  169 of 251 refusals of the engine at turn ends fell on a turn whose own background task ran.
- **A released wait is woken only by the notice of the task.** In the replay of 14–18.11 every
  released wait had a task that got its notice later, half of them within four minutes; eight
  waited longer than twenty minutes. A task that does not end by itself — a showcase, a stand —
  sends none: a turn that ends within twenty minutes of its start is released, and the session
  stands until the owner writes. The bound is read only at a stop and wakes nothing. Each release
  on a wait is written to the journal with the session, and the records of that session show what
  woke it; no command counts such stands yet.
- **The forecast leans to the better side.** In the records a refused stop spends no task, so the
  replay releases every recorded stop of a wait, and the live engine releases one per task.

- **The owner source still reads the record as one string.** Its file is outside the plan of the
  task that brought the reader by pieces, so a record past the string limit of the runtime, about
  536 MB, still fails the engine there; a failed engine releases the turn and writes the journal.
- **A monitor is no background task.** A persistent monitor never ends, and a turn would be
  released on it for as long as it runs.

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
- **A red run after the owner's «стоп» is still read.** The owner chose so by menu on 21.11: the
  stop passes the wait, not a red result that came after it.

## Open questions

None.

## History of changes

- 2026-08-25 — the subdomain was split off from the domain "The guards of the end of a turn":
  forty-two scenarios of sixty-three were about one guard.
- 2026-09-17 — the open epic: a turn with work and a second pass are judged while the epic has an
  unfinished task; a service message starts no turn; a refusal is an exit only as the last action;
  a question without work in a running stage and a handover by hand are refused; the owner's word
  quoted in the waiting line of the progress releases the turn.
- 2026-09-18 — the epic branch: a branch named by the header of an epic plan is not judged by the
  tier of the taken task. The end of an epic read from the table releases the whole turn; an
  unreadable epic keeps the former judgement.
- 2026-09-18 — the next step: a progress rewritten by the turn names what the turn owes, and the
  turn does not end on the commit of it alone.
- 2026-09-18 — a launch in the background as the last action: a role or a command sent behind the
  turn is an announcement of intent, and the turn does not end on it.
- 2026-11-04 — a turn woken by a notification about an own background task ends while another own
  task runs. The rules of a turn under an open epic left for the subdomain `exit-epic`: the
  scenario file outgrew the length limit.
- 2026-11-15 — the guard asks the engine of the task flow for a verdict. The tiers and the
  subdomain of the open epic are removed; the release cases of the description replace them.
- 2026-11-15 — the subdomain moved under the task flow as an executable scenario: its verdict is
  the engine's. The scenario of the line about a failure at the start of the next turn came here
  from the dispatcher with its number.
- 2026-11-15 — a stop with no call after a refusal names the owner's menu: an idle series ends
  instead of holding the turn without a move.
- 2026-11-15 — the engine measures the copy of the session, not the main checkout: sessions of other
  worktrees were held by the steps of a foreign plan. A write is recognised past the variables and
  the options of git, and a stop word followed by an order of work holds the turn.
- 2026-11-20 — a turn that waits for a background task of its own session is released, once per
  task and for twenty minutes; such a stop names no owner's menu. The record is read by pieces.
  The forecast over 14–18.11 holds 142 stops where it held 383. A series of ten refusals in a row
  with no background task running is not lifted by this rule: the series of 19.11 at a step that
  could not be measured on a taken-apart folder stays for the task about that step.
- 2026-11-21 — a background task whose notice came after the last call is the first move of a held
  stop: the menu «отложить / стоп» is no longer offered over a result that has not reached the
  session. The first call or menu after the notice reads it. A stricter sign — a call naming the
  task or its files — named tasks hundreds of calls old on real records and doubled the held stops
  of the forecast; it was dropped. A task the session stopped itself, one the harness killed, or one
  with no start in the record holds nothing.
- 2026-11-21 — the CI hold: a CI run of a PR the session answers for, running with no watch, red
  with no read, or not there yet within two minutes of the push, holds the stop before every release
  case. The refusal names the run and its ready command.
