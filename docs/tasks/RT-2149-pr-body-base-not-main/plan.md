# Plan

**Task:** RT-2149 · **Branch:** RT-2149-pr-body-base-not-main
**Behaviour:** unchanged — владелец: правка образцов паттернов пакета и переопределения дерева; кода нет

## Task footprint

| What     | Where                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| Patterns | `projects/agent-kit/assets/patterns/git-workflow-pr.github.md`, `git-workflow-stack.md`, `git-workflow-merge.md` |
| Override | `.claude/rt-kit/overrides/patterns/git-workflow-pr.github.md` (new) — how a task closes in this tree             |
| Laid out | `.claude/skills/git-workflow-pr/SKILL.md`, `git-workflow-stack`, `git-workflow-merge`                            |

## What counts as done

- The PR body sample says how the task closes when the base is not the main branch: by the
  tree's closing pipeline where there is one, by the hand at the cleanup step where there is
  none — and the body of such a PR names which.
- The chain pattern no longer says the task closes by its `Closes` line; the cleanup step after
  the last merge of a chain closes the tasks left open, with a comment naming the PR.
- The merge pattern's step after a merge asks the task's state by a command.
- The override of this tree names `close-epic-tasks.yml` next to the PR body sample.

## Stages

### 1. The patterns and the override

- **What is done:** the paragraph and the second body sample in `git-workflow-pr.github.md`; the
  closing paragraph and the cleanup step in `git-workflow-stack.md`; the task-state check in
  `git-workflow-merge.md`; the override section naming this tree's pipeline; the layout.
- **Readiness sign:** the laid-out copies carry the new text, the layout matches, the texts pass
  the wording, glossary, size and path checks.
- **Verified by:** `pnpm run agent-kit:check | tail -1` — «сходится»; `node tools/check-file-size.mjs | tail -1` — «longer than the limit 0»; `node tools/check-glossary.mjs | tail -1` — «no divergences».

## What this work does not do

- It does not touch the audit's finding about a base other than main: RT-2150.
- It does not carry the closing pipeline into the package: the sample names it as the tree's
  technique.
