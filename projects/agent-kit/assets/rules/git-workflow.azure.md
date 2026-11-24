---
name: git-workflow
kind: rule
law: delivery
description: Rule under the delivery law for a tree on Azure DevOps — branches, the epic, the chain and history. Load for a branch, a commit, a merge or a rebase. Its parts: git-workflow-queue, -push, -hosting. Patterns git-workflow-merge, -stack. Rollout — deploy-flow.
---

# Delivery — branches, the epic, the chain and history

Rule under the law `docs/constitution/delivery.md`, for a tree on Azure DevOps. Cold part: `pitfalls.md`, `pitfalls-2.md`.

## How the law applies here

- **A commit into the main branch is refused by the guard.**
- **A branch without a work item number opens no PR.**
- **Work begins with the epic, and the branch of a work item is taken from the epic branch.**
- **The PR of an epic into the main branch opens after all its work items are merged and their folders are taken apart.**
- **The epic branch carries the plan of the epic and the merges of its work items, and no edits of its own.**
- **The main branch is merged into the epic branch, and the epic branch into the branches of its work items — while the work runs, not before the hand-over.** A merge needing repairs goes into the epic branch alone, the repairs into the task branch from that tip. The folder is created in the task branch.
- **A wave of branches off one epic branch is checked by a trial merge, not one by one:** each is green alone, and they collide on what one branch cannot show.
- **The next work's branch is taken from the previous one while the chain is unbroken.**
- **A chain is merged bottom-up, and the order stands in every PR description.**
- **The lower branch of a chain does not rewrite history — neither `rebase` nor a force push.**
- **A divergence inside a chain is resolved by the one who branches.**
- **Unmet delivery conditions are named in one refusal.**
- **A condition known at the start of work is asked at the start.**
- **The base judged is the one named by the command, not the tip of the working copy.**
- **A branch without a work item number gets no delivery conditions.**
- **A commit lands with its final content, and a later commit of the same branch does not correct it.**
- **`--hard` is not taken to drop a commit — that is `--soft`.**
- **The main branch is taken by the remote ref — in words and in actions.**
