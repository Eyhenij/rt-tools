# A conflicting request of one's own

**Status:** in force · **Revision:** 2026-08-29 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`, `work-conduct`
**Procedures:** none

## Why

A conflict arrives in a handed-in request by someone else's merge, without a single action of its
author: a person can no longer merge it, and the request stands until the author notices. There was
nothing to notice it by — the demand to re-read one's own open requests is written as text and held
by memory, while the delivery guards judge the readiness of the work going on now and ask about the
neighbouring requests nowhere.

The subdomain names what counts as taking new work, when the taking is refused and why the
uncertainty of the hosting does not count as a conflict.

## Terminology

- **A request of one's own** — an open request created by the machine record of the tree.
- **Conflicting** — the one the hosting named a conflict for outright; uncertainty does not belong
  here.
- **Taking work** — creating a task, creating a branch for a task, moving the column into work,
  opening a request.
- **Fixing a conflict** — pulling, merging main, committing, sending, moving between branches.

### What it is called in the interface

There is no interface: the guard is visible only to the executor — as the text of a refusal in their
own turn.

## Rules

- **Taking new work is refused while at least one open request of one's own is marked
  conflicting.** New work fixes no conflict: it adds to the queue one more branch that grows from
  the same main and will fall behind the same way.
- **Four commands count as work: creating a task, creating a branch for a task, moving the column
  into work and opening a request.** One thing unites them — after each of them there are more
  conflicts, not fewer.
- **Fixing a conflict is refused by nothing.** A guard refusing the fix would lock the tree tight:
  the very thing it refuses over would become unfixable too.
- **Only a plain "conflicts" is judged.** The hosting counts mergeability anew after every edit of
  the main branch and until the end of the count answers with uncertainty; read as a conflict, it
  would refuse the work at every fresh tip.
- **The requests of the machine record of the tree count as one's own.** A tree that did not name it
  is not asked at all: the account the hosting client is signed in under most often belongs to the
  owner, and their requests are not for the executor to fix.
- **The refusal names the number and the branch of every conflicting request.** A refusal naming
  only the ban is unfixable: the executor has several requests, and which of them stopped is not
  visible from the ban.
- **A branch without a task number does not count as taking work.** A local branch for a trial is
  lawful: it will not go into main, because no request will be opened from it.
- **Moving a column is judged together with the name of the column.** Moving into review and into
  the closed ones is the end of work, not its start.
- **Silence of the poll refuses no work.** No network, no machine record, no work queue helper — the
  tier is skipped: refusing work on the silence of the network would mean stopping it every time
  there is nothing to check it against.

## What is out of scope

- The readiness of the work going on now — the subdomain of the delivery guards: there the base of
  the branch, the signature of the commit, the number and the state of the task are judged.
- The lag of the open requests behind main — it is counted by the work queue audit, not by a guard.
- Taking the conflict itself apart — the technique `git-workflow-merge`, not a check.

## Contract

The surface is the helper of the delivery guard called on the event of a command, and the entry
point of the work queue helper giving back one's own conflicting requests as a JSON line. The
refusal arrives as the decision `deny` with the text of the reason; silence means the command is
allowed.

### Refusal codes

Not applicable: the guard answers with a decision and the text of a reason, not with a code.

## Data

There is no data of its own: the state of the requests is asked of the hosting by the same work
queue helper as the state of a task.

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

Not applicable: the guard judges one command of one turn.

## Decisions

- **The branch lives as a helper next to the guard, not inside it.** The delivery guard came close
  to the length limit, and it already holds five subjects; by the same technique the task folder and
  the commit signature stand next to it.
- **The sign of taking work is read from the text of the command and stands first.** The poll goes to
  the network, and paying for it on every shell command is not allowed.

## Open questions

None.

## History of changes

- 2026-08-29 — the subdomain was created: the subject is separate from the readiness of the work
  going on, and the scenario file of the neighbouring subdomain outgrew the length limit.
