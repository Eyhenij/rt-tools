# Plan

**Task:** RT-2501 · **Branch:** RT-2501-commitlint-21
**Behaviour:** unchanged — a tool dependency; the owner's word «обнови npm пакеты»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                     |
| ----- | --------------------------------------------------------- |
| Code  | `package.json`, `pnpm-lock.yaml`, `commitlint.config.cjs` |
| Rules | `.claude/skills/dependencies/`                            |

## What counts as done

- The three commitlint packages stand at 21.2.3, and the commit-msg check judges headers as before.

## Stages

### 1. The upgrade

- **Steps:**
    1. Raise the three packages to 21.2.3 and rebuild the lock.
    2. Check the commit-msg check on a valid and an invalid header.
- **Readiness sign:** a header of this tree passes, one with a foreign scope is refused.
- **Verified by:** `echo '<header>' | pnpm exec commitlint` — exit 0 for the valid one, non-zero for the foreign scope.

## What this work does not do

- The other majors of RT-2081.
