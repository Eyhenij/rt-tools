# Plan

**Task:** RT-2770 · **Branch:** RT-2770-deps-sass
**Behaviour:** unchanged — the owner asked to raise the dependencies; no application code is touched

## Task footprint

| What  | Where                            |
| ----- | -------------------------------- |
| Code  | `package.json`, `pnpm-lock.yaml` |
| Rules | `.claude/skills/dependencies/`   |

## What counts as done

- `pnpm outdated -r` names neither sass, nor postcss, nor autoprefixer.
- Lint, types, tests and build are green over the tree, and the frames of both kits and of the
  admin suite match their baselines or are retaken with the reason named.

## Stages

### 1. The style builders raised

- **Steps:**
    1. Write the new versions of sass, postcss and autoprefixer into the root manifest
    2. Install, then run build, types, tests and lint over the tree
    3. Run the showcase frames of both kits and read every diverging frame
    4. Run the push gate set
- **Readiness sign:** the outdated list holds none of the three, and the push gate passes
- **Verified by:** `pnpm outdated -r` — no sass, postcss or autoprefixer line

## What this work does not do

- simple-icons — task RT-2771.
