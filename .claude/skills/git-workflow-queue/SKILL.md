---
name: git-workflow-queue
kind: rule
law: delivery
description: Rule under the delivery law for a tree on GitHub — the task key, the board and one's own open requests as a queue. Load when a task is created and the board is edited. Pattern git-workflow-freshness.
---
<!-- rt-kit v0.39.0 · rules/git-workflow-queue.github.md · d0da86123fc0 · правится надстройкой, не здесь -->

# Delivery — the task, the board and the queue

Rule under the law `docs/constitution/delivery.md`, for a tree on GitHub. Cold part: `pitfalls.md`; articles whole — `git-workflow`, `pitfalls-2.md`.

## How the law applies here

- **The task key is set once, and all three name forms derive from it.**
- **An unset key refuses work with the queue on the spot.**
- **A created task is confirmed by the work queue's answer, not by the creation command's output.**
- **The visibility of what was created is checked by the side it is meant for.**
- **A refusal is read before it is bypassed by a second way.**
- **The branch number and the PR title number are checked on the spot, the task state — by the board.**
- **The task column moves in the same motion as the work.** Branch created — in progress, PR opened — in review; by the move command, not GraphQL from memory.
- **The epic card moves by the same command, on the epic number, at two moments.** First task taken — in progress; the epic's PR into main opens — in review.
- **A task left in the first column opens no PR.**
- **An open task standing in a closing column is a discrepancy.**
- **The board holds tasks, not PRs about them.**
- **Tasks fixed by one edit are merged before the merge.** The second is erased with its number; what it lacks goes into the first.
- **One's own drafts are judged all at once, not only the checked-out branch's.** Signs: a green run on the tip and a folder taken apart.
- **One's own open PRs are reread in three places: before a push, on taking a task and after every known merge.**
- **One's own conflicting PR is fixed by the turn's first action, and no new work is taken before that.** Work: a task, a branch, a column move, a PR.
- **A conflicting PR of a neighbouring session is not one's own.** One's own is the one this working copy led; a neighbour's is named to the owner, and work is taken as usual.
- **The board is edited by a GraphQL query by the board id, not by the owner's name.**
