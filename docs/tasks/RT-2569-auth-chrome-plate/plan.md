# Plan

**Task:** RT-2569 · **Branch:** RT-2569-auth-chrome-plate
**Spec:** `docs/specs/auth/theme/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                      |
| ----- | ------------------------------------------ |
| Specs | `docs/specs/auth/theme/`                   |
| Code  | `projects/auth-keycloak-theme/src/`        |
| Tests | `apps/auth-example-e2e/src/layout.spec.ts` |

## What counts as done

- On every theme page the language list and the theme switch stand inside the card.
- «Back to Login» and «Back to Application» show no chevron.

## Stages

### 1. Switches in the card, back links without the chevron

- **Steps:**
    1. The theme spec rules and scenarios are written
    2. The frame moves the switches into the card
    3. The back links lose the chevron
    4. The tests are written
    5. The theme is checked on the stand
- **Readiness sign:** the theme tests are green, the stand shows the switches in the card.
- **Verified by:** `pnpm exec nx test auth-keycloak-theme` — every test passes.

## What this work does not do

- The password requirements — task RT-2570.
