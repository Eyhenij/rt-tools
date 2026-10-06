# Plan

**Task:** RT-2564 · **Branch:** RT-2564-auth-placeholder-hint
**Spec:** `docs/specs/auth/theme/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                            |
| ----- | ------------------------------------------------ |
| Specs | `docs/specs/auth/theme/`                         |
| Rules | `.claude/skills/component-structure/`, `testing` |
| Code  | `projects/auth-keycloak-theme/src/login/pages/`  |

## What counts as done

- The login fields of the sign-in and the reset pages show `name@example.com` when empty.
- No password field carries a placeholder.
- On the stand the sign-in page shows the label above and the example inside the login field.

## Stages

### 1. The placeholder is an example, not the label

- **Steps:**
    1. The spec rule and scenario SC-AUTH-59 are rewritten
    2. The templates put the example into the login fields and drop the password placeholders
    3. The test of SC-AUTH-59 is rewritten
    4. The theme is checked on the stand
- **Readiness sign:** the theme tests are green, the stand shows the example in the login field.
- **Verified by:** `pnpm exec nx test auth-keycloak-theme` — every test passes.

## What this work does not do

- The background around the card — task RT-2565.
