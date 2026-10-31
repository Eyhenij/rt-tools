# Plan

**Task:** RT-3025 · **Branch:** RT-3025-recaptcha-load-wait
**Spec:** `docs/specs/auth/theme/scenarios.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                     |
| ----- | ----------------------------------------- |
| Specs | `docs/specs/auth/theme/`                  |
| Code  | `projects/auth-keycloak-theme/src/login/` |

## What counts as done

- A Google script that loaded without `grecaptcha` ends the wait, and the callback never comes.
- The scenario SC-AUTH-96 names it, and a spec with its number is green.

## Stages

### 1. Fix

- **Steps:**
    1. Write the scenario SC-AUTH-96
    2. Write the spec of SC-AUTH-96
    3. End the wait on a load without grecaptcha
    4. Commit the fix
- **Readiness sign:** the theme specs are green, SC-AUTH-96 among them.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-keycloak-theme --skip-nx-cache` — `Tests:` with no failed.

## What this work does not do

- It does not change the end-to-end suite: the stand serves the real Google script.
