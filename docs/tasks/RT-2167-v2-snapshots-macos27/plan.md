# Plan

**Task:** RT-2167 · **Branch:** RT-2167-v2-snapshots-macos27
**Behaviour:** unchanged — the owner ordered the stack of epic RT-2146 merged; only reference frames of the showcase change, no application code

## Task footprint

| What  | Where                                          |
| ----- | ---------------------------------------------- |
| Rules | `.claude/skills/ui-component-tests-visual/`    |
| Code  | `projects/ui-kit-v2/.storybook/__snapshots__/` |

## What counts as done

- `node tools/visual-gate.mjs ui-kit-v2` on this machine: 479 of 479 snapshots pass.
- The CI run on the PR of the epic is green at the step «Visual tests (ui-kit-v2)».

## Stages

### 1. The references are retaken

- **What is done:** the second kit's showcase is raised, all references are retaken by
  `pnpm run test:visual:v2:update-all`, the run is repeated without the update flag.
- **Readiness sign:** the repeated run reports 479 passed, 0 failed; `git status` lists only
  files under `projects/ui-kit-v2/.storybook/__snapshots__/`.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — the line `Snapshots: 479 passed`.

### 2. The work is handed in

- **What is done:** the frames are committed as the bot, the epic plan gets the fifth row, the
  folder is taken apart, the PR into the epic branch opens ready — the pipeline does not wake for
  that base.
- **Readiness sign:** the PR is merged; the CI run on the epic PR tip is green.
- **Verified by:** `gh api …/pulls/<n>` — `merged: true`; `gh run view <id>` — `completed success`.
