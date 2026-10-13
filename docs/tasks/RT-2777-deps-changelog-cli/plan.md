# Plan

**Task:** RT-2777 · **Branch:** RT-2777-deps-changelog-cli
**Behaviour:** unchanged — the owner asked to raise the packages to the latest versions; the release notes keep their shape.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                   |
| ----- | ----------------------------------------------------------------------- |
| Rules | `.claude/skills/dependencies/`                                          |
| Code  | `package.json`, `pnpm-lock.yaml`, `tools/fold-unreleased-changelog.cjs` |

## What counts as done

- The root manifest holds `conventional-changelog` 8.1.3 and `conventional-changelog-angular`
  9.4.0, and no `conventional-changelog-cli`; the six scripts run without `-s`.
- The new command prints the same last three releases of the core, the second kit and the rules
  package as the old one did.
- Build, types, tests and lint over the tree are green, and the push gate lets the branch through.

## Stages

### 1. The changelog generator

- **Steps:**
    1. Replace the old CLI with the new package and the preset in the root manifest
    2. Drop `-s` from the six scripts and the header comment
    3. Compare the new output with the old one for three packages
    4. Run build, types, tests and lint over the tree and the push gate set
- **Readiness sign:** the outputs match, and every project builds.
- **Verified by:** `pnpm exec nx run-many -t build typecheck test lint --skip-nx-cache` — every
  task ends successfully.

## What this work does not do

- Other packages of the epic — their own tasks in `docs/plans/deps-latest.md`.
