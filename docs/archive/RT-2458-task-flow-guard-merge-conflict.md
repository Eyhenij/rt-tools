# Grill

## The owner request

> подтяни влитое

> сделай правильно

> Починить сторожа (Recommended)

Context: merging `origin/main` into the epic branch `RT-2353-one-kit-part-2` stopped on conflicts
in application code (`showcase-labels.ru.ts`, `rt-kit-labels.en.ts`, a showcase snapshot). The epic
branch carries no task folder by the rule — it holds merges, not edits — and the task-flow guard
refused every resolution: «there is no plan». The owner chose to fix the guard rather than to
resolve the conflicts past it.

## What the tree already has

- The guard `projects/agent-kit/assets/hooks/task-flow-guard.sh` demands a task folder named after
  the branch, a plan and a declared state; its scenarios are in
  `projects/agent-kit/tests/task-flow-guard.test.sh`, the spec is `docs/specs/agent-kit/work-guard/`.
- The rule `git-workflow` says main is merged into the epic branch while the work runs; the
  pattern `git-workflow-merge` names conflict resolution by file kind. Nothing in either lets the
  resolution through the guard.
- A precedent of the same shape: archive pruning is exempt (SC-AK-879) because the epic branch has
  no folder and must not have one.

## Questions and answers

**Fix the guard or resolve past it?**
«Починить сторожа (Recommended)».

## Decisions

- **A file in conflict while a merge is in progress is resolved without a task folder** — the
  resolution is the merge itself, not an edit of the product, and the epic branch has no folder by
  the rule. Rejected: exempting the epic branch whole — it would open edits of its own in it, which
  the rule forbids.
- **Only the files in conflict, and only while the merge stands** — a file resolved and added, or
  any other code file, is judged as before.
