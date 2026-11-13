# Plan

**Task:** RT-3299 · **Branch:** RT-3299-worktree-own-branch
**Behaviour:** unchanged — the owner ordered a rule text about working trees; no application code is touched

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** the rules name how a new working tree is unfolded (`git worktree add --detach`), and say
  nothing about whose word starts it, which branch it stands on and what must not lie in it.
- **This task reaches:** a session asks the owner before a new tree, puts it straight on its own
  branch from a fresh `main`, creates the task inside it and leaves nothing in the main copy.
- **Sign:** the companion `.claude/skills/git-workflow/implementation.md` carries the four
  statements; the owner reads them in the PR.
- **Milestone G of the epic:** none — work outside an epic by the owner's word.
- **Metric:** нет: the rules were silent about the tree and its branch, and RT-3287 lost an hour on it.

## Task footprint

| What  | Where                                       |
| ----- | ------------------------------------------- |
| Rules | `.claude/skills/git-workflow/implementation.md` |

## What counts as done

- The section about a new working tree in the companion of `git-workflow` names the owner's
  consent, the own branch from a fresh `main`, the task created inside it, and no old or foreign
  branch in it.

## Stages

### 1. The rule text

- **Steps:**
    1. Rewrite the section about a new working tree in the companion
    2. Run the text checks
- **Readiness sign:** the section holds the four statements and the text checks are green.
- **Verified by:** `npm run check:docs` — exit zero

## What this work does not do

- It does not edit the laid-out rule `git-workflow` itself: the four statements belong to this
  tree's companion.
- It does not change the push guard, which reads the profile of the main copy: that is a defect of
  the package hooks, named in the incident analysis.
