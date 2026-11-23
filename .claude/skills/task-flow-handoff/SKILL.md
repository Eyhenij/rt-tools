---
name: task-flow-handoff
kind: pattern
rule: turn-conduct
description: Pattern of rule turn-conduct. Load when the session runs into window fill — choosing the stopping point, writing the progress, the shape of the handover and what the owner does with it. Not for returning to work in a new session — that is pattern task-flow-resume.
---
<!-- rt-kit v0.39.0 · patterns/task-flow-handoff.md · a43ae59b7a87 · правится надстройкой, не здесь -->

# Closing a session on window fill

Pattern of the rule `turn-conduct`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A reminder about window fill has come.
- The work does not fit into the session, and this became visible in advance.
- The session is interrupted for any other reason: the owner leaves, the machine is busy.

## What happens at the thresholds

The thresholds are watched by the window-fill guard; it takes the window size from the tree's setting — it cannot be derived from the session record.

## The stopping point

## The session closes with a handover, and the work state does not change

The cleanup of this step — main, the merged branches and the record of the handover itself — is done by the `next-session` command: it walks the step whole and names the path to the handover in its last line.

### The progress

The "Where we stand" section is rewritten, the decisions along the way and the session entry are appended. The form — pattern `task-flow-resume`.

### The commit

What was checked is committed at once, not stored up until the end of the task. The work is finished — a PR opens: pattern `git-workflow-pr`.

### The handover

- **Work**
- **Where to look**
- **Epic**
- **Done and the next step**
- **What to keep in mind**

### The path to the owner

The last line to the owner names where the handover lies. They paste nothing: the entry hook serves it to the next session on the same branch by itself.

## Common misses

- **The session closes at the second threshold instead of starting a new stage on it.**
- **The handover is written as a retelling of the conversation.**
