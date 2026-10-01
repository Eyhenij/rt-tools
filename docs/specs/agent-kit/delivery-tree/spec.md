# The tree a command runs in

**Status:** in force · **Revision:** 2026-10-01 · **Scenario prefix:** `SC-AK`
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
- **A second copy** — another working copy of the same repository: the same shared `.git`
  directory under another root.
- **Another repository** — a tree of execution whose shared `.git` directory is not the session's.
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
- **A second working copy is for reading, and a sending call goes from the copy of the session.**
  The gate of the checks runs its set where the session was started: from a second copy a foreign
  tree is judged, and the contribution actually leaving passes unchecked.
- **A second copy is told by the shared `.git` directory, not by the root.** The root of another
  repository differs from the session root always: judged by the root, a session of one tree
  could not send a branch into another repository at all.
- **A sending call in another repository is not judged by the gate of the checks.** The set of
  this tree says nothing about a foreign one.
- **The task is asked of the work queue of the repository the command runs in.** A branch created
  in another repository carries the number of a task of that repository; the session's queue does
  not have it or has a different one under it.
- **A second copy of the same repository is asked of the session's profile and queue.** The shared
  `.git` directory is one, and so are the work queue and the profile.
- **A request opened in another repository is judged by the branch of that repository.** The
  branch of the session tree names a different task or none.
- **A tree that declared no profile is not judged by the form at all.** A foreign tree is not
  accountable to this guard, and a refusal on a lawful name has no bypass.

## What is out of scope

- The readiness of the work going on now — the subdomain of the delivery guards.
- The freshness of the base and the commit signature at branch creation — they are asked of the
  session copy; a base named for another repository is unknown there and is not judged.

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

- **The form of the name, the task and the branch are judged by the foreign profile; the base is
  not.** The task key and the work queue belong to the repository the command runs in: asked of the
  session, the number of a lawful branch pointed to a task that is not there. The base and the
  signature stay with the session copy: no case of a refusal on them has come up, and the guard is
  at its length limit.
- **The subdomain lives apart from the delivery guards.** The scenario file of the neighbouring
  subdomain outgrew the length limit, and the subject is separate.

## Open questions

None.

## History of changes

- 2026-10-01 — a second copy is told by the shared `.git` directory. A push into another repository
  is no longer refused as a call from a second copy, and the task of a branch in another repository
  is asked of that repository.
- 2026-09-10 — the subdomain was created together with the tier: a lawful name of a neighbouring
  tree used to stop the work whole.
