---
name: task-flow-cycle
kind: pattern
rule: task-flow-owner
description: Pattern of rule task-flow-owner. Load when an edit of a rule, a hook, a check or a role is chosen and when its result is judged. The worst driver from the report, one metric and its direction in the task, the verdict from the next report, and the plain name of an edit that moved nothing.
---
<!-- rt-kit v0.41.1 · patterns/task-flow-cycle.md · 01522bad094e · правится надстройкой, не здесь -->

# The improvement cycle

Pattern of the rule `task-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- An edit of a rule, a hook, a check or a role is being chosen.
- A task about such an edit is being written.
- The result of such an edit is being judged.

An edit chosen by opinion has no way to be proved wrong, so nobody learns whether it helped. A repair
of something broken is not an improvement and needs no cycle: its task names the failure instead.

## Order

### The report opens the cycle

The cycle begins with the numbers, not with an idea of what to improve. The worst driver of the main metric is named with its numbers: which resource, how many refusals, runs or minutes. A tree that sends its numbers reads the same in the receiver over all its copies.

### One task, one metric, one direction

- **The direction is a word, not a target.**
- **Two metrics mean two tasks.**
- **The edit does not raise its own numbers.**

### The next report gives the verdict

- **The executor who made the edit gives no verdict.**
- **A movement below the noise is not a result.**

### An edit that moved nothing is named so

The report says «не сдвинулось», with the two numbers. It is not reworded as a partial success and not explained by the days being unusual. Such an edit is reverted or kept by a decision of the owner, and the next cycle starts from the report again.

## Common misses

- **A metric picked after the edit.**
- **Reading one's own tree as the package.**
- **A rising count taken for a worse rule.**

## The report in this tree

The package is built here from its sources and is not installed, so `npx agent-kit` finds no
command. The report is taken from the build:

```bash
pnpm run build:agent-kit && node dist/agent-kit/bin/agent-kit.js metrics --days 30
```
