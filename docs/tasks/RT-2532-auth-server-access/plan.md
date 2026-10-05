# Plan

**Task:** RT-2532 · **Branch:** RT-2532-auth-server-access
**Spec:** `docs/specs/auth/server/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                               |
| ----- | ------------------------------------------------------------------- |
| Specs | `docs/specs/auth/server/`                                           |
| Laws  | `docs/constitution/verifiability.md`, `observability.md`            |
| Rules | `.claude/skills/testing/`, `.claude/skills/typescript-conventions/` |
| Code  | `projects/auth-server/`, `tsconfig.base.json`, `package.json`       |

## What counts as done

- `@rt-tools/auth-server` builds into `dist/auth-server`.
- The decorators, the guard, the start audit, the Connect interceptor and the catalog sync exist.
- Scenarios SC-AUTH-11…17 are named in test titles, and the tests pass.
- The guard answers a real token of the stand.

## Stages

### 1. Package

- **Steps:**
    1. Create the package files
    2. Register the package in the workspace
- **Readiness sign:** the empty package builds.
- **Verified by:** `pnpm exec nx build @rt-tools/auth-server` — exits with code 0.

### 2. Token and access

- **Steps:**
    1. Write the token check
    2. Write the access declarations and the start audit
    3. Write the guard
    4. Write the Connect interceptor
    5. Write the tests of SC-AUTH-11…15 and SC-AUTH-17
- **Readiness sign:** the tests pass.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-server` — all tests pass.

### 3. Catalog sync

- **Steps:**
    1. Write the catalog sync
    2. Write the test of SC-AUTH-16
    3. Run the sync against the stand
- **Readiness sign:** the stand client gets the missing role, the extra role stays.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-server` — all tests pass.

### 4. Texts

- **Steps:**
    1. Write the package README
    2. Run the spec audit
- **Readiness sign:** the spec audit is green, and SC-AUTH-11…17 count as covered.
- **Verified by:** `npm run check:specs` — no divergence.

## What this work does not do

- The publishing workflow of the new packages — filed with RT-2534.
- The end-to-end check with a running admin — task RT-2534.
