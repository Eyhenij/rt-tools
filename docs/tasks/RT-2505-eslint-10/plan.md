# Plan

**Task:** RT-2505 · **Branch:** RT-2505-eslint-10
**Behaviour:** unchanged — a lint tool dependency; the owner's word «обнови npm пакеты»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                 |
| ----- | ----------------------------------------------------- |
| Code  | `package.json`, `pnpm-lock.yaml`, `eslint.config.mjs` |
| Rules | `.claude/skills/dependencies/`                        |

## What counts as done

- eslint 10 with its companions stands in the manifest, `eslint-plugin-import` is gone, and the lint
  of every project is green.

## Stages

### 1. The upgrade

- **Steps:**
    1. Raise `eslint` to 10.11.0, `@eslint/js` to 10.0.1, `eslint-plugin-simple-import-sort` to
       14.0.0, `jsonc-eslint-parser` to 3.3.0; remove `eslint-plugin-import`; rebuild the lock.
    2. Run the lint of every project and sort out the new findings by rule name.
- **Readiness sign:** the lint of every project passes.
- **Verified by:** `pnpm run lint` — every project green.

## What this work does not do

- The other majors of RT-2081.
