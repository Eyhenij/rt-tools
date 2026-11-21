---
name: git-workflow-pr-body
kind: pattern
rule: git-workflow-hosting
description: Pattern of rule git-workflow-hosting. Load when the PR body is written or edited — the Closes line and how the task closes when the base is not the main branch, reviewer, assignee and labels by the opening call, the six sections of the body. Opening the PR itself — pattern git-workflow-pr.
---
<!-- rt-kit v0.37.1 · patterns/git-workflow-pr-body.github.md · 9a3f72487f56 · правится надстройкой, не здесь -->

# The PR body and the link to the task

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`. Opening the PR, the draft and its state — pattern
`git-workflow-pr`; a chain of branches — `git-workflow-stack`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- The body of a PR is written or rewritten — at the opening, after a merge into the branch, in
  the turn that lifts the draft.
- The base of the PR is an epic branch or the previous branch of a chain, and it has to be said
  how the task closes.
- Reviewer, assignee and labels are set on an already open PR.

## The PR is attached to the task

The body starts with the link line — by it the board fills the linked PRs field, and by it the task closes on the merge. The number in it is the branch's, copied rather than recalled; a tree that named the sample of the line in its profile, `RT_PULL_CLOSES_LINE`, gets the opening refused by the delivery guard without it.

## PR body sample

Six sections, and one order between them: the link line, what was done, the points, the goal, what confirms it, the remaining step. A section with nothing to say says so in words — an empty heading and a removed heading read alike and mean different things. The table of points comes from the reply of the role `product-strategist`: a sign not run is written as not run, and its point as not reached. The table of the goal comes from the reply of the role `goal-critic`. Both go in word for word, and the critic reads the finished body against the replies.

## Common misses

A second `Closes` line in one PR no longer closes a task: two tasks in one branch roll back only together. Either it is one task — and the second is absorbed — or two branches. Half a task that left by its own PR is a miss too: the body of such a PR starts with the words `Часть #<номер>` instead of `Closes`, and the task stays open. Work that does not fit one branch is split into tasks before the branch is created. Labels set by the PR title, not read from the task: the area is lost, and the board does not show that the edit touched the site too.
