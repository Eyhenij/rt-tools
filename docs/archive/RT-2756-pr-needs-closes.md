# Grill

Cargo record: postmortem `2026-10-10-epic-pr-bodies-without-closes-and-numbers-from-memory.md`.

## The owner request

> параллельно бери в работу новые предложения и замечания из приёмника

## What the tree already has

- The analysis: PRs #2746, #2749 and #2751 went out without a `Closes #<number>` line, and the tasks
  stayed open after the merge. Only the work queue audit named it, after the merge
  (`checks/check-board.github.mjs` in the package).
- The delivery guard already reads the PR body when it opens: the tree names the mandatory section
  by `RT_PULL_BODY_SECTION`, and a body without it is refused. The task number is known there from
  the branch name.
- In this tree the `Closes #<number>` line stands in every PR body whatever the base: the tree's own
  pipeline closes a task merged into an epic branch.

## Decisions

- **The tree names the sample of the link line, the package substitutes the number.** The keyword
  differs by hosting and by tree, so the default stays silent, like the section sample. Rejected:
  a fixed `Closes` in the package — a tree on another hosting would be refused for a lawful body.
- **The body is read once for both requirements.** Rejected: a second parse next to the first —
  two copies of one expression diverge.
