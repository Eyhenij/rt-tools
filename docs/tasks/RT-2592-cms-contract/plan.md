# Plan

**Task:** RT-2592 · **Branch:** RT-2592-cms-contract
**Spec:** `docs/specs/cms/contract/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                       |
| ----- | ----------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/cms/contract/` (new), `docs/specs/README.md`                                                    |
| Laws  | entity-models, verifiability, shared-code                                                                   |
| Rules | typescript-conventions, testing, spec-driven, git-workflow                                                  |
| Code  | `projects/cms-contract`, `tsconfig.base.json`, `package.json`, `eslint.config.mjs`, `commitlint.config.cjs` |

## What counts as done

- `@rt-tools/cms-contract` builds into `dist/cms-contract/{esm,cjs}` and imports no framework.
- The package holds the block model, the body and content parsing, the page and redirect states,
  the site page functions and the generated Connect contract of the CMS and media services.
- Its tests and its spec are green.

## Stages

### 1. The package skeleton

- **Steps:**
    1. Create `projects/cms-contract` after the auth contract package
    2. Register it in the workspace, the lint ban and the commit scopes
- **Readiness sign:** an empty package builds
- **Verified by:** `pnpm exec nx build @rt-tools/cms-contract` — the build is green

### 2. The model and the contract

- **Steps:**
    1. Carry over the block model, the parsing and the site page functions with their tests
    2. Carry over the `.proto` files and generate the contract into the package
- **Readiness sign:** the package builds and its tests pass
- **Verified by:** `pnpm exec nx test @rt-tools/cms-contract` — the tests are green

### 3. The spec and the checks

- **Steps:**
    1. Write the spec, the scenarios and the bindings, and the README
    2. Run the tree checks
- **Readiness sign:** the spec bindings lead to live code
- **Verified by:** `pnpm run check:specs` — no divergences

## What this work does not do

- The server, the Angular package and the release — RT-2593, RT-2594, RT-2595.
