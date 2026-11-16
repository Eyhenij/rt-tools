# The end of an epic is a stop, not the next task

**Status:** in force · **Revision:** 2026-11-16 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/epic-table/spec.md`
**Laws:** `work-conduct`
**Procedures:** none

## Why

An epic ends with the session taking the next piece of work. The owner learns that the epic is over
from an ordinary report, mixed in with everything else, and there is no place where they could give
an order about its outcome: by the time they read it, the next work is already begun and the branch
for it created.

The rule of the turn said a turn ends with work handed over and the next one begun, and about the
end of an epic it said one line. Held by the memory of the session, that line worked exactly as the
one about the table of tasks worked before the command: sometimes.

The subdomain names the stop and gives it a guard: when the epic has no unfinished task left, taking
new work asks the owner by a window to allow or forbid the command, and the window names the end of
the epic and the command of the table.

## Terminology

- **The end of an epic** — the state in which no task of the epic is left unfinished: each is either
  merged or handed over by a request.
- **Taking new work** — a call that starts a piece of work: creating a task or creating a branch by
  a task number, where the command itself is run.
- **The stop** — a turn that ends with the table of the epic's tasks and the line saying the epic is
  over, and takes no new work.
- **The owner's word** — their answer in the window the host shows on the call: allow or forbid.

### What it is called in the interface

The window of the host that asks the owner to allow or forbid a command; its text is the reason the
guard gives.

## Rules

- **The end of an epic is judged by a guard, not by the memory of the session.** The rule of the
  turn already carried a line about the epic, and it was held exactly as the line about the table
  was: by memory, that is, sometimes.
- **The guard stands on taking new work, not on the end of a turn.** A turn ends with text, and text
  is invisible to a machine; taking work is a call — a task or a branch. A column move follows the
  branch of the same work and is not judged: a window on it would ask the owner twice about one
  decision.
- **The epic is over when no task of it is left unfinished.** Merged or handed over by a request —
  the work is done; a task created and not taken does not end the epic.
- **The decision is the owner's, and the guard asks them by a window.** The answer is `ask`: the host
  shows the owner a window to allow or forbid the command. Where nobody can answer — a subagent, a
  run without a person — the host hands the reason to the model, and the call does not go.
- **The window names the end of the epic and the command of the table.** Without them the owner sees
  a bare question and does not know what they are deciding.
- **The guard reads no record of the conversation.** Consent was once looked for there by words: a
  real «yes» in other words was not found, and the owner was asked three times about one decision;
  an unrelated «yes» passed as consent. No line in the call lets the work past the window either.
- **Only the command that is run is judged.** A heredoc body, a file a reader is given and a commit
  message carry the name of the command and take no work.
- **A window is written to the journal apart from the refusals.** An unanswered window in a run
  without a person is a refusal by its effect, and a count of refusals alone would not see it.
- **The state of the epic is asked by the same command that prints the table.** A second reader of
  the same tasks would diverge from the first in silence: one would count a task finished, the other
  would not.
- **The guards of the stop and of the turn agree on one reading.** The end of an epic is the end of
  the scenario: the guard of the stop refuses taking the next task there, and the exit guard releases
  the turn by the same end. Read apart, the two diverge, and the turn is left with no lawful end.
- **The reading is asked right before a window, not on every turn.** It goes to the hosting, and a
  turn that ends with work must not pay for a question about an epic that is not over.
- **A branch without a task number and a tree without epics are not judged.** There is no epic
  behind such work, and a window there would ask about what the guard has nothing to say about.
- **An inability to ask the hosting lets the work through.** A guard that jams the work when the
  network is gone is switched off on the first day; the price of a miss here is one turn of the
  owner's attention.

## What is out of scope

- The shape of the table: it is assembled by the command of the neighbouring subdomain.
- Closing the card of the epic: a person closes it, having seen the stop.
- The text of the reply to the owner: it is invisible to a machine, and the guard stands on taking
  work, not on the end of a turn.

## Contract

The surface is a guard on the tool call. It answers with the decision of the hook in its standard
output, or with nothing.

### Refusal codes

Not applicable: the guard answers with a decision of the hook, not with named codes.

| What happened                              | Decision | What it says                                     |
| ------------------------------------------ | -------- | ------------------------------------------------ |
| the epic has an unfinished task            | none     | nothing: the call goes through                   |
| the epic is over                           | `ask`    | the end of the epic and the command of the table |
| there is no epic, no number, no way to ask | none     | nothing: there is nothing to judge by            |

## Data

There is no storage of its own. The composition of the epic and the state of its tasks are read by
the command of the neighbouring subdomain.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the window text is single-language, and it is the language of the rules layer.

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
- **The owner answers in the window, not in the conversation.** The guard does not read the
  conversation, and a line in the call is written by the executor, not by the owner. Rejected: a
  bypass line in the call and the search of consent in the record by words.

## Open questions

- `Q-WC-10` — the guard counts a task handed over by a request as finished, and a request closed
  without a merge returns the work to the epic. Nothing sees that: the guard would then have to ask
  the fate of every closed request.

## History of changes

- 2026-09-09 — the subdomain was created: the end of an epic is a stop, and taking new work after it
  is refused by a guard.
- 2026-10-09 — the owner's message or menu answer naming the number of the work releases the call:
  the line in the call was forbidden by an owner, and the work stopped on the word they had given.
- 2026-11-15 — the refusal says the turn ends with the epic instead of naming a wait for orders: the
  exit guard releases the turn at the end of the scenario.
- 2026-11-16 — the guard asks the owner by a window instead of refusing; the record of the
  conversation and the bypass line are no longer read, a column move is no longer judged.
