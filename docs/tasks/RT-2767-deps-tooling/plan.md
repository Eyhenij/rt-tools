# Plan

**Task:** RT-2767 · **Branch:** RT-2767-deps-tooling
**Behaviour:** unchanged — the owner asked to raise the dependencies; no application code is touched

## Task footprint

| What  | Where                            |
| ----- | -------------------------------- |
| Code  | `package.json`, `pnpm-lock.yaml` |
| Rules | `.claude/skills/dependencies/`   |

## What counts as done

- `pnpm outdated -r` names none of the tooling packages of this task.
- Lint, types, tests and build are green over the tree.

## Stages

### 1. The tooling raised

- **Steps:**
    1. Write the new exact versions into the root manifest
    2. Install, then sort out what the new linters and the formatter report
    3. Run the push gate set
- **Readiness sign:** the outdated list holds no package of this task, and the push gate passes
- **Verified by:** `pnpm outdated -r` — none of the raised names

## What this work does not do

- Angular, CDK and Material, the styling carriers, NestJS, Vitest, webpack-dev-server, Node types and
  the changelog generator — their own tasks of the epic.
