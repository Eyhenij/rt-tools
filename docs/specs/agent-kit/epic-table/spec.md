# The table of the epic's tasks assembled by a command

**Status:** in force · **Revision:** 2026-09-09 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/board/spec.md`
**Laws:** `work-conduct`, `verifiability`
**Procedures:** none

## Why

The owner asks where the work stands, and the answer is a table of the epic's tasks. Its shape is
written down — the rule of the status report and the pattern next to it — but the table itself is
assembled by the session: it remembers which calls to make, in which order and how to fold the
answers into cells. The session that has just started remembers none of that, and the price of the
answer is a dozen calls picked by hand.

What is assembled by memory diverges by session. One answer names the run on the head, another the
last run of the branch; one lists all the tasks of the epic, another only the one that runs now. The
owner reads them as answers about the same work and sees them disagree.

The subdomain names the command: the order of the tasks comes from the epic plan, the state of each
one from the hosting, and the output is the ready answer — the paragraph about the epic and the
table under it.

## Terminology

- **An epic** — work wider than one branch: a card in the work queue with the epic label and a plan
  next to it.
- **The epic plan** — the record outside the task folder that holds the order of the tasks: the
  table whose column is named for the task.
- **The composition of the epic** — the rows of that table: the ordinal number, the task number and
  what the task is about.
- **The state of a task** — what the hosting answers about it: the column of the queue, the request
  about it and the run on the head of that request.
- **The answer** — what the command prints: a paragraph about the epic and the table of its tasks.

### What it is called in the interface

There is no interface: the answer is the output of a command, and the session carries it to the
owner as it is.

## Rules

- **The table is assembled by a command, not by the memory of the session.** A session that has just
  started remembers no order of calls, and one that has worked for hours remembers it differently
  from the previous one: the answers about one and the same work then disagree.
- **The order of the tasks is taken from the epic plan, not from the work queue.** The order is
  assigned by the plan, and the numbers of the cards do not run in it: sorted by number, the table
  shows an order nobody agreed on.
- **The epic is taken from the current branch, and the argument names another one.** The branch gives
  the task, the body of the task declares the epic, the body of the epic names the plan. Standing on
  a foreign branch, one asks about the epic by its number.
- **What the task is about is taken from the plan, and its name from the card.** The plan says in one
  phrase what the task does, the card carries the wording agreed with the owner: neither replaces the
  other.
- **A task named by the plan and missing from the queue stands in the table by a row of its own.**
  Skipped, it takes the count of the remaining work with it, and the reader counts the epic shorter
  than it is.
- **The cell of the state carries a number from the answer of the hosting.** The number of the
  request, the outcome of the run on its head, the column of the queue — the word "done" says
  nothing about who checked it.
- **The run is asked by the head of the request, not by the branch.** The list of the runs of a
  branch answers about the last commit that started one, and that is not always the head: a green run
  of a commit gone by reads as a green head.
- **A closed task is named merged and asks the hosting for nothing else.** Its branch has gone into
  the main one, there is no request and no run behind it any more.
- **A refusal names the next move and does not print an empty table.** A branch without a task, a
  card without a plan, an unreachable hosting — each of them the reader mistakes for "the epic is
  empty" unless the command says which of them it is.
- **The command asks and does not move.** No column, no draft, no card: the answer to the question
  "where is the work" leaves the queue exactly as it was.

## What is out of scope

- The stop at the end of the epic and the line about waiting for orders: neighbouring work of its
  own, and it stands on this table.
- The audit of the work queue: it looks for divergences, and this command answers a question. What
  the audit finds does not go into the table.
- The showing of epics on a screen: the table is read in the answer to the owner, not in the admin
  application.

## Contract

The surface is a command with one optional argument — the number of the epic. The answer goes to the
standard output; the exit code says whether the table was assembled.

### Refusal codes

Not applicable: the command answers with an exit code and a text, not with named codes.

| What happened                          | Code | What it says                                           |
| -------------------------------------- | ---- | ------------------------------------------------------ |
| the epic is found and the plan is read | `0`  | the paragraph about the epic and the table of tasks    |
| the branch carries no task number      | `1`  | how to name the epic by an argument                    |
| the task declares no epic              | `1`  | where the belonging to an epic is declared             |
| the card of the epic names no plan     | `1`  | that the card must name the plan, and which card it is |
| the hosting cannot be asked            | `1`  | that the state is unknown, and it is not invented      |

## Data

There is no storage of its own. The composition of the epic is read from the plan named by the card
of the epic; the state of the tasks — from the work queue, the requests and the runs of the hosting.

## Screens and states

Not applicable: there are no screens. The states of one row of the table:

| The state of the task                | What stands in the cell                                    |
| ------------------------------------ | ---------------------------------------------------------- |
| not created in the queue             | not created                                                |
| created and lies in the first column | created, no branch                                         |
| taken into work                      | the column of the queue                                    |
| handed over by a request             | the number of the request, the draft mark, the run outcome |
| closed                               | merged                                                     |

## Cross-cutting requirements

### Locales

Not applicable: the output is single-language, and it is the language of the owner.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The command lives in the package and is laid out into every consumer tree. What is its own in each
of them — the word for tasks, the board, the directory of the epic plans — is read from the settings
of the tree, not written into the command.

## Decisions

- **The command lives in the layer of checks, not next to the sending of cargo.** Everything the
  cell is filled with already lies in the laid-out work with the queue: the client of the hosting,
  the board, the runs. Rejected: a command of the package itself — it has neither the client nor the
  settings of the board.
- **The composition of the epic is read by the same reader as the audit of the links.** A second
  reader of the same table would diverge from the first in silence: one would count a row a task, the
  other would not.
- **The state is asked for every task, and the answers are not cached.** A table assembled from
  yesterday's answers is worse than none: it is read as the state of today.
- **A row without a card is not skipped.** The count of the remaining work is exactly what the owner
  reads the table for.

## Open questions

- `Q-WC-9` — the paragraph above the table names why the epic exists, and the command takes it from
  the plan by the heading. A plan whose first section is worded otherwise loses the paragraph, and
  nothing says so.

## History of changes

- 2026-09-09 — the subdomain was created: the table of the epic's tasks is assembled by a command,
  not by the memory of the session.
