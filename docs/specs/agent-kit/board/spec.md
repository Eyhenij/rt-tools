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

- **A request whose base is not the main branch is not counted as lacking a run.** The pipeline
  listens to requests into the main branch and sees no event with another base, so a request into
  an epic branch lawfully has no run at all — that is the order of handing in, and the audit is
  silent about it. A line here would stand on every task of every epic and teach to skip the
  audit; and the advice to move the base is wrong outright: the base of a task request stays the
  epic branch to the merge.
- **What such a base means is named once, by one line with both consequences.** No run will come
  to those requests, and the host closes no task on their merge — the tree closes those by a
  pipeline of its own or by the hand. Named apart, the second consequence was read by nobody: the
  line about the run was taken as the whole of it, and the tasks of a chain stayed open after
  their merges. The line counts the open requests with such a base, is not a divergence, and a
  tree without such requests gets no line.
- **The answer of the work queue helper says whose eyes the state was taken by.** The helper reads a
  task by the token of the machine record, and a request without a token, as whoever the client is
  signed in under: the parse fields need rights over the accounts of the organisation, which the
  machine record was not given. By the output alone this is indistinguishable, and a tree where the
  machine record is limited by the hosting took a person's picture for a checked one. The field
  `viewer` in the answer is `machine` or `client`; the login is not printed, fetching it would take a
  second request to the network.
- **The creating command and the audit read the path to the plan by one and the same move.** A
  value declared by one side of an exchange is not computed anew by the other: the audit took the
  document carrying the makeup, while the command took the first path in the card body, and a card
  naming a law before its plan wrote that law into every task of the epic. The branch of the epic
  was then read from the law and came back empty. Both sides answered as usual, and the miss showed
  only by reading a created task. The makeup is demanded of the audit and not of the command: the
  command creates the tasks, and their numbers land in the plan after — demanded at creation, the
  requirement would refuse the very first task of every epic.
- **The plan of an epic is the document that carries the makeup, not the first path in the card.** A
  card names its decision next to its plan, and the decision has no table of tasks: read as the
  plan, it makes the makeup empty and every open task of the epic reads as not belonging to it —
  fourteen false lines at once, and the true ones drowned among them. Every path the body names is
  read, and the plan is the first of them that carries a table with a task column. None of the named
  documents on disk, and none of those on disk carrying the makeup, are two divergences of their
  own: one sends the reader to write the plan, the other to write the table.
- **The number of a task of the makeup is read from the task column, not from the whole row.** The
  state column of a plan names the request the task was merged by, and a number taken from the whole
  row turns that request into a task of the epic: the audit then says the plan names tasks that are
  no sub-issues of the card, and points at requests. The column read is the one by which a row
  counts as a makeup row at all — the one whose header carries the word for a task.
- **The plan of a live epic is read out of the branch of that epic when the disk does not carry
  it.** A plan lives in the branch of its epic until the epic is merged whole, and the working tree
  stands on whichever branch the session happens to be on: read off the disk alone, every live epic
  comes back as a card pointing into emptiness, and the true divergences drown among those lines.
  The branch is looked for by the name `<КЛЮЧ>-<номер эпика>-` among the local and the remote refs,
  and the reading stays without the network — the same move the branch folders check already makes.
  A plan neither on disk nor in any branch stays a divergence: there the card really does point into
  emptiness.
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
- **A branch carrying no task folder is a divergence, and the branch of an epic is not.** The folder
  travels in by the very first commit: an uncommitted one lets edits through for the whole of the
  work, and the refusal arrives at the exit of a turn, when there is nothing left to fix with. An
  epic branch has no folder by design — it carries the plan of its epic and the merges of its tasks
  — and is named like a task branch to the letter, so by the name alone it gave such a line for
  every epic of the tree, forever.
- **A branch is recognised as an epic's by the plan inside that branch, not by the plan on disk.**
  This part of the audit is the only one reading the local repository, without the network, and the
  epic label lives at the hosting. The plan of a young epic lives only in its own branch, while the
  working tree stands on whichever branch the session happens to be on: read off the disk, the sign
  answers by where the session stands rather than by what the branch is.
- **An epic with no branch in the requests is a divergence.** Its branch is taken before the first
  of its tasks, and one not taken leaves every task standing on the main branch: the epic is then
  merged piece by piece, and there is nothing left to hand in whole. The card says nothing about a
  branch, and the queue holds no branch names.
- **An epic whose tasks are over and whose request is not open is a divergence.** Until it opens,
  the work of the whole epic lies outside the main branch while looking finished: the board is
  empty, and only the epic card stays open.
- **An open task whose card stands in a closing column is a divergence.** A closing column says the
  work is merged, and a merge closes the task itself: a card left there with the task open says two
  different things at once. By the board such work reads as finished, and nobody looks at it again.
  Seven tasks stood so for two days after their merges, and the audit named none of them: it judged
  the column of a task awaiting review and knew no other. The tree names its closing columns itself;
  unnamed — the line is not printed at all.
- **A task naming neither an epic nor the word of the owner is a divergence.** The guard refuses
  such a task at the creating command, and only there: a card made through the web goes past every
  guard, and one created before this order came in has neither line. By the queue it reads as
  ordinary work, and that nothing stands behind it shows nowhere.
- **The cargo of the trees is not judged by this line.** Those records are not tasks at all — no
  title with a number, no executor, no place on the board.
- **A list the hosting gives in pages is read whole, not by its first page.** An epic outgrows one
  page long before it is closed, and the tail then reads as missing: the audit names a linked task
  unlinked. The cost is not the false line but the habit — it stands in every run, the eye stops
  reading it, and a real divergence rides past together with it.

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

- 2026-09-17 — an open task in a closing column is a divergence: rule, scenario `SC-AK-1112`, the binding.
- 2026-09-15 — one line names both consequences of a base other than the main branch: rule, scenario `SC-AK-1107`, the binding.
- **2026-09-08** — the subdomain was split out of the checks of the tree: the scenario file had
  outgrown the length limit, and it is split by subject, not by moving the boundary. The scenario
  numbers were not recounted at the move: the number ties the scenario to its test title.
