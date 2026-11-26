---
name: queue-audit
kind: rule
law: delivery
description: Rule under the delivery law for a tree on GitHub — the work queue audit. Load when editing the audit and its modules, or when its line has to be read. Names what the audit judges about columns, open PRs, runs and epics. Pattern queue-audit-read.
---
<!-- rt-kit v0.40.0 · rules/queue-audit.github.md · 8761b96077a2 · правится надстройкой, не здесь -->

# Work queue audit — how it works here

Rule under the law `docs/constitution/delivery.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it. A task, a branch and a PR are the rule `git-workflow`.

## What it is called here

| In the law | Here |
| --- | --- |
| the work queue | the project board; a task is an issue on it |
| a discrepancy of the queue | a line of the audit; a run with lines exits with code 1 |
| the audit run | `npm run check:board` |

## How the law applies here

- **A lagging column is found by the queue audit, not by eye.** Both ways: an open PR with the task
  not in review, and review with no open PR.
- **A branch with an open PR lags behind its base silently.** The guard judges the base only at
  opening, and the run does not see what merged after. The audit counts the lag in a summary line
  and refuses nothing: the host merges a lag without a conflict itself.
- **The link between a task and an epic is read by the audit both ways.** The audit also judges the
  base of a task's PR: a base past the epic branch and its chain takes the task out of the epic.
- **Work that one session cannot close is marked in two places, and they are audited.** The board
  label and the sessions line of the epic plan say the same; only what legitimately does not split is marked.
- **The tip of an open PR without a run is seen by the work queue audit, unless the pipeline does
  not wake for its base.** There it is silent about that PR; one summary line counts all such PRs,
  and it is not a discrepancy.
- **A run pushed out of the pipeline queue gets a separate audit line.** It looks failed though it
  never checked the branch; the step count tells them apart.
- **The last run of the main branch is judged by the audit too: red and pushed out get lines of
  their own.** The merge itself is checked by nobody; a pipeline asleep on a push to main is named.
- **A draft with a green run on its tip is an audit discrepancy.** The host locks its button.
- **A conflicting open PR is a work queue audit discrepancy.** The host shows the mark only inside
  the PR.
- **An open PR without a reviewer is a work queue audit discrepancy.** A request to the author does
  not count, so a PR opened by a person shows too; the author apart is not judged.

## What of the law is not here

The audit reads the queue and the host, not the tree: it does not judge a PR body, and sees a
column moved by hand only on the next run.

## Patterns

- `queue-audit-read` — running the audit and acting on each of its lines.
