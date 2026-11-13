---
name: queue-audit-read
kind: pattern
rule: queue-audit
description: Pattern of rule queue-audit. Load when the work queue audit has printed lines — running it, and the move that answers each kind of line.
---
<!-- rt-kit v0.37.0 · patterns/queue-audit-read.github.md · 046212328c97 · правится надстройкой, не здесь -->

# Reading the work queue audit

Pattern of the rule `queue-audit`. What must be true — the law `docs/constitution/delivery.md`.

## When to use

- The audit printed lines before a push, on taking a task or after a known merge.
- A line names a PR or a task, and the move for it is not obvious from the line.

## Running it

```bash
npm run check:board
```

Exit code 0 and no lines — the queue matches. Exit code 1 — every line is a discrepancy, and each
names its own move. The summary lines at the end are not discrepancies: they count what was read
and what was filtered out.

## What answers which line

| The line says                                        | The move                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| a PR is open and its task is not in review           | `npm run task:move -- <номер> in-review`                      |
| a task is in review and has no open PR               | open the PR, or move the task back to work                    |
| a PR lags its base by N commits — a summary line     | nothing: the host merges such a branch itself; ask it again before the merge |
| the PR conflicts with its base                       | merge the base in, resolve, push                              |
| no run on the tip                                    | a new commit, or close and reopen the PR as the line says     |
| a run pushed out of the queue                        | read that run's output, then rerun it — both commands are in the line |
| a draft with a green run                             | `gh pr ready <номер>`                                         |
| the PR has no reviewer                               | request the reviewer by a REST call — the call is in the line |
| the branch carries the task folder                   | take the folder apart by a commit of the same branch, or put the bypass line into the PR body |
| the rollout failed                                   | read the output of that rollout by the link in the line, fix the main branch, roll out again |
| the last run of the main branch is red               | fix the main branch before new work                           |
| a task and its epic name each other one way only     | link the task as a sub-issue, or name it in the epic plan     |
| a task folder with no open task                      | take it apart into the archive by a commit, rule `task-flow`  |
| production lags behind the main branch               | roll out, or name to the owner why the rollout waits          |
| a PR card stands on the board                        | remove the card: the board holds tasks, not PRs               |
| an open task stands in a closing column              | move it back to review or work: the merge closes it, not the column |

## Common misses

- **A rerun instead of the move.** The second run prints the same line: a line is answered by its
  move.
- **A summary line read as a discrepancy.** The count of PRs with a base other than the main branch
  is not a discrepancy: it names what the host does not do for them.
