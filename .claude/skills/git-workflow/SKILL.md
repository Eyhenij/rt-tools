---
name: git-workflow
kind: rule
law: delivery
description: Rule under the delivery law for a tree on GitHub — branches, the epic, the chain and history. Load for a branch, a commit, a merge or a rebase. Its parts: git-workflow-queue, -push, -hosting. Patterns git-workflow-merge, -stack. Rollout — deploy-flow.
---
<!-- rt-kit v0.39.1 · rules/git-workflow.github.md · 0dba9c444c4d · правится надстройкой, не здесь -->

# Delivery — branches, the epic, the chain and history

Rule under the law `docs/constitution/delivery.md`, for a tree on GitHub. Cold part: `pitfalls.md`, `pitfalls-2.md`.

## How the law applies here

- **A commit into the main branch is refused by the guard.**
- **A branch without a task number opens no PR.**
- **Work begins with the epic, and the branch of a task is taken from the epic branch.**
- **The PR of an epic into the main branch opens after all its tasks are merged and their folders are taken apart.**
- **The epic branch carries the plan of the epic and the merges of its tasks, and no edits of its own.**
- **The main branch is merged into the epic branch, and the epic branch into the branches of its tasks — while the work runs, not before the hand-over.**
- **A wave of branches off one epic branch is checked by a trial merge, not one by one:** each is green alone, and they collide on what one branch cannot show.
- **The next work's branch is taken from the previous one while the chain is unbroken.**
- **A chain is merged bottom-up, and the order stands in every PR body.**
- **`--hard` is not taken to drop a commit — that is `--soft`.**
- **The lower branch of a chain does not rewrite history — neither `rebase` nor a force push.**
- **A divergence inside a chain is resolved by the one who branches.**
- **Unmet delivery conditions are named in one refusal.**
- **A condition known at the start of work is asked at the start.**
- **The form of a branch name is judged by the tree the command runs in.**
- **The base judged is the one named by the command, not the tip of the working copy.**
- **A branch without a task number gets no delivery conditions.**
- **The main branch is taken by the remote ref — in words and in actions.**
- **A commit lands with its final content, and a later commit of the same branch does not correct it.**
- **An edit brought to a commit is brought to the host in the same turn.**
- **A second working copy is for reading, and the call goes from the copy the session stands in.**
- **The working tree is not emptied for a tool run.** The tool runs on a second copy.

## The language of the record of an edit

- **A commit description is written in the language of the tree.** Russian here: a git hook judges
  the presence of a Russian letter; a pipeline record is held by the release templates.
