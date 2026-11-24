---
name: task-flow-close
kind: pattern
rule: task-flow-handover
description: Pattern of rule task-flow-handover. Load when bringing work to readiness — merging the product agreement into the domain spec, bringing the domain texts up to date with what was done, opening the PR as a draft or ready by its base and leaving draft.
---
<!-- rt-kit v0.39.1 · patterns/task-flow-close.md · f84187a7f322 · правится надстройкой, не здесь -->

# Closing the work

Pattern of the rule `task-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- The stages of the plan are closed.

## State `этапы-кончились`: the agreement merges into the domain spec

By one of the last commits of the branch, before the PR opens. By then the code is written, so the `file:symbol` bindings are known — the rule enters the domain spec checkable at once.

## State `этапы-кончились`: the domain texts are brought up to what was done

- **"What of the law is not here" in a rule.**
- **"What is not included" in a domain spec.**
- **"Where it lives" in a rule.**
- **A statement of a companion about what the tree does not have.**

## State `папка-разобрана`: the work is handed in by a PR

The folder is taken apart and pushed, the work is cleaned up behind — and the PR opens.

### The section on the remaining step is written in the PR body, not appended later

It stands there from the minute of opening. Saying it aloud is not enough, and the requirement does not hold on that alone.

### The messages to the owner, and the run between them

Where the pipeline wakes for this base both are mandatory, and the order between them is one. Neither replaces the other: the first says the work is handed in and what it waits for, the second — that it is ready.

### An edit after remarks goes without a plan on disk

The review returned remarks, or the run went red — it is fixed in the same branch.

## State `задачи-эпика-кончились`: the epic is handed in by a request into the main branch

Every task of the epic is merged into its branch and every folder is taken apart — only then does the epic branch get a request of its own, and its base is the main branch.

## Common misses

- **The texts are edited before the folder is taken apart:**
- **A decisions entry repeating a rule's article word for word is no reason next to it.**
- **The PR body stays older than the taking-apart.**
