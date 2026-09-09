# The audit of the work queue

**Status:** in force · **Revision:** 2026-09-08 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `delivery`
**Procedures:** none

## Why

The state of the work queue is read by a person from the outside, and it goes stale without a single
action by its author: a neighbouring work merged — and the rest of the requests fell behind that
second. The audit asks the hosting about what the list does not show — the run on the tip, the lag
behind the main branch, the link of a task with its epic — and names every divergence by a line.

What is checked in the tree itself — file length, uniformity, repeats — is a neighbouring subdomain:
those read the tree and need no network at all.

## Terminology

- **A divergence** — a state of the queue that a person would call wrong, named by one line.
- **The tip of a request** — the last commit of its branch: the run is asked about it, not about the
  branch.
- **The makeup of an epic** — the table of tasks in the epic plan, the column of task numbers.
- **The declaration of belonging** — the line in a task body by which it names its epic.
- **Whose eyes** — the account the state was read by: the machine record or the client's own.

### What it is called in the interface

The audit has no interface: it prints its lines to whoever ran it, and it speaks to the owner only
through the executor.

## Rules

- **A request opened not into the main branch is named by a line of its own.** It will have no run:
  the pipeline listens to requests into main and does not see events with another base. A line about a
  lost event would be wrong twice over: the event was not lost, and reopening will not bring it back.
  This is fixed by moving the base after the lower request is merged.
- **The answer of the work queue helper says whose eyes the state was taken by.** The helper reads a
  task by the token of the machine record, and a request without a token, as whoever the client is
  signed in under: the parse fields need rights over the accounts of the organisation, which the
  machine record was not given. By the output alone this is indistinguishable, and a tree where the
  machine record is limited by the hosting took a person's picture for a checked one. The field
  `viewer` in the answer is `machine` or `client`; the login is not printed, fetching it would take a
  second request to the network.
- **The plan of an epic is the document that carries the makeup, not the first path in the card.** A
  card names its decision next to its plan, and the decision has no table of tasks: read as the
  plan, it makes the makeup empty and every open task of the epic reads as not belonging to it —
  fourteen false lines at once, and the true ones drowned among them. Every path the body names is
  read, and the plan is the first of them that carries a table with a task column. None of the named
  documents on disk, and none of those on disk carrying the makeup, are two divergences of their
  own: one sends the reader to write the plan, the other to write the table.
- **Belonging to an epic is declared by a word about the task, not by a mention of the number.** The
  number of an epic stands in a task body in the reasoning, in a quoted refusal, in the list of what
  the work does not do — read as a declaration, each of those gave a false line, and a task that
  merely explained something about an epic was counted into it. The declaration is the shape the
  refusal itself dictates, and both sides of the link read that one shape: read differently, one
  side would demand what the other does not see.

- **The base of an open request about a task of an epic is judged by the audit.** The guard judges
  it at the opening, and only there: a request opened by a person from the hosting page goes past
  it. In the list of requests the base is not shown at all, and one going into the main branch past
  its epic looks like every other.
- **The branch of an epic is recognised by its number in the name of the base.** The audit reads the
  queue and does not go to the tree; a task and its epic never share a number.
- **An epic with no branch in the requests is a divergence.** Its branch is taken before the first
  of its tasks, and one not taken leaves every task standing on the main branch: the epic is then
  merged piece by piece, and there is nothing left to hand in whole. The card says nothing about a
  branch, and the queue holds no branch names.
- **An epic whose tasks are over and whose request is not open is a divergence.** Until it opens,
  the work of the whole epic lies outside the main branch while looking finished: the board is
  empty, and only the epic card stays open.
- **A task naming neither an epic nor the word of the owner is a divergence.** The guard refuses
  such a task at the creating command, and only there: a card made through the web goes past every
  guard, and one created before this order came in has neither line. By the queue it reads as
  ordinary work, and that nothing stands behind it shows nowhere.
- **The cargo of the trees is not judged by this line.** Those records are not tasks at all — no
  title with a number, no executor, no place on the board.

## What is out of scope

- The checks that read the tree without the network: a neighbouring subdomain.
- The guards standing on the road outward: the subdomain of the delivery guards.
- Whether a divergence is worth fixing now: the audit names it, the executor and the owner decide.

## Contract

The audit gets the open tasks and requests from the hosting and answers with lines of divergences and
a non-zero code where there is at least one.

### Refusal codes

Not applicable: the audit answers by its exit code and by the lines of its output.

## Data

There is no storage of its own: everything is read from the hosting and from the tree at the minute
of the run.

## Screens and states

There are no screens.

## Cross-cutting requirements

An unavailable hosting is not a divergence: the call is repeated, and a refusal that survived the
repeats is named as the state of the hosting, not of the queue.

### Locales

The lines are written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Every open task and every open request is judged apart, and the lines are printed in one list.

## Decisions

The plan of an epic is looked for among all the documents the card names, not by the first path: a
card names its decision next to its plan, and a decision carries no makeup.

## Open questions

There are no open questions.

## History of changes

- **2026-09-08** — the subdomain was split out of the checks of the tree: the scenario file had
  outgrown the length limit, and it is split by subject, not by moving the boundary. The scenario
  numbers were not recounted at the move: the number ties the scenario to its test title.
