# The epic in the delivery guards

**Status:** in force · **Revision:** 2026-09-21 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`, `work-conduct`
**Procedures:** none

## Why

An epic is handed in whole, and its tasks stand on its branch rather than on the main one. The
guards of delivery judged one branch at a time and knew nothing of that kinship: a task branched
from the main one left its epic half merged, and a request opened into the main branch took the
task past its epic.

The subdomain names how the epic is read from the state of a task, what base a task branch and its
request take, and when the request of the epic itself may open.

## Terminology

- **The branch of an epic** — the branch named by the number of the epic card, taken from the main
  branch; the branches of its tasks grow from it.
- **The declaration of an epic** — the line of the task body naming the number of its epic.
- **The base** — the ref a new branch grows from, or the branch a request is opened into.
- **The freshness** — the tip of the main branch lying inside the branch that is judged.

### What it is called in the interface

There is no interface: the guard is visible only to the executor — as the text of a refusal in
their own turn.

## Rules

- **The epic of a task is declared by one shape, and it is read in one place.** Three readers need
  it — the creating command writes the declaration, the queue audit judges the link both ways, the
  guard takes the base of a branch by it. Read in two places, one shape diverges silently: one side
  demands what the other does not see.
- **The declaration opens its line, and the same words inside a sentence are not one.** A task whose
  description said «семь задач эпика #1870» was read as belonging to that epic, and the opening of
  its request from the main branch was refused. The words alone cannot tell a declaration from prose
  about an epic; the place in the line can. Before it stands at most an ordinal or a list marker:
  the creating command writes the declaration as a line of its own, and a hand-written one lies
  among the items of a plan.
- **The state of a task carries the number of its epic.** The guard has no other road to the epic:
  the work queue holds neither branches nor kinship of cards, and a second asking for the body would
  cost an extra call and diverge from the first.
- **The base of a request about a task of an epic is the branch of that epic.** A request into the
  main branch takes the task past its epic: the epic is handed in without it, and the reviewer sees
  the edit next to everything lying in the main branch and not in the epic. A base not named at all
  is the same case — the hosting takes the default branch of the repository.
- **The freshness asked before a request of such a task is the epic's, not the main branch's.** The
  request goes into the epic, and it is the divergence with the epic that shows in the diff; the main
  branch reaches the task through the epic.
- **The request of an epic opens when the folders of all its tasks are taken apart.** The folder
  guard reads the folder of one task, by the name of the branch, and the branch of an epic has none
  of its own: every folder lying there belongs to a task whose work is not closed, and merged as it
  is the epic carries them into the main branch.
- **An epic is recognised by the label of its card, not by the shape of the branch name.** The branch
  of an epic and the branch of a task are named alike; the tree names the label itself, and one that
  has not named it is not judged by this condition at all.
- **The base of a new task branch is judged against the branch of its epic, not against the main
  branch.** A task branched from the main one leaves its epic half merged before the epic itself is
  handed in: the merge of the epic then carries nothing of that task, and the guard used to let this
  through in silence.
- **The freshness of the main branch moves to the branch of the epic together with the base.** Asked
  of the base of a task branch, it left the executor either waiting for the epic branch to catch up
  or taking the base from the main one — that is, doing what the previous statement forbids. Asked of
  the epic, it is fixed by one merge, and the branches of all its tasks get it at once.
  The tip is asked of the base too. A merge that has not reached the remote yet answers by the base:
  otherwise a check refusing the push of the epic closes the road to the task that fixes it.
- **The branch of an epic is looked for among the remote refs, and neither absence nor a second one
  is guessed at.** A branch living on one machine is a base nobody else has; two branches of one epic
  give no way to tell which the task grows from. Both are named by a refusal of their own.

## What is out of scope

- The readiness of the work going on now: the base of the branch, the signature of the commit and
  the state of the task are judged by the subdomain of the delivery guards.
- The stop at the end of an epic: the refusal to take new work after the last task lives in its own
  subdomain.
- The table of the epic for the owner and the audit of the link between a task and its epic: both
  read the same declaration, and both live next to the work queue.

## Contract

The surface is the helpers of the delivery guard called on the event of a command, and two checks
reading the declaration of an epic. The refusal arrives as the decision `deny` with the text of the
reason; silence means the command is allowed.

### Refusal codes

Not applicable: the guard answers with a decision and the text of a reason, not with a code.

## Data

There is no data of its own. The state of a task comes from the work queue helper, and the branch
of an epic is looked for among the remote refs of the tree.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The text of the refusal is in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Two branches of one epic in the remote are named by a refusal of their own: there is no telling
which of them the task grows from.

## Decisions

- **The epic lives as a helper next to the delivery guard, not inside it.** The guard already holds
  five subjects and stands near the length limit.
- **The subdomain was split off the delivery guards.** The scenario file of that subdomain outgrew
  the length limit, and the epic is a subject of its own: the kinship of branches, not the readiness
  of one branch.

## Open questions

None.

## History of changes

- 2026-09-21 — the subdomain was created: the rules about the epic and their scenarios moved here
  from the subdomain of the delivery guards, and the freshness of the main branch began to be asked
  of the base as well.
