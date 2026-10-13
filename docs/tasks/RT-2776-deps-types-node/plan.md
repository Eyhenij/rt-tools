# Plan

**Task:** RT-2776 · **Branch:** RT-2776-deps-types-node
**Behaviour:** unchanged — the owner asked to raise the packages to the latest versions; type declarations change no code.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                            |
| ----- | -------------------------------- |
| Rules | `.claude/skills/dependencies/`   |
| Code  | `package.json`, `pnpm-lock.yaml` |

## What counts as done

- The root manifest holds `@types/node` 24.19.2; the epic plan names why 26 is not taken.
- Build, types, tests and lint over the tree are green, and the push gate lets the branch through.

## Stages

### 1. Node types 24.19.2

- **Steps:**
    1. Write 24.19.2 into the root manifest
    2. Install and run build, types, tests and lint over the tree
    3. Fix what the new types break
    4. Run the push gate set
- **Readiness sign:** every project builds and its specs pass on the new types.
- **Verified by:** `pnpm exec nx run-many -t build typecheck test lint --skip-nx-cache` — every
  task ends successfully.

## What this work does not do

- Moving the tree to a newer Node, which would let the types go to 26 — work of its own.
