---
name: task-flow-resume
kind: pattern
rule: task-flow-plan
description: Pattern of rule task-flow-plan. Load when returning to unfinished work in a new session. What is already in the context, what not to ask the owner, how to edit "Where we stand", how to record a decision along the way and a stage revision. Not for starting work — that is pattern task-flow-start.
---
<!-- rt-kit v0.37.0 · patterns/task-flow-resume.md · 7aa699498072 · правится надстройкой, не здесь -->

# Returning to unfinished work

Pattern of the rule `task-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`.

Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

**Requires:** `hooks/task-context-load.sh`

## When to use

- A session is begun on a branch `<КЛЮЧ>-*`, and work in it was already going.
- The work is interrupted — it has to be left so that the next session picks it up without the
  owner.

## What has already come into the context

The hook `task-context-load.sh` gave the plan and the progress whole at session start, and the grill of the request — by path.

## A stage sign is checked by a run, not by a list made by reading

What is counted by eye diverges from what is there.

## What not to do

- **Do not ask the owner about what is recorded.**
- **Do not start over what is marked done.**
- **Do not re-derive the recorded from the code.**
- **Do not edit the plan.**

## Entry from a session handover

- **The work-conduct rule and this pattern — as the first move**
- **The branch and the work state are read in the tree**
- **The numbers from the handover are recounted**

## Entering the session: the state line is checked against the tree

Check "Where we stand" against the tree.

## State `этап-идёт`: the stage is done and marked in the progress

## State `работа-отдана`: the next task is taken by the same move

The task is closed, the PR is open and waits for the owner — the session does not end on it.

## State `влито`: the epic plan learns of the merge

A person merged the PR, and the epic plan still names the task as in work. The move: merge the PRs of the chain bottom-up, mark the merged tasks by the branch of the next one. The last task of the epic to merge has no next branch: its merged PR counts by itself, and a mark is never put on a task whose PR is open or closed unmerged.

## Common misses

- **Confirmation is command output or a measurement, not a retelling.**
- **Pre-existing red is kept apart from one's own.**
