# Plan

**Task:** the number is given by the creation command · **Branch:** fix/epic-stop-consent until then
**Behaviour:** unchanged — the owner ordered a repair of the checks, «исправляй … в проверках»; application code is not touched

## Points

- **A:** the end-of-epic guard refuses a task creation the owner agreed to twice. The queue audit
  tells to merge the base in on any lag, promises a line about a PR without a reviewer and prints
  none, and two of its lines have no move in the table of moves.
- **This task reaches:** the owner's «yes» in a menu releases the creation of a task of an epic
  without a repeated question. The audit names a plain lag in a summary line and exits zero on it.
  A PR without a reviewer gets a line. Every one of the three lines has a move.
- **Sign:** `bash projects/agent-kit/tests/epic-stop-guard.test.sh` and
  `bash projects/agent-kit/tests/checks-board.test.sh` — zero failures; the executor sees it.
- **Milestone G of the epic:** a new version of `@rt-tools/agent-kit` on npm carries the revised
  texts of the four families of laws.
- **Metric:** нет: the guard refused a lawful call, and the audit said what the rules do not.

## Task footprint

| What  | Where                                                                             |
| ----- | --------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/epic-stop/`, `docs/specs/agent-kit/checks/`                 |
| Laws  | `docs/constitution/work-conduct.md`, `docs/constitution/delivery.md` — read only  |
| Rules | `.claude/skills/queue-audit/`, `.claude/skills/queue-audit-read/`                 |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/assets/checks/`, `tools/` |

## What counts as done

- The call that creates a task of an epic passes after a menu answer that agrees to a task and
  names no number, with a notice of a background command standing after the answer.
- The same call is refused after a menu refusal, after an off-topic answer and after a message of
  the owner that refuses.
- The audit exits zero on an open PR that lags its base without a conflict and names the lag.
- The audit prints a line for an open PR with no requested reviewer and no review by another.
- The table of moves has a row for the failed rollout, for the task folder in the branch of a PR
  and for the PR without a reviewer, and its row about the lag says what the audit prints.
- `pnpm run agent-kit:check` exits zero.

## Stages

### 1. The end-of-epic guard reads the owner's consent

- **Steps:**
    1. Edit the consent reading in the guard source
    2. Add the scenarios and their texts in the spec
    3. Build the package and lay it out
    4. Create the task and take the branch by its number
- **Readiness sign:** the scenario suite of the guard has no failures, and the task of this work
  exists in the queue
- **Verified by:** `bash projects/agent-kit/tests/epic-stop-guard.test.sh` — the line of the total
  names zero failures

### 2. The queue audit says what the rules say

- **Steps:**
    1. Print the lag as a summary line
    2. Print the line about a PR without a reviewer
    3. Bring the table of moves, the rule and the companion to the audit
    4. Edit the scenarios of the audit and their texts in the spec
    5. Build the package and lay it out
- **Readiness sign:** the scenario suites of the audit have no failures
- **Verified by:** `bash projects/agent-kit/tests/checks-board.test.sh` — the line of the total
  names zero failures

### 3. The texts and the closing

- **Steps:**
    1. Bring the epic plan to what was done
    2. Run the checks of the tree
    3. Take the folder apart into the archive
- **Readiness sign:** the checks of the tree exit zero, the folder is gone, the record lies in the
  archive
- **Verified by:** `pnpm run agent-kit:check` — exit code zero

## What this work does not do

- The checks for the other articles of the rule `queue-audit` held by memory — task RT-3249.
- The author of an open PR is not judged by the audit: the line about the reviewer covers its
  consequence.
- The guard of the grill that refuses a third menu after two recommended answers is left as it is.
