# Plan

**Task:** RT-2773 · **Branch:** RT-2773-deps-nest
**Behaviour:** unchanged — the owner asked to raise the packages to the latest versions; the servers keep their behaviour.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                  |
| ----- | ---------------------------------------------------------------------- |
| Rules | `.claude/skills/dependencies/`                                         |
| Code  | `package.json`, `pnpm-lock.yaml`, the NestJS servers and their library |

## What counts as done

- The root manifest holds NestJS 12.1.3 and schematics 12.0.7, and no `@nx/nest`.
- Build, types, tests and lint over the tree are green, and the push gate lets the branch through.

## Stages

### 1. NestJS 12

- **Steps:**
    1. Write the new versions into the root manifest and drop `@nx/nest`
    2. Install and run build, types, tests and lint over the tree
    3. Fix what NestJS 12 breaks in the servers
    4. Run the push gate set
- **Readiness sign:** every project builds and its specs pass on NestJS 12.
- **Verified by:** `pnpm exec nx run-many -t build typecheck test lint --skip-nx-cache` — every
  task ends successfully.

## What this work does not do

- Other packages of the epic — their own tasks in `docs/plans/deps-latest.md`.
