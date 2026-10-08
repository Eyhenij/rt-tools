# Plan

**Task:** RT-2631 · **Branch:** RT-2631-theme-fallback-root
**Behaviour:** unchanged — «убирай шеврон и белый экран»: a package of the tree, not application code under apps or libs

## Task footprint

| What  | Where                                |
| ----- | ------------------------------------ |
| Specs | `docs/specs/auth/theme/`             |
| Laws  | `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/testing/`            |
| Code  | `projects/auth-keycloak-theme/`      |

## What counts as done

- A page the theme does not draw shows the standard Keycloakify layout, not an empty page.
- The proceed link of `info.ftl` shows no chevron.

## Stages

### 1. Theme fixes

- **Steps:**
    1. Put the standard root in place of the theme root before the standard path starts
    2. Drop the chevron of the proceed link
    3. Add the rules and scenarios to the theme spec and cover them by tests
- **Readiness sign:** the theme tests are green with the new scenarios
- **Verified by:** `pnpm exec nx test auth-keycloak-theme` — no failed test

### 2. Delivery

- **Steps:**
    1. Run the gate set and open the PR into main
- **Readiness sign:** the PR is open with a reviewer
- **Verified by:** `/opt/homebrew/bin/gh pr view --json number` — the PR number

## What this work does not do

- The release of the theme to the production Keycloak — a run of the theme release after the merge.
