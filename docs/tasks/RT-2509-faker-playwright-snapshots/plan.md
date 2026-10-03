# Plan

**Task:** RT-2509 · **Branch:** RT-2509-faker-playwright-snapshots
**Behaviour:** unchanged — a test tool dependency; the owner's word «обнови npm пакеты»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What   | Where                                                                |
| ------ | -------------------------------------------------------------------- |
| Code   | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`              |
| Frames | the second kit's references that Chromium of Playwright 1.63 changes |
| Rules  | `.claude/skills/dependencies/`, `.claude/skills/testing/`            |

## What counts as done

- Playwright 1.63.0 stands in the manifest and under the showcase runner, both showcases are green,
  and the re-taken second-kit frames differ only by the textarea resize grip.

## Stages

### 1. The upgrade

- **Steps:**
    1. Raise `@playwright/test` to 1.63.0, drop the runner's Playwright line, rebuild the lock and
       install the browser.
    2. Run both showcase gates and list the diverging frames.
    3. Re-take the diverging second-kit frames and read each by eye.
- **Readiness sign:** both showcase gates pass; the first kit has no re-taken frame.
- **Verified by:** `node tools/visual-gate.mjs ui-kit` and `node tools/visual-gate.mjs ui-kit-v2` —
  green.

## What this work does not do

- faker 10.6.0 — ADR 0003 keeps the first kit's frames as they are.
- NestJS 12 — blocked by the peer range of `@nx/nest`.
