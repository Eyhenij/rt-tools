---
name: git-workflow-merge
kind: pattern
rule: git-workflow
description: Pattern of rule git-workflow. Load when the base of a branch is merged into it and a conflict is resolved — the merge order, handling by file kind, checking what was appended against the work queue, re-reading the body of the open request. Branch and commit — pattern git-workflow-commit.
---
<!-- rt-kit v0.37.1 · patterns/git-workflow-merge.md · 6ab93fea87ee · правится надстройкой, не здесь -->

# Merging the base of a branch into it

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`.

**The calls here are given with the GitHub client.** A tree on another host reads them as the
form and takes the command from its own client: field and subcommand names differ between
clients, and what is asked is one. The match is named by the edition of the delivery rule laid
out in that tree. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- The PR is marked conflicting, and it must be brought back to a mergeable state.

## Order

## A commit is carried over by a cherry-pick

The branch the commit was meant to leave with is gone: merged, removed by the host or created under the wrong task.

## What the branch appended is seen only from the divergence point

## What the branch appended is checked against the work queue, not carried over by default

## Checks after the resolution

## The body of the open PR is reread after the merge

The PR described the tree on the day it was written.

## The task of a merged PR is asked, not assumed closed

The host closes the task by the `Closes` line only when the base is the default branch.

## A green run ages together with the base

A run speaks about the base it went on.

## Other people's task folders arrive with the main branch

## Common misses

- **A merge carries edits of files, not edits of an application.**
