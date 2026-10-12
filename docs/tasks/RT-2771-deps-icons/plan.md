# Plan

**Task:** RT-2771 · **Branch:** RT-2771-deps-icons
**Behaviour:** unchanged — the owner asked to raise the dependencies; the kit code is not touched

## Task footprint

| What   | Where                                                   |
| ------ | ------------------------------------------------------- |
| Code   | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` |
| Assets | `projects/ui-kit-v2/src/assets/icons/`                  |
| Rules  | `.claude/skills/dependencies/`                          |

## What counts as done

- `simple-icons` stands on 16.34.0, and the release-age list names no dead version of it.
- The social marks are rebuilt from 16.34.0; the second showcase frames match or are retaken with
  the reason named.

## Stages

### 1. The icon set raised

- **Steps:**
    1. Write 16.34.0 into the root manifest and drop the dead release-age exclusion
    2. Install, rebuild the social marks and compare them with the files in the tree
    3. Run the build of the sign-in theme and the second showcase frames
    4. Run the push gate set
- **Readiness sign:** the push gate passes
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — no failed frame

## What this work does not do

- simple-icons 16.35.0 — it waits out its first week.
