---
name: git-workflow-commit
kind: pattern
rule: git-workflow-push
description: Pattern of rule git-workflow-push. Load for creating a task and a branch, commit and push — creating a task with a list label, moving across board lists, merging two tasks into one, working as the machine account, skipping the document requirement. Opening an MR — pattern git-workflow-pr.
---

# Branch, commit and MR

Pattern of the rule `git-workflow`. What must be true meanwhile — the law
`docs/constitution/delivery.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A task is being created, and the edit starts from it.
- A branch is being created for a task.
- A commit or a push is being prepared.
- The work moved to the next step, and the task moves to another list of the board.

## First the task on the board, then the branch

Creation is four steps: the issue, the number in its title, the assignee, the label of the board's first list.

## Two tasks fixed by one edit

If it turned out along the way that the edit closes the neighbouring task too — that is one task, not two.

## The branch is created by a separate call

## The task list moves together with the work

Branch created — the task is no longer in the first list but in progress. MR opened — it awaits review.

## The commit is signed by the machine account

The token is read into a variable and not printed; author and committer are set by variables prefixed to `git commit` itself. `git config` will not do — the config is shared with the main tree and would rewrite the signature to the owner.

## The document goes in the same commit

`docs-guard` demands the pair and names it itself. The bypass — a line in the body, the reason is mandatory: The guard looks for the `Docs-skip` line in the command text only.

## Common misses

- **An audit right after adding answers "no" when the card already stands.**
