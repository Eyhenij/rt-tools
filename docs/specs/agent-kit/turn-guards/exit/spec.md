# The guard of the exits of a turn

**Status:** in force · **Revision:** 2026-09-17 · **Scenario prefix:** `SC-AK`
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
- **A service message** — a record entry under the role of the owner that the owner did not write:
  the load of a rule, the summary of a compaction, the feedback of a guard of the stop.
- **An open epic** — an epic with at least one task left unfinished, as the table of the epic
  prints them. An epic that cannot be read is not open.
- **The epic branch** — a branch named by the header line of an epic plan in the plans directory.
  It has the shape of a task branch and carries no task folder by the rule.

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
- **A launch in the background is never the last action of a turn.** A role sent to work by the
  agent tool or a command sent behind the turn is an announcement of intent: what was sent asks
  nothing on the way and goes no faster for being waited on. While it runs, what does not depend on
  it is done, and the launch stands anywhere in the turn but last.
- **An empty turn woken by a notification about an own background task ends while another own
  background task still runs.** The notification is written under the role of the owner, and the
  turn it opens holds nothing to do: what it waits for is still running. The turn after the last own
  task finished is judged as before — its result is acted on in that turn.
- **Handed-in work ends a turn only together with the next one begun.** On the next one an action
  must be done, not said.
- **A task taken without a task folder does not end the turn.** Creating a branch and moving the
  column do not count as the start of the work.
- **A closed stage is confirmed by the command of the check of the same turn.**
- **A next step rewritten into the progress is begun by the same turn.** After the last edit of the
  progress the turn holds work other than the commit and the push of it — an edit outside the task
  folder or a command changing the tree; otherwise the turn does not end, however much was done
  before the line. Judged in a running stage alone; handed-in work has a tier of its own.
- **The lawful exits are judged before all the tiers.** There are four of them: a question to the
  owner, a refusal of a guard, a written handover and a word of the owner about a stop.
- **The parts of a compound command are judged one by one.** A reading joined with an edit stays
  work.
- **A service message neither starts a turn nor is a word of the owner.** The turn is counted from
  the last remark the owner wrote; the word «стоп» in the text of a loaded rule releases nothing.
- **A refusal of a guard is an exit only as the last action of the turn.** A refusal in the middle
  of the turn was answered by the work that followed it, and the turn is judged by how it ended.
- **A refusal of the closing tool is not an exit.** The refused call was a stop, not work: the guard
  leaves that refusal out of the release sign, and the turn is judged by what stood before it.
- **A question at the head of an empty turn in a running stage is a stop.** The parts of the stage
  that do not depend on the answer go first, and the question by the tool after them.

## What is out of scope

A turn under an open epic is a subdomain of its own, `docs/specs/agent-kit/turn-guards/exit-epic/`.
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
- **An open epic closes the two exits the guard used to leave open.** A turn that ended with work
  and a second pass over the turn released the executor three times in one day under the owner's
  standing word not to stop until the epic is closed. The tiers lie in a file of their own next to
  the guard: the guard reached the length limit.

## Open questions

- `Q-TE-1` — the text of the answer the guard does not read at all. A turn where the work stands last
  but is told about wrongly is caught by the guard of the statements; whether a sign of its own is
  needed here is decided by the owner.

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
