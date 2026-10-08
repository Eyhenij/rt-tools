# Plan

**Task:** RT-2634 · **Branch:** RT-2634-auth-deploy-restart
**Behaviour:** unchanged — «выкатывай тему на прод»: the rollout pipeline of the tree, not application code under apps or libs

## Task footprint

| What  | Where                               |
| ----- | ----------------------------------- |
| Specs | `docs/specs/auth/`                  |
| Laws  | `docs/constitution/delivery.md`     |
| Rules | `.claude/skills/deploy-flow/`       |
| Code  | `.github/workflows/deploy-auth.yml` |

## What counts as done

- A rollout of the entry module recreates Keycloak, and the new theme reaches production.
- A rollout whose served theme differs from the built one is red.

## Stages

### 1. Rollout fix

- **Steps:**
    1. Recreate Keycloak after the stack is up
    2. Compare the served theme with the built one at the end of the rollout
    3. Add the rule to the entry module spec
- **Readiness sign:** the workflow file parses and the spec audit is green
- **Verified by:** `node tools/check-specs.mjs` — no refusal

### 2. Delivery

- **Steps:**
    1. Open the PR into main and roll the theme out
- **Readiness sign:** the production login page serves the bundle with the new chevron pattern
- **Verified by:** `/opt/homebrew/bin/gh run list --workflow deploy-auth.yml -L 1` — the run is green

## What this work does not do

- The rollout of the receiver: its workflow recreates its own images and is not touched here.
