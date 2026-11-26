---
name: git-workflow-pr
kind: pattern
rule: git-workflow-hosting
description: Pattern of rule git-workflow-hosting. Load for opening a PR and everything around it — title format, draft and leaving it, reading the PR state, the checklist. The link to the task, reviewer, labels and the body sample — pattern git-workflow-pr-body; the task and the commit — git-workflow-commit.
---
<!-- rt-kit v0.40.0 · patterns/git-workflow-pr.github.md · 0ef790de481e · правится надстройкой, не здесь -->

# The PR

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`. Creating the task, the branch and the commit — pattern
`git-workflow-commit`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A PR is opened from a finished branch.
- The title, body or labels of an already open PR are edited.
- The draft is lifted, and the work is handed over for review.
- The PR state is read before anything is said about it to the owner.

## The task number stands in its title and in the PR title

One form for both — `[<КЛЮЧ>-<номер>] <текст>`. The number stands in the title itself, not only in the body: the PR list shows no bodies, and in the task list the number otherwise has to be found by eye in the left column.

## A draft where a run is waited for, ready where it is not

A code edit is handed to a person by an open PR: a pushed branch is shown to them nowhere. An open PR reads as an invitation to merge, so unfinished work opens it as a draft — the host locks a draft's merge button itself.

## The link to the task and the body

The `Closes #<номер>` line, the reviewer, the assignee and the labels set by the opening call, the six sections of the body and how the task closes when the base is not the main branch — pattern `git-workflow-pr-body`.

## The PR state is read, not guessed

The calls that set the reviewer, labels and assignee answer with a zero code even when they did nothing: GitHub silently drops a review request on the PR author. So after them the PR is reread: The author here is `<бот>`.

## Answering under remarks

Remarks arrive on a PR in three places: a comment on a line, the text of a review and a comment in the conversation.

## What is checked before the PR is published

- **The base is merged into this branch before the PR opens**
- **The branch holds only the edit it was created for**
- **No mock, no substituted response, no debug line**
- **The document goes in the same commit.**

## Common misses

Misses about creating the task, the branch and the commit — pattern `git-workflow-commit`; about the link line, the labels and the body — `git-workflow-pr-body`.
