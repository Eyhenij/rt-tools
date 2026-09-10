# The tree a command runs in

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`
**Procedures:** none

## Why

A session works in a neighbouring tree by the direct word of the owner: the task is created there,
the number and the short name are right, and the branch name is lawful by that tree's key. The
delivery guard compared such a name with the key of the tree the session stands in and refused — a
refusal with no lawful move at all, and the work stopped whole: neither a branch nor a commit. The
same refusal caught an edit of an outside file: it was enough for a neighbouring tree's branch name
to reach the command text as a line of a document.

The subdomain names where the tree of execution is taken from and what is judged by its profile.

## Terminology

- **The tree of the session** — the one the session was started in; its profile is loaded by every
  guard.
- **The tree of execution** — the one the command names by a move at the start of the call.
- **The form of a branch name** — the profile function answering whether the name is fit.

### What it is called in the interface

There is no interface: the guard is visible only to the executor — as the text of a refusal in their
own turn.

## Rules

- **The form of a branch name is judged by the profile of the tree the command runs in.** The task
  key of a neighbouring tree is its own, and a name lawful there says nothing about this tree.
- **The tree of execution is taken from the command itself.** A move at the start of the call names
  it; there is nowhere else to learn it from before the call runs.
- **Without a move the tree of the session answers.** That is the former behaviour, and the whole
  of it stays for the ordinary case.
- **A tree that declared no profile is not judged by the form at all.** A foreign tree is not
  accountable to this guard, and a refusal on a lawful name has no bypass.

## What is out of scope

- The readiness of the work going on now — the subdomain of the delivery guards.
- The state of the task and the column — they are asked of the work queue of the tree the session
  stands in, and a neighbouring tree has a queue of its own.

## Contract

The surface is the helper of the delivery guard called on the event of a command. The refusal
arrives as the decision `deny` with the text of the reason; silence means the command is allowed.

### Refusal codes

Not applicable: the guard answers with a decision and the text of a reason, not with a code.

## Data

There is no data of its own: the profile of the tree of execution is read from its files.

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

- **Only the form of the name is judged by the foreign profile.** The state of the task and the
  freshness of the base are asked of the work queue and the remote of this tree, and a neighbouring
  tree has its own.
- **The subdomain lives apart from the delivery guards.** The scenario file of the neighbouring
  subdomain outgrew the length limit, and the subject is separate.

## Open questions

None.

## History of changes

- 2026-09-10 — the subdomain was created together with the tier: a lawful name of a neighbouring
  tree used to stop the work whole.
