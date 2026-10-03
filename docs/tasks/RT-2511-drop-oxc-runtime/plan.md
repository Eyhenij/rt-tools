# Plan

**Task:** RT-2511 · **Branch:** RT-2511-drop-oxc-runtime
**Behaviour:** unchanged — an unused build dependency; the owner's word «обнови npm пакеты»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                            |
| ----- | -------------------------------- |
| Code  | `package.json`, `pnpm-lock.yaml` |
| Rules | `.claude/skills/dependencies/`   |

## What counts as done

- The package is gone from the manifest and every build passes, or it stays with its reason
  written next to it.

## Stages

### 1. The removal

- **Steps:**
    1. Remove `@oxc-project/runtime` from the manifest and rebuild the lock.
    2. Build the admin panel, the receiver, the packages and both showcases.
    3. If a build looks for the package, return it and write the reason.
- **Readiness sign:** all builds pass.
- **Verified by:** `pnpm exec nx run-many -t build` and both showcase builds — green.

## What this work does not do

- The other items of RT-2081.
