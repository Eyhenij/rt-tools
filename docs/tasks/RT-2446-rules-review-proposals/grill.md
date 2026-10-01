# Grill

## The owner request

> применяй предложения по правилам

The proposals are those the rules reviews brought after the tasks of epic RT-2370 — RT-2373,
RT-2366, RT-2365, RT-2367, RT-2364, RT-2398, RT-2399 — and the two of the incident analysis about an
amend that skipped the commit checks.

## What the tree already has

- The tree's own rules without a layout header: `ui-component-tests`, `rt-tools-storybook`,
  `rt-tools-styling`, `ui-component-tests-visual`. They are edited in place.
- Laid-out package resources: `rules/spec-driven.md`, `rules/doc-style.md`,
  `patterns/task-flow-start.md`, `patterns/testing-e2e.md`, `patterns/git-workflow-commit.github.md`.
  They are edited in the package source and laid out by `pnpm run agent-kit:sync`.
- A sample guard of git commands: `hooks/git-guard-discard.sh` with its scenarios.

## What the rules already say

- `agent-kit-source`: edit, build, lay out; a laid-out copy is not edited in place.
- `agent-kit-extend`: what is true only here goes to the override, by its own section.
- `spec-driven`: a statement of an audited section has a binding line in the companion.

## Questions and answers

No questions: the owner named the work whole, and every proposal names its file and text.

## Decisions

- **Every proposal is applied as the review wrote it,** after a check that what it describes is
  still true in the tree. A proposal the tree already answers is named in the progress and dropped.
- **The ban on the flag that skips the commit checks becomes a guard of the package.** It refuses
  the flag on `git commit` and `git push` and has no bypass: the owner's word forbids skipping the
  checks with no exception.

## What is left unclear

- Nothing blocks the work.
