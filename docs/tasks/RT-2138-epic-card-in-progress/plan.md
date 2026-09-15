# Plan

**Task:** RT-2138 · **Branch:** RT-2138-epic-card-in-progress
**Behaviour:** unchanged — владелец: правка законов и правил слоя, кода приложений нет

## Task footprint

| What   | Where                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------- |
| Laws   | `projects/agent-kit/assets/laws/delivery.md`, `projects/agent-kit/assets/laws/work-conduct.md`           |
| Rules  | `projects/agent-kit/assets/rules/git-workflow.github.md`, `projects/agent-kit/assets/rules/task-flow.md` |
| Copies | `docs/constitution/`, `.claude/skills/git-workflow/`, `.claude/skills/task-flow/` — by the layout        |

## What counts as done

- The delivery law says the epic card's state matches the epic's work the same as a task's.
- The rule `git-workflow` names the command and the two moments: first task taken → in progress,
  epic PR opened → in review; its flow diagram says the same.
- The rule `task-flow` carries the move in the state table and in the article on the first task.
- The laid-out copies match the package: `pnpm run agent-kit:check` answers «сходится».

## Stages

### 1. The law: the epic card's state

- **What is done:** one article in `delivery.md` next to «The state of a task in the work queue
  matches what is happening to it», and one in `work-conduct.md` next to the article on every
  task getting its card.
- **Readiness sign:** both files hold the word «epic card» in a bold article opening; the law
  names no command and no column name.
- **Verified by:** `grep -c 'epic card' projects/agent-kit/assets/laws/delivery.md projects/agent-kit/assets/laws/work-conduct.md` — both counts above zero (before the stage: 0 and 0).

### 2. The rules: the technique

- **What is done:** `git-workflow.github.md` — an article with the command on the epic number
  and the two moments, the table row on the queue state, the flow node; `task-flow.md` — the
  state table row of `эпик-заведён` and the article on the epic branch; both name the missing
  guard in «What of the law is not here».
- **Readiness sign:** the prose check passes both files; the size check stays at zero over the
  limit.
- **Verified by:** `node tools/check-file-size.mjs | tail -1` — «longer than the limit 0 … no new
  ones» (the same line before the stage); `pnpm run agent-kit:sync` lays the copies out.

### 3. The layout and the checks

- **What is done:** `pnpm run agent-kit:sync`, then `npm run check:docs`, `node tools/check-glossary.mjs`.
- **Readiness sign:** the copies under `docs/constitution/` and `.claude/skills/` carry the new
  articles; the audit answers «сходится».
- **Verified by:** `pnpm run agent-kit:check | tail -1` — «sync --check: разложенное сходится с
  пакетом» (the same line before the stage, on the old text).

## What this work does not do

- No guard: the check that refuses a task branch while the epic card stands in the first column
  is work of its own; the rules name the gap.
- No closing of tasks on a merge into the epic branch and no board view of epics only: that is the
  board flow the owner asked about separately, and it waits for their word.
