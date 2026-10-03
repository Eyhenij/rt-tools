# Plan

**Task:** RT-2503 · **Branch:** RT-2503-jsdom-30
**Behaviour:** unchanged — a test environment dependency; the owner's word «обнови npm пакеты»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                            |
| ----- | -------------------------------- |
| Code  | `package.json`, `pnpm-lock.yaml` |
| Rules | `.claude/skills/dependencies/`   |

## What counts as done

- `jsdom` stands at 30.1.1, and the tests of every package are green on it.

## Stages

### 1. The upgrade

- **Steps:**
    1. Raise `jsdom` to 30.1.1 and rebuild the lock.
    2. Run the tests of every package and fix what the new environment broke.
- **Readiness sign:** every test target passes.
- **Verified by:** `pnpm test` — every project green.

## What this work does not do

- The other majors of RT-2081.
