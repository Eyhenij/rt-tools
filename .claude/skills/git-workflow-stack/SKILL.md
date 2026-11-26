---
name: git-workflow-stack
kind: pattern
rule: git-workflow
description: Pattern of rule git-workflow. Load when pieces of work follow one another or more than two branches already stand on one base — chained branching from the previous one, the PR base, merging bottom-up, re-merging the base on an actual conflict. One conflict — pattern git-workflow-merge.
---
<!-- rt-kit v0.41.0 · patterns/git-workflow-stack.md · 127e9eb7a980 · правится надстройкой, не здесь -->

# A stack of PRs from one base

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`. Resolving one conflict — pattern `git-workflow-merge`,
opening one PR — `git-workflow-pr`.

**The calls here are given with the GitHub client.** A tree on another host reads them as the
form and takes the command from its own client: field and subcommand names differ between
clients, and what is asked is one. The match is named by the edition of the delivery rule laid
out in that tree. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- More than two branches are created from one base, and all wait for a merge.

## A chain: branch from the previous one, not from the epic branch

A stack from one base is what to avoid.

## A chain PR stands on the previous branch

## What is not done in a chain

- **The lower branch's history is not rewritten.**
- **A chain is not merged from the middle.**

## The unit of work is a merged PR, not an open one

## The price of a stack grows quadratically

## The base is merged in on an actual conflict, not on a schedule

A lagging branch and a conflicting one are different things.

## A stack without PRs lags silently

The call above knows only open PRs.

## An index everyone appends to is declared a union

## The merge order is set in advance and named to the owner

## A wave of branches is checked by a trial merge

## Common misses

All PRs opened at once because the branches were ready.
