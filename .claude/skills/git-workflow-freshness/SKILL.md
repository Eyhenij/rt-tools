---
name: git-workflow-freshness
kind: pattern
rule: git-workflow-queue
description: Pattern of rule git-workflow-queue. Load before a push, when taking a task and after every known merge — reading all your open PRs at once, telling lag apart from a conflict in files, checking the local head against the hosting.
---
<!-- rt-kit v0.41.1 · patterns/git-workflow-freshness.md · 32f330bba7e7 · правится надстройкой, не здесь -->

# Freshness of open PRs

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`. Resolving one conflict — pattern `git-workflow-merge`, a chain
of branches from one base — `git-workflow-stack`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

Three places, and in each the reading is mandatory:

- before a push — the base's tip may have moved while the work went on;
- when taking a new task — the earlier PRs stayed open and will not remind of themselves;
- after every merge that became known — it made all the others lag at once.

## What is read

By one command over all one's own open PRs, not the one whose branch is checked out now: `UNKNOWN` means "not counted yet" and reads as "ask again in a few seconds", not as "no conflicts".

## A dispute in files is told apart from lag

The host's mark says one thing — "cannot press". What exactly to fix is answered by a tree merge, and it answers offline: Zero — the branch merely lags, and the host merges it itself. Above zero — a dispute in files, and each is resolved by file kind: pattern `git-workflow-merge`.

## What is done with what was found

For a branch with a dispute the order is one: merge the base in → run the gate set → push → reread the state from the host. Rereading is part of the work, not a report on it.

## The local tip is checked against the one on the host

A branch caught up in the working tree and not pushed does not count as work: a person sees the old state. Diverged — the push is not done, and that is the first thing fixed.

## Common misses

The PR state read from memory of the previous turn: between turns a person merged a neighbouring work. `UNKNOWN` read as "no conflicts" — the host was still counting. The PR of the current branch was read, and the abandoned ones stayed lagging: all one's own open ones are asked.
