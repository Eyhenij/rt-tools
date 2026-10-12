# Plan

**Task:** RT-2769 · **Branch:** RT-2769-deps-material
**Behaviour:** unchanged — the owner asked to raise the dependencies; no application code is touched

## Task footprint

| What  | Where                            |
| ----- | -------------------------------- |
| Code  | `package.json`, `pnpm-lock.yaml` |
| Rules | `.claude/skills/dependencies/`   |

## What counts as done

- `pnpm outdated -r` names no `@angular/` package.
- Lint, types, tests and build are green over the tree, and the frames of both kits and of the
  admin suite match their baselines or are retaken with the reason named.

## Stages

### 1. CDK and Material raised

- **Steps:**
    1. Write 22.2.2 for CDK and Material into the root manifest
    2. Install, then run build, types, tests and lint over the tree
    3. Run the showcase frames of both kits and read every diverging frame
    4. Run the push gate set
- **Readiness sign:** the outdated list holds no Angular package, and the push gate passes
- **Verified by:** `pnpm outdated -r` — no `@angular/` line

## What this work does not do

- The second kit inside the sign-in theme and the CMS front — task RT-2772.
