# The guard of the exits of a turn

**Status:** in force · **Revision:** 2026-08-25 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`
**Procedures:** none

## Why

One guard of the domain "The guards of the end of a turn" grew so much that its scenarios stopped
fitting next to the foreign ones: forty-two of sixty-three were about it. The subdomain is split off
so that the list of the scenarios of the domain can be read, and this one grows by an order of its
own.

The subject of the subdomain is the end of a turn. A turn in which the work stands where it stood
does not end: the rule lists four lawful exits, and not one of them sounds like "to tell what was
done".

## Terminology

- **A turn** — everything written after the last real remark of the owner. The answer of a tool
  arrives under the same role and does not count as a remark.
- **The last action of a turn** — the call of a tool standing last in the turn. The text of the
  answer does not count as an action at all.
- **Work** — an edit of a file or a command that changes the tree or its state. Reading, searching
  and switching a branch do not count as work.
- **Exploration** — a reading subcommand of the version control system and a reading call of the
  hosting client: a look at the history, the state of the tree, the list of the requests and the
  runs.
- **A tier** — a separate check of the guard naming the kind of the stop by name. The tiers are
  derived from the general sign and are needed so that the refusal is understandable.

### What it is called in the interface

The subdomain does not come outward: the guard has no screens. Its refusal is read by the executor,
not by a person.

## Rules

- **The last action of a turn is only ever work.** The sign is one for all the kinds of stopping;
  the particular tiers derive an understandable refusal from it.
- **An answer to the owner does not work as an action.** The order inside a turn: the work, the
  first step of the next one, then the text.
- **Exploration does not count as work.** A reading subcommand of the version control system and a
  reading call of the hosting client stay a preparation for work.
- **A redirection of the output does not count as work.** What makes a turn work is where the arrow
  leads, not the arrow itself: a write into the temporary directory of the session and a diversion of
  the error stream do not change the tree.
- **Waiting for someone else's step is never the end of a turn.** However much work there was before
  — the run, the review by the owner and the merge go without the executor.
- **Handed-in work ends a turn only together with the next one begun.** On the next one an action
  must be done, not said.
- **A task taken without a task folder does not end the turn.** Creating a branch and moving the
  column do not count as the start of the work.
- **A closed stage is confirmed by the command of the check of the same turn.**
- **The lawful exits are judged before all the tiers.** There are four of them: a question to the
  owner, a refusal of a guard, a written handover and a word of the owner about a stop.
- **The parts of a compound command are judged one by one.** A reading joined with an edit stays
  work.

## What is out of scope

The guard of the conversation, the guard of the incident, the guard of the window of the session and
the guard of waiting — they are in the domain next to it. The statements about the state of the tree
are judged by the guard of the statements: this guard reads actions, not text.

## Contract

The guard is called by the event of a stop and answers with a decision: let it through or give the
turn back with a reason.

### Refusal codes

Not applicable: the refusal comes as text naming the kind of the stop and the next step.

## Data

The guard holds no data of its own. It reads the record of the turn, the progress of the work of the
task and the history of the branch.

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

- **Refusing in favour of the work.** At any error, at a missing JSON parse, at a missing record of
  the turn or line of the state the turn is allowed: a broken guard has no right to jam the
  conversation.
- **A general sign instead of a row of tiers.** Nine incident analyses over a day described nine
  kinds of stopping; a tier for every kind is a race without end.

## Open questions

- `Q-TE-1` — the text of the answer the guard does not read at all. A turn where the work stands last
  but is told about wrongly is caught by the guard of the statements; whether a sign of its own is
  needed here is decided by the owner.

## History of changes

- 2026-08-25 — the subdomain was split off from the domain "The guards of the end of a turn":
  forty-two scenarios of sixty-three were about one guard.
