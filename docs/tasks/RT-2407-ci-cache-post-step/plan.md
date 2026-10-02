# Plan

**Task:** RT-2407 · **Branch:** RT-2407-ci-cache-post-step
**Behaviour:** unchanged — only the CI workflow file changes; the owner named work outside epics: «Задачи вне эпиков».

## Task footprint

| What     | Where                                                                |
| -------- | -------------------------------------------------------------------- |
| Pipeline | `.github/workflows/ci.yml`                                           |
| Rules    | `.claude/skills/git-workflow/` (the article about shared home paths) |

## What counts as done

- pnpm of this tree's CI is installed into this runner's own tool directory, not into the home directory.
- The PR run computes the store path under that directory and passes whole.

## Stages

### 1. pnpm in the runner's own directory

- **Steps:**
    1. Give `pnpm/action-setup` in `ci.yml` a `dest` under `runner.tool_cache`, with a comment naming the reason.
- **Readiness sign:** the workflow file parses and names the new `dest`.
- **Verified by:** `pnpm exec prettier --check .github/workflows/ci.yml` — «All matched files use Prettier code style!»

## What this work does not do

- The workflows of the other projects on this machine: they belong to their trees.
