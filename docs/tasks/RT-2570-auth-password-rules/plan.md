# Plan

**Task:** RT-2570 · **Branch:** RT-2570-auth-password-rules
**Spec:** `docs/specs/auth/theme/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                               |
| ----- | ----------------------------------- |
| Specs | `docs/specs/auth/theme/`            |
| Code  | `projects/auth-keycloak-theme/src/` |
| Realm | `deploy/auth/realm/rt.json`         |

## What counts as done

- The stand realm declares a password policy.
- Under the new password field the page lists every requirement of the realm policy and marks the
  met ones as the person types.

## Stages

### 1. The password requirements under the new password field

- **Steps:**
    1. The theme spec rules and scenarios are written
    2. The stand realm declares the password policy
    3. The requirements are built from the page context
    4. The update page shows the list under the new password field
    5. The tests are written
    6. The theme is checked on the stand
- **Readiness sign:** the theme tests are green, the stand shows the list under the field.
- **Verified by:** `pnpm exec nx test auth-keycloak-theme` — every test passes.

## What this work does not do

- The account console of Keycloak keeps its standard theme and its own password form.
