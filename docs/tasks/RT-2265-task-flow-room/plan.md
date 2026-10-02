# Plan

**Task:** RT-2265 · **Branch:** RT-2265-task-flow-room
**Behaviour:** unchanged — rule texts only; the owner named work outside epics: «Задачи вне эпиков».

## Task footprint

| What      | Where                                            |
| --------- | ------------------------------------------------ |
| Rule      | `projects/agent-kit/assets/rules/task-flow.md`   |
| Cold part | `.claude/rt-kit/overrides/pitfalls/task-flow.md` |
| Companion | `.claude/skills/task-flow/implementation.md`     |

## What counts as done

- The article about a count bounded by the declaration stands in `task-flow` with a binding.
- Both laid-out halves keep at least 300 characters of room under the limit.

## Stages

### 1. Room and the article

- **Steps:**
    1. Compress explanations of the rule and add the article.
    2. Compress the tree's override of the cold part.
    3. Bind the article in the companion, build and lay out.
- **Readiness sign:** sizes under the limit with room, layout matches, specs bound.
- **Verified by:** `node tools/check-file-size.mjs` — «longer than the limit 0»; `pnpm run agent-kit:check` — «разложенное сходится с пакетом».

## What this work does not do

- The other findings of RT-2263: they went with their own tasks.
