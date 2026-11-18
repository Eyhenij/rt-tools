---
name: git-workflow-pr
kind: pattern
rule: git-workflow-hosting
description: Pattern of rule git-workflow-hosting. Load for opening an MR and everything around it — title format, draft and leaving it, the link to the task, reviewer and labels, a description sample, reading the MR state, the checklist. Creating the task and committing — pattern git-workflow-commit.
---

# The MR

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`. Creating the task, the branch and the commit — pattern
`git-workflow-commit`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- An MR is opened from a finished branch.
- The title, description or labels of an already open MR are edited.
- The draft is lifted, and the work is handed over for review.
- The MR state is read before anything is said about it to the owner.

## The task number stands in its title and in the MR title

One form for both — `[<КЛЮЧ>-<номер>] <текст>`.

## What is not ready to merge opens as a draft

A code edit is handed to a person by an open MR: a pushed branch is shown to them nowhere.

## The MR is attached to the task

The description starts with the link line.

## MR description sample

Six sections, and one order between them: the link line, what was done, the points, the goal, what confirms it, the remaining step.

## The MR state is read, not guessed

The edit commands answer with a zero code even when they did nothing: a token without rights to the project silently sets neither a label nor a reviewer.

## Answering under remarks

Remarks on an MR live in discussions, a thread each: a note on a line and a single note in the conversation are both among them.

## What is checked before the MR is published

- **The base is merged into this branch**
- **The branch holds only the edit it was created for**
- **No mock, no substituted response, no debug line**

## A chain of branches: the calls of this host

## Common misses

Misses about creating the task, the branch and the commit — pattern `git-workflow-commit`.
