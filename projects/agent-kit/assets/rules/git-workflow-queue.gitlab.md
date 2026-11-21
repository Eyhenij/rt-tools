---
name: git-workflow-queue
kind: rule
law: delivery
description: Rule under the delivery law for a tree on GitLab — the task key, the board and one's own open requests as a queue. Load when a task is created and the board is edited. Pattern git-workflow-freshness.
---

# Delivery — the task, the board and the queue

Rule under the law `docs/constitution/delivery.md`, for a tree on GitLab. Cold part: `pitfalls.md`; articles whole — `git-workflow`, `pitfalls-2.md`.

## How the law applies here

- **A created task is confirmed by the work queue's answer, not by the creation command's output.**
- **The branch number and the MR title number are checked on the spot, the task state — by the board.**
- **The list of a task moves in the same motion as the work.**
- **The epic card moves by the same command, on the epic number, at two moments.** First task taken — in progress; the epic's PR into main opens — in review.
- **A task left in the first list opens no MR.**
- **The board holds tasks, not MRs about them.**
- **A lagging list is found by the queue audit, not by eye.**
- **Tasks fixed by one edit are merged before the branch merge.**
- **Work that one session cannot close is marked in two places, and they are audited.**
- **A task is moved across lists by editing its labels.**
