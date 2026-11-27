---
name: git-workflow-commit
kind: pattern
rule: git-workflow-push
description: Pattern of rule git-workflow-push. Load for creating a task and a branch, commit and push — the creation command with all four steps, moving the column, merging two tasks into one, working as the machine account, skipping the document requirement. Opening a PR — pattern git-workflow-pr.
---
<!-- rt-kit v0.42.0 · patterns/git-workflow-commit.github.md · 33643abc2718 · правится надстройкой, не здесь -->

# Task, branch and commit

Pattern of the rule `git-workflow`. What must be true meanwhile — the law
`docs/constitution/delivery.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A task is being created, and the edit starts from it.
- A branch is being created for a task.
- A commit or a push is being prepared.
- The work moved to the next step, and the task moves to another column of the board.

## First the task on the board, then the branch

Creation is four steps: the issue, the number in its title, adding to the board, the first column.

## Two tasks fixed by one edit

If it turned out along the way that the edit closes the neighbouring task too — that is one task, not two.

## The branch is created by a separate call

## The task column moves together with the work

Branch created — the task is no longer in `📋 Backlog` but in progress. PR opened — it awaits review.

## The commit is signed by the bot

The token is read into a variable and not printed; author and committer are set by variables prefixed to `git commit` itself.

## The files of one's own work are named one by one

The working tree is one, and there can be several works in it: someone else's uncommitted folder, a draft left behind, an edit of a neighbouring session.

## The document goes in the same commit

`docs-guard` demands the pair and names it itself. The bypass — a line in the body, the reason is mandatory: The guard looks for the `Docs-skip` line in the command text only.

## Common misses

- **An amend goes through the same hooks as a commit.**
- **An audit right after adding answers "no" when the card already stands.**
