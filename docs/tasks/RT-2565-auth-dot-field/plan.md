# Plan

**Task:** RT-2565 · **Branch:** RT-2565-auth-dot-field
**Spec:** `docs/specs/ui-kit-v2/dot-field/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                         |
| ----- | ----------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/dot-field/`, `docs/specs/auth/theme/`                   |
| Rules | `component-structure`, `platform-access`, `styling-bem`, `rt-tools-storybook` |
| Code  | `projects/ui-kit-v2/src/lib/components/`, `projects/auth-keycloak-theme/src/` |

## What counts as done

- The second kit exports `rt-dot-field`, with a spec, a `CONTEXT.md` and a story.
- The sign-in page on the stand shows moving dots around a glass card in the light and the dark
  theme, confirmed by a measurement in the browser.

## Stages

### 1. The kit component

- **Steps:**
    1. The subdomain spec `dot-field` with scenarios is written
    2. The drawing logic and the component are written
    3. The component spec is written
    4. The story and `CONTEXT.md` are written
- **Readiness sign:** the component specs are green and the types compile.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=dot-field` — every test passes.

### 2. The sign-in screens

- **Steps:**
    1. The theme spec gets the rules of the background and the glass card
    2. The theme puts the field behind the card, the card becomes glass, a gradient lies under the dots
    3. The theme is checked on the stand in both themes
- **Readiness sign:** the theme tests are green, the stand shows the dots and the glass card.
- **Verified by:** `pnpm exec nx test auth-keycloak-theme` — every test passes.

## What this work does not do

- The error pages of the example admin.
