---
name: git-workflow-pr
kind: pattern
rule: git-workflow-hosting
description: Pattern of rule git-workflow-hosting. Load for opening a PR and everything around it — title format, draft and leaving it, linking to the work item, the reviewer, a body sample, reading the PR state, the checklist. Creating the item and committing — pattern git-workflow-commit.
---

# The PR

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`. Creating the task, the branch and the commit — pattern
`git-workflow-commit`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A PR is opened from a finished branch.
- The title, body or labels of an already open PR are edited.
- The draft is lifted, and the work is handed over for review.
- The PR state is read before anything is said about it to the owner.

## The work item number stands in its title and in the PR title

One form for both — `[<номер>] <текст>`. The number stands in the title itself, not only in the body: the PR list shows no bodies.

## What is not ready to merge opens as a draft

A code edit is handed to a person by an open PR: a pushed branch is shown to them nowhere.

## The PR is bound to the work item at creation

## PR body sample

Six sections, and one order between them: the link line, what was done, the points, the goal, what confirms it, the remaining step.

## The PR state is read, not guessed

The edit commands answer with a zero code even when they did nothing. So after them the PR is reread: The owner is told what was read, not what was ordered.

## Answering under remarks

Remarks on a PR live in threads, and the client has no command for them, so they go through the REST call of the same client.

## What is checked before the PR is published

- **The base is merged into this branch**
- **The branch holds only the edit it was created for**
- **No mock, no substituted response, no debug line**

## A chain of branches: the calls of this host

The order is the pattern `git-workflow-stack`, with one difference: here the upper PR is retargeted before the lower one completes, not after.

## Common misses

Misses about creating the task, the branch and the commit — pattern `git-workflow-commit`.
