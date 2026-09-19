# The epic of a working copy is written down, not chosen

**Status:** in force · **Revision:** 2026-09-17 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/epic-stop/spec.md`
**Laws:** `work-conduct`
**Procedures:** none

## Why

A machine holds several working copies of one tree, and each of them runs sessions of its own. The
work queue answers only what is open: it holds no owner of a card, and by topic one epic cannot be
told from another. Which epic this copy leads was written nowhere at all.

A session that had finished its work looked at the list of open epics, took the freshest one and
worked on it: a branch, a task folder, a plan, a written agreement. The owner stopped that, not a
check, and said plainly they had never given that epic into work. All three checks of the tree were
green the whole time: the delivery guard judges whether a task belongs to its epic, the queue audit
judges the links of cards, the turn guard judges that the turn held an action.

The subdomain gives the assignment a place and a reader. The table of assignments lies in the main
branch, the copy names itself by a short name in a local file, and a call that takes work is refused
while the row of this copy says something other than the epic of that work.

## Terminology

- **The working copy** — one checkout of the tree on the machine, with sessions of its own. Copies
  of one tree share the history and share nothing else.
- **The name of the copy** — a short word the copy calls itself by. It lies outside the history: the
  paths of one machine are not written into the repository.
- **The table of assignments** — one file in the main branch: a row per copy — the name, the epic,
  the plan of work, the day of the assignment.
- **The assignment** — the epic named in the row of this copy. It is written by the owner; a session
  reads it and does not write it.
- **Taking work** — a call that starts a piece of work: creating a branch by a task number, creating
  a task under an epic, moving a card to the work column.
- **A stale assignment** — a row naming an epic that is already closed. The row outlives the epic by
  itself: the epic ends, and nobody rewrites the row.

### What it is called in the interface

There is no interface: the reader prints the assignment of this copy, and the guards answer with a
refusal in the executor's own turn.

## Rules

- **The epic of a working copy is read from the table, not chosen from the list of open ones.** By a
  list of numbers someone else's epic cannot be told from one's own, and the freshest card is not an
  order.
- **The table lies in the main branch, and the name of the copy outside the history.** Every copy
  reads one and the same table, and the name is the only thing that differs between them.
- **A copy that names itself in no way is refused by that, not by the absence of a row.** Told about
  a missing row, the executor goes to fill a table where everything is in place.
- **A row with a dash and a missing row are two different answers.** The dash is the owner saying
  there is no work; the missing row is the table saying nothing at all.
- **The refusal names both epics: the assigned one and the one being taken.** A refusal without the
  numbers is read as a defect of the check, and the work goes on past it.
- **Every call that takes work is judged, not only the branch.** Three calls start work, and two of
  them go past the delivery guard entirely: a task created under someone else's epic and a card
  moved into the work column are both work taken.
- **Creating an epic is not taking work.** The epic is the owner's order written down, and the
  assignment under it is given after, by the owner, in the table.
- **Work that names no epic is not judged by the assignment.** The assignment judges belonging, not
  the right to work at all: the word of the owner about work outside an epic stays as it was.
- **An assignment whose epic is closed is refused on a par with a foreign one.** That is exactly how
  a session was left with no order: the table named an epic all of whose tasks had been closed for
  days, and the session chose the work by itself.
- **The state of the epic is asked of the queue, and its silence is not a refusal.** The table says
  what was given; only the queue says whether it is still alive. The call goes to the network, and a
  tree without one keeps working.
- **A tree that declares no table is not judged.** It has nothing to divide, and a requirement
  invented for it would refuse every branch of a tree with one working copy.
- **The reader is one for the audit and for the guards.** Two readers of one table would diverge in
  silence: one would count the row an assignment, the other would not.

## What is out of scope

- Filling the table: the owner writes the rows, and a session only reads them.
- The fate of work taken without an order: whether to roll it back is decided by the owner.
- The composition of the epic and its end: that is the neighbouring subdomain.
- The text of the reply to the owner: it is invisible to a machine.

## Contract

The surface is the reader on the command line and two guards on tool calls. The reader prints the
assignment of this copy; the guards answer with a refusal, and the exit code says whether the call
is allowed.

### Refusal codes

Not applicable: the reader and the guards answer with a code and a text, not with named codes.

| What happened                                      | Code | What it says                                     |
| -------------------------------------------------- | ---- | ------------------------------------------------ |
| the epic of the work is the assigned one           | `0`  | nothing: the call goes through                   |
| the copy names itself in no way                    | `2`  | the copy is nameless, and the row is not found   |
| the table holds no row for this copy               | `2`  | the owner is asked for an assignment             |
| the row holds a dash instead of an epic            | `2`  | no epic is assigned to this copy                 |
| the epic of the work is not the assigned one       | `2`  | both numbers: the assigned one and the taken one |
| the assigned epic is closed                        | `2`  | the assignment outlived its epic                 |
| no table declared, no node, no answer of the queue | `0`  | nothing: there is nothing to judge by            |

## Data

The storage is two files. The table of assignments lies in the main branch and is written by the
owner. The name of the copy lies in a local file outside the history and is written once, when the
copy appears.

| Field            | Where          | What it holds                                          |
| ---------------- | -------------- | ------------------------------------------------------ |
| the name         | the local file | one short word, the name of this copy                  |
| the copy         | the table      | the same word, the first cell of the row               |
| the epic         | the table      | the number, with the word for tasks or bare, or a dash |
| the plan of work | the table      | the address of the plan of the epic, or a dash         |
| assigned         | the table      | the day the owner wrote the row                        |

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

The reader and the guards live in the package and are laid out into every consumer tree. What is its
own in each of them — the address of the table, the address of the name, the word for tasks and the
checks directory — is read from the settings of the tree.

## Decisions

- **The copy is identified by a short name in a local file, not by its path.** A path names the
  machine, and the table lies in the history where the machine is not written.
- **The table lies in the main branch, not next to the handover.** Next to the handover it is a file
  of one copy, and the assignment has to be read by all of them at once.
- **The refusal stands, and it is not a warning.** The owner chose the strict reading: a foreign
  epic and a stale assignment stop the work, they do not add a line to the output.
- **Creating an epic passes.** Refused there, the guard would stop the very call by which the owner
  hands over new work.

## Open questions

- `Q-WC-11` — the table is written by the owner by hand, and nothing checks that the name of a copy
  in it answers to a copy that exists. A row for a copy that is gone lives on, and a copy without a
  row is seen only when it takes work.

## History of changes

- 2026-09-17 — the subdomain was created: the assignment of an epic to a working copy, its reader
  and the refusal on the three calls that take work.
