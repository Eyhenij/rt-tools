# The end of an epic is a stop, not the next task

**Status:** in force · **Revision:** 2026-09-09 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/epic-table/spec.md`
**Laws:** `work-conduct`
**Procedures:** none

## Why

An epic ends with the session taking the next piece of work. The owner learns that the epic is over
from an ordinary report, mixed in with everything else, and there is no place where they could give
an order about its outcome: by the time they read it, the next work is already begun and the branch
for it created.

The rule of the turn says a turn ends with work handed over and the next one begun, and about the
end of an epic it says one line. Held by the memory of the session, that line works exactly as the
one about the table of tasks worked before the command: sometimes.

The subdomain names the stop and gives it a guard: when the epic has no unfinished task left, taking
new work is refused, and the refusal names the stop — the table by the command and the line about
waiting for orders.

## Terminology

- **The end of an epic** — the state in which no task of the epic is left unfinished: each is either
  merged or handed over by a request.
- **Taking new work** — a call that starts a piece of work: creating a task, creating a branch by a
  task number, moving a task to the work column.
- **The stop** — a turn that ends with the table of the epic's tasks and the line saying the session
  waits for orders, and takes no new work.
- **The owner's word** — an order to take work after the stop, carried in the call itself by the
  named line.

### What it is called in the interface

There is no interface: the guard answers with a refusal in the executor's own turn.

## Rules

- **An epic that goes on forbids a stop, and a turn that did work is no exception.** The reading of
  the epic was asked in one direction only — to permit a stop once the epic was over. A turn that
  made a commit and then reported passes every other tier by the letter, while the plan's next step
  is busy with nothing. The refusal names how many tasks are left and by which command that is
  counted; a tree with nothing to ask with is not refused at all.
- **The end of an epic is judged by a guard, not by the memory of the session.** The rule of the
  turn already carried a line about the epic, and it was held exactly as the line about the table
  was: by memory, that is, sometimes.
- **The guard stands on taking new work, not on the end of a turn.** A turn ends with text, and text
  is invisible to a machine; taking work is a call — a task, a branch, a column.
- **The epic is over when no task of it is left unfinished.** Merged or handed over by a request —
  the work is done; a task created and not taken does not end the epic.
- **The refusal names the stop, not only the ban.** The command that prints the table and the line
  about waiting for orders stand in the refusal text: without them the session invents a stop of its
  own, and the owner gets a report of another shape every time.
- **The order to go on is carried in the call itself.** The owner's word lives in the conversation,
  and the guard does not read the conversation: the lawful form is the named line in the command,
  with the reason the owner gave. An empty reason is not a bypass.
- **The state of the epic is asked by the same command that prints the table.** A second reader of
  the same tasks would diverge from the first in silence: one would count a task finished, the other
  would not.
- **The guards of the stop and of the turn agree on one reading.** The end of an epic is the one
  case where waiting for the word of the owner is the work itself: the guard of the stop refuses
  taking the next task there, and the two guards that judge the end of a turn would refuse the stop.
  Written apart, the three readings diverge, and the turn is left with no lawful end at all.
- **The reading is asked right before a refusal, not on every turn.** It goes to the hosting, and a
  turn that ends with work must not pay for a question about an epic that is not over.
- **A branch without a task number and a tree without epics are not judged.** There is no epic
  behind such work, and a refusal there would stop what the guard has nothing to say about.
- **An inability to ask the hosting lets the work through.** A guard that jams the work when the
  network is gone is switched off on the first day; the price of a miss here is one turn of the
  owner's attention.

## What is out of scope

- The shape of the table: it is assembled by the command of the neighbouring subdomain.
- Closing the card of the epic: a person closes it, having seen the stop.
- The text of the reply to the owner: it is invisible to a machine, and the guard stands on taking
  work, not on the end of a turn.

## Contract

The surface is a guard on the tool call. The refusal goes to the standard error stream, and the exit
code says whether the call is allowed.

### Refusal codes

Not applicable: the guard answers with an exit code and a text, not with named codes.

| What happened                              | Code | What it says                                           |
| ------------------------------------------ | ---- | ------------------------------------------------------ |
| the epic has an unfinished task            | `0`  | nothing: the call goes through                         |
| the epic is over                           | `2`  | the stop: the table command and the line about waiting |
| the call carries the order with a reason   | `0`  | nothing: the owner allowed the work                    |
| there is no epic, no number, no way to ask | `0`  | nothing: there is nothing to judge by                  |

## Data

There is no storage of its own. The composition of the epic and the state of its tasks are read by
the command of the neighbouring subdomain.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the refusal is single-language, and it is the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The guard lives in the package and is laid out into every consumer tree. What is its own in each of
them — the word for tasks, the board, the checks directory — is read from the settings of the tree.

## Decisions

- **The guard judges the call, not the turn.** A turn ends with text, and a guard reading text would
  refuse by mood. Rejected: a guard at the end of a turn, on a par with the one that judges an empty
  turn.
- **A handed-over task counts as finished.** Waiting for a merge is not work: the executor has
  nothing left to do about it, and the epic's work is over exactly at that minute.
- **The order goes in the call, not in the conversation.** The guard sees the call and does not see
  the conversation; a bypass invisible in the call would be indistinguishable from an unnoticed
  refusal.

## Open questions

- `Q-WC-10` — the guard counts a task handed over by a request as finished, and a request closed
  without a merge returns the work to the epic. Nothing sees that: the guard would then have to ask
  the fate of every closed request.

## History of changes

- 2026-09-09 — the subdomain was created: the end of an epic is a stop, and taking new work after it
  is refused by a guard.
