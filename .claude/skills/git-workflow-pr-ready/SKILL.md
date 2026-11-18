---
name: git-workflow-pr-ready
kind: pattern
rule: git-workflow-hosting
description: Pattern of rule git-workflow-hosting. Load when PRs are already open — leaving draft, handling a red run, bringing a chain to readiness, the order "finish what was handed over first, then take new work". Opening one PR — pattern git-workflow-pr; the chain order — git-workflow-stack.
---
<!-- rt-kit v0.37.0 · patterns/git-workflow-pr-ready.md · 6ad4f1619465 · правится надстройкой, не здесь -->

# Bringing a PR to readiness

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`. Opening a PR — pattern `git-workflow-pr`, the chain order —
`git-workflow-stack`, resolving one conflict — `git-workflow-merge`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A PR is open as a draft, and its run has ended.
- Several PRs are open at once, and it must be decided what comes first — finishing them or
  taking the next task.
- The PR's run is red, while the edit in the branch is green on its own.

## A draft is the state of the work, not its look

A draft says one thing: the work cannot be merged. The host locks its merge button, and the owner opening the list sees not "done" but "being done".

## Finish the handed-over first, then take new work

An open PR is work in flight: its run ages, its branch lags behind its base, its body describes the tree on the day it was written. All of this is cheap to fix today and expensive three tasks later.

## The state is read at once

What it is read with and how each field is read — pattern `git-workflow-freshness`; here only what is done with what was read. An empty run means two different things. On a base the pipeline wakes for it is handled on a par with a red one: the run is due and did not come.

## A red run is analysed by step, not by PR

The answer names the failed run and a link to it. Then the host is asked the name of the failed step — `gh api` on that run, selecting `select(.conclusion=="failure")` over its steps. The step name is the diagnosis.

## The cause is fixed in the lowest branch, then a wave upward

A cause shared by the whole chain is fixed once, in the lowest branch. It travels up by merging, not by rebasing: a rebase rewrites the history of branches already handed over, and the host closes the upper PRs as merged, though main has none of their edits.

## Common misses

The draft is not lifted because "the run is still going". The run ended an hour ago; its state is read, not the memory of it going. The next task is taken, and a dozen PRs stayed drafts. For the owner nothing is done. The red is fixed in the branch where it went red.
