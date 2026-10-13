# Plan

**Task:** RT-2775 · **Branch:** RT-2775-deps-wds
**Behaviour:** unchanged — the owner asked to raise the packages to the latest versions; the dev server is build tooling, the code does not change.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                   |
| ----- | ------------------------------------------------------- |
| Rules | `.claude/skills/dependencies/`                          |
| Code  | `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` |

## What counts as done

- The root manifest and the Angular build hold `webpack-dev-server` 6.0.0; the substitution
  covers only the 5.x line.
- Build, types, tests and lint over the tree are green, and the push gate lets the branch through.

## Stages

### 1. webpack-dev-server 6

- **Steps:**
    1. Write 6.0.0 into the root manifest and narrow the substitution to the 5.x line
    2. Install and run build, types, tests and lint over the tree
    3. Fix what webpack-dev-server 6 breaks
    4. Run the push gate set
- **Readiness sign:** every project builds and its specs pass, and the lock gives the Angular
  build 6.0.0.
- **Verified by:** `pnpm exec nx run-many -t build typecheck test lint --skip-nx-cache` — every
  task ends successfully.

## What this work does not do

- Other packages of the epic — their own tasks in `docs/plans/deps-latest.md`.
