# Plan

**Task:** RT-2774 · **Branch:** RT-2774-deps-vitest
**Behaviour:** unchanged — the owner asked to raise the packages to the latest versions; the test runner changes, the code does not.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                          |
| ----- | -------------------------------------------------------------- |
| Rules | `.claude/skills/dependencies/`, `.claude/skills/testing/`      |
| Code  | `package.json`, `pnpm-lock.yaml`, the Vitest configs and specs |

## What counts as done

- The root manifest holds `vitest`, `@vitest/coverage-v8` and `@vitest/ui` 5.0.3.
- Build, types, tests and lint over the tree are green, and the push gate lets the branch through.

## Stages

### 1. Vitest 5

- **Steps:**
    1. Write the new versions into the root manifest
    2. Install and run build, types, tests and lint over the tree
    3. Fix what Vitest 5 breaks in the configs and specs
    4. Run the push gate set
- **Readiness sign:** every project builds and its specs pass on Vitest 5.
- **Verified by:** `pnpm exec nx run-many -t build typecheck test lint --skip-nx-cache` — every
  task ends successfully.

## What this work does not do

- Other packages of the epic — their own tasks in `docs/plans/deps-latest.md`.
