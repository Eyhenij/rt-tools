# Plan

**Task:** RT-2147 · **Branch:** RT-2147-audit-main-run
**Behaviour:** unchanged — владелец: правка проверки пакета и её описания, кода приложений нет

## Task footprint

| What  | Where                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------- |
| Code  | `projects/agent-kit/assets/checks/board-runs.github.mjs`, `projects/agent-kit/assets/checks/check-board.github.mjs` |
| Tests | `projects/agent-kit/tests/lib-board.sh`, `projects/agent-kit/tests/checks-board.test.sh`                            |
| Specs | `docs/specs/agent-kit/board/{spec,scenarios,implementation}.md`                                                     |
| Rules | `.claude/skills/git-workflow/SKILL.md` via the package source `rules/git-workflow.github.md` — the audit article    |

## What counts as done

- The audit names a red last run of the main branch and a cancelled one with zero steps, each by
  its own line with the run address; a green or running one is silence.
- A tree whose pipeline does not wake on a push to main gets a line saying the main run was not
  checked, and no divergence.
- Scenario SC-AK-1104 covers all three, the board suite is green, the specs check is green.

## Stages

### 1. The reading and the finding

- **What is done:** `lastMainRun` in `board-runs.github.mjs` — the last run of the pipeline
  workflow on the main branch, with the verdict `none | running | success | failure | evicted`;
  `pipelineWakesOnPush` reads the trigger from the pipeline file; `check-board.github.mjs`
  reports the two findings and the out-loud silence.
- **Readiness sign:** the stub-driven suite prints the new lines.
- **Verified by:** `bash projects/agent-kit/tests/checks-board.test.sh | tail -1` — «0 провалов» with the count above 81 (before the stage: 81 ok).

### 2. The scenario and the binding

- **What is done:** the rule in `spec.md`, SC-AK-1104 in `scenarios.md` covered by the board
  suite, the binding line in `implementation.md`; the audit article of the rule `git-workflow`
  names the main run.
- **Readiness sign:** the specs check counts one more covered scenario and no divergence.
- **Verified by:** `npm run check:specs | grep check-specs:` — «scenarios 1587 — covered 1439» (before: 1586 — 1438); `pnpm run agent-kit:check | tail -1` — «сходится».

## What this work does not do

- It does not read the main run at session start: that is RT-2148.
- It does not touch the rollout lag and the failed-rollout line.
