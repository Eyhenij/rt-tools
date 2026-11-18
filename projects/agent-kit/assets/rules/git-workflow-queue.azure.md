---
name: git-workflow-queue
kind: rule
law: delivery
description: Rule under the delivery law for a tree on Azure DevOps — the task key, the board and one's own open requests as a queue. Load when a task is created and the board is edited. Pattern git-workflow-freshness.
---

# Delivery — the task, the board and the queue

Rule under the law `docs/constitution/delivery.md`, for a tree on Azure DevOps. Cold part: `pitfalls.md`; articles whole — `git-workflow`, `pitfalls-2.md`.

## How the law applies here

- **A created work item is confirmed by the work queue's answer, not by the creation command's output.**
- **The branch number and the PR title number are checked on the spot, the work item state — by the board.**
- **The state of a work item moves in the same motion as the work.**
- **The epic card moves by the same command, on the epic number, at two moments.** First task taken — in progress; the epic's PR into main opens — in review.
- **A work item left in the initial state opens no PR.**
- **The board holds work items, not PRs about them.**
- **A lagging state is found by the queue audit, not by eye.**
- **Work items fixed by one edit are merged before the branch merge.**
- **Work that one session cannot close is marked in two places, and they are audited.**
- **The state set is taken from the project process, not assigned by the rule.**
