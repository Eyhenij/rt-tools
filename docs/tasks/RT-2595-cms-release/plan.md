# Plan

**Task:** RT-2595 · **Branch:** RT-2595-cms-release
**Behaviour:** unchanged — the owner ordered the release of the packages as they are: «Вмержил пр, делай дальше»

## Task footprint

| What  | Where                                                                   |
| ----- | ----------------------------------------------------------------------- |
| Specs | `docs/specs/cms/`                                                       |
| Rules | `.claude/skills/git-workflow/`                                          |
| Code  | `projects/cms-server/package.json`, `projects/cms-angular/package.json` |
| CI    | `.github/workflows/`                                                    |

## What counts as done

- `npm view @rt-tools/cms-contract version`, `@rt-tools/cms-server` and `@rt-tools/cms-angular`
  each answer 0.1.0.
- No package of the tree links the contract as `workspace:*`.

## Stages

### 1. The workflows

- **Steps:**
    1. Write the three publication workflows after the auth server one
    2. Open the PR of the workflows into main
- **Readiness sign:** the three workflows lie in main
- **Verified by:** `command gh workflow list` — the three names are listed

### 2. The contract

- **Steps:**
    1. Run the contract workflow on the epic branch
- **Readiness sign:** the registry holds the contract
- **Verified by:** `npm view @rt-tools/cms-contract version` — 0.1.0

### 3. The server and the Angular package

- **Steps:**
    1. Replace the `workspace:*` links with `^0.1.0` and update the lockfile
    2. Run the server and the Angular workflows on the task branch
- **Readiness sign:** the registry holds both
- **Verified by:** `npm view @rt-tools/cms-angular version` — 0.1.0

## What this work does not do

- The application switch to the packages — its own task.
