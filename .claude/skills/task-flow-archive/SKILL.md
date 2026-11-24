---
name: task-flow-archive
kind: pattern
rule: task-flow-handover
description: Pattern of rule task-flow-handover. Load when the texts are up to date and the task folder is taken apart by the last commit before the PR opens. The move to the archive, the work queue audit, the rules review of the closed work and what to do with the findings.
---
<!-- rt-kit v0.39.1 · patterns/task-flow-archive.md · 609f7102de83 · правится надстройкой, не здесь -->

# Taking the task folder apart and the rules review of the work

Pattern of the rule `task-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`. What comes before it — merging the agreement and bringing the
texts up to date — and what comes after it — opening the PR and lifting the draft — pattern
`task-flow-close`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- The agreement is merged, the domain texts are up to date, and the task folder is taken apart by
  the last commit of the branch — before the PR opens, not after approval.

## State `разбор-кончился`: the task folder is taken apart

The taking-apart here is one's own step, not someone else's. The state name speaks of the task folder taken apart in the next step — not of the PR a reviewer reads, nor of the owner's request whose grill began the work.

### Work that takes apart someone else's folder takes apart two

Such work has a folder of its own — it is created like everyone else's, no exception. Both are removed by the last commit, and the order between them is one: first someone else's, then one's own.

## State `папка-разобрана`: the work queue audit

## State `работа-отдана`: the work is reviewed by the rules — in the background, right after the PR

- **The digest is gathered before the launch**
- **The role goes to the background**
- **The returned findings are accepted in one turn**

## Review findings land next to the epic plan and wait for the owner

The role's reply lives in the conversation and dies with it, so it lands on disk at once. The executor writes it: the role writes no files.

## Common misses

- **The folder is taken apart before the PR opens — later nobody remembers it.**
- **The folder is taken apart by the last commit, after the push gate has passed whole.**
- **No plan on disk after the taking-apart, and the folder is not assembled again.**
