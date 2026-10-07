# Plan

**Task:** RT-2593 · **Branch:** RT-2593-cms-server
**Spec:** `docs/specs/cms/server/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                   |
| ----- | --------------------------------------- |
| Specs | `docs/specs/cms/`                       |
| Laws  | `docs/constitution/entity-models.md`    |
| Rules | none edited                             |
| Code  | `projects/cms-server/`, workspace files |

## What counts as done

- `@rt-tools/cms-server` builds into `dist/cms-server/{esm,cjs}`.
- It serves the three services of the contract through a port the app implements.
- Its tests pass with 100% coverage, and its spec binds every rule.

## Stages

### 1. The package and the page rules

- **Steps:**
    1. Create `projects/cms-server` after the auth server package and register it
    2. Carry over the page rules, the contract mapping and the scheduled publication with their tests
- **Readiness sign:** the package builds and its tests are green
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/cms-server` — "Successfully ran targets"

### 2. The services

- **Steps:**
    1. Carry over the port and the admin and site services with the access maps
    2. Carry over the storage helpers over structural delegates
    3. Carry over the media library service, its ports and the copies backfill
- **Readiness sign:** every method of the three services is served and tested
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/cms-server` — "Successfully ran targets"

### 3. The spec and the checks

- **Steps:**
    1. Write the spec, the scenarios and the bindings, and the README
    2. Run the tree checks
- **Readiness sign:** the spec check names no divergence in `cms`
- **Verified by:** `npm run check:specs` — exit code 0

## What this work does not do

- The Angular package — RT-2594.
- The release — RT-2595.
