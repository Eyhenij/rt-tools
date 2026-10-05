# Plan

**Task:** RT-2533 · **Branch:** RT-2533-auth-contract
**Spec:** `docs/specs/auth/contract/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                                        |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/auth/contract/`                                                                                                  |
| Laws  | `docs/constitution/entity-models.md`, `verifiability.md`                                                                     |
| Rules | `.claude/skills/testing/`, `.claude/skills/typescript-conventions/`                                                          |
| Code  | `projects/auth-contract/`, `tsconfig.base.json`, `commitlint.config.cjs`, `package.json`, `tools/finalize-utils-package.cjs` |

## What counts as done

- `@rt-tools/auth-contract` builds into `dist/auth-contract` with ESM and CJS outputs.
- The functions of the contract table exist and are exported from the package.
- Scenarios SC-AUTH-6…10 are named in test titles, and the tests pass.
- The commit scope `rt:auth` is accepted.

## Stages

### 1. Package

- **Steps:**
    1. Create the package files
    2. Register the package in the workspace
    3. Let the manifest script assemble any package
- **Readiness sign:** the package builds, and `dist/auth-contract` holds `esm`, `cjs` and the manifest.
- **Verified by:** `pnpm exec nx build @rt-tools/auth-contract` — the last line names `dist/auth-contract assembled (esm + cjs)`.

### 2. Contract

- **Steps:**
    1. Write the right and the catalog
    2. Write the caller and the checks
    3. Write the tests of SC-AUTH-6…10
- **Readiness sign:** the tests pass with full coverage.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-contract` — all tests pass.

### 3. Texts

- **Steps:**
    1. Write the package README
    2. Run the spec audit
- **Readiness sign:** the spec audit is green, and SC-AUTH-6…10 count as covered.
- **Verified by:** `npm run check:specs` — no divergence.

## What this work does not do

- The publishing workflow of the new packages — the epic adds it once the client and the server
  exist; task to be filed with RT-2534.
- The entry in the specs index — the first task of the epic adds the domain there.
