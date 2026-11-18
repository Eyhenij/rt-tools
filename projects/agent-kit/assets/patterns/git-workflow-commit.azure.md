---
name: git-workflow-commit
kind: pattern
rule: git-workflow-push
description: Pattern of rule git-workflow-push. Load for creating a work item and a branch, commit and push — an item with area and iteration, state transition, merging two tasks into one, working as the machine account, skipping the document requirement. Opening a PR — pattern git-workflow-pr.
---

# Task, branch and commit

Pattern of the rule `git-workflow`. What must be true meanwhile — the law
`docs/constitution/delivery.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A work item is being created, and the edit starts from it.
- A branch is being created for it.
- A commit or a push is being prepared.
- The work moved to the next step, and the item moves to another state.

## First the work item, then the branch

Creation is four steps: the item, the number in its title, the assignee, the state `New`. Area and iteration are set right there: an item without them lies in the project root and does not reach the team board — created, but not in the work queue.

## Two tasks fixed by one edit

If it turned out along the way that the edit closes the neighbouring item too — that is one task, not two.

## The branch is created by a separate call

## The item state moves together with the work

Branch created — the item is no longer `New` but `Active`. PR opened — it awaits review.

## The commit is signed by the machine account

The token is read into a variable and not printed; author and committer are set by variables prefixed to `git commit` itself. `git config` will not do — the config is shared with the main tree and would rewrite the signature to the owner.

## The document goes in the same commit

`docs-guard` demands the pair and names it itself. The bypass — a line in the body, the reason is mandatory: The guard looks for the `Docs-skip` line in the command text only.

## Common misses

- **An audit right after adding answers "no" when the card already stands.**
