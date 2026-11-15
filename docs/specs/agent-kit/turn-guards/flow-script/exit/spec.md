# The guard of the exits of a turn

**Status:** in force · **Revision:** 2026-11-15 · **Scenario prefix:** `SC-AK`
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
  written: a failed engine and the eighth refusal in a row.
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
- **When the next step is the owner's, or another check refused it twice for the same reason, the one move is the owner's menu.**
- **The menu of a refusal carries exactly the options of the description: «отложить RT-N» with the task number, «сделаю сам» and «стоп».**
- **The owner's choice is carried out: a deferral marks the task «отложено», «сделаю сам» marks the owner's step, and the next unblocked task is taken; «стоп» releases the turn.**
- **An engine that fails, runs past its limit or cannot be called releases the turn and writes «движок упал» to the journal.**
- **The eighth refusal in a row is written to the journal.**
- **A service message is no word of the owner.**

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
