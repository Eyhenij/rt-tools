# Grill

## The owner request

> Чиню сам (Recommended)

The answer to the question who shortens the delivery guard. PR #2605 (RT-2603) of 7 October 2026
made `git-guard-delivery.sh` 502 lines long in the package source and 503 in the laid-out copy,
over the code limit of 500. The push gate refuses every branch that carries main, and the branches
of RT-2550 and RT-2551 stood ready to open.

## What the tree already has

- `node tools/check-file-size.mjs` on `origin/main` names both files: the source and the copy.
- The source is `projects/agent-kit/assets/hooks/git-guard-delivery.sh`; the copy under
  `.claude/hooks/` is laid out by `pnpm run agent-kit:sync`.
- The guard is covered by `projects/agent-kit/tests/git-guards.test.sh`.

## What the rules already say

- The file length limit is split, not raised: a line in the size allowlist is refused by the check
  itself.
- A red main is fixed before new work is taken.
- A laid-out copy is not edited in place: edit the source, build, lay out.

## Questions and answers

**Who shortens the file — me, or the author of #2605?**
«Чиню сам (Recommended)»

## Decisions

- **Three lines out of the source without a change of behaviour** — the excess is three lines of
  the copy. Rejected: a line in the size allowlist — the check refuses it by its own text.
- **A task outside the epic by the owner's word** — the work is not part of RT-2542.

## What is left unclear

- Nothing.
