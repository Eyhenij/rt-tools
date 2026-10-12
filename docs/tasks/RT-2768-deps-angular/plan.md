# Plan

**Task:** RT-2768 · **Branch:** RT-2768-deps-angular
**Behaviour:** unchanged — the owner asked to raise the dependencies; no application code is touched

## Task footprint

| What  | Where                            |
| ----- | -------------------------------- |
| Code  | `package.json`, `pnpm-lock.yaml` |
| Rules | `.claude/skills/dependencies/`   |

## What counts as done

- `pnpm outdated -r` names no Angular package except `@angular/cdk` and `@angular/material`.
- Lint, types, tests and build are green over the tree.

## Stages

### 1. Angular raised

- **Steps:**
    1. Write 22.2.2 into the root manifest for the framework and its build tooling
    2. Install, then sort out what the build and the tests report
    3. Run the push gate set
- **Readiness sign:** the outdated list holds only CDK and Material of the Angular packages, and
  the push gate passes
- **Verified by:** `pnpm outdated -r` — no `@angular/` line but cdk and material

## What this work does not do

- CDK and Material — task RT-2769; TypeScript 7 — Angular does not accept it.
