# Plan

**Task:** RT-2841 · **Branch:** RT-2841-kc-register-title-ru
**Spec:** `docs/specs/auth/theme/`
**Behaviour:** changes

## Task footprint

| What  | Where                                               |
| ----- | --------------------------------------------------- |
| Specs | `docs/specs/auth/theme/`                            |
| Code  | `projects/auth-keycloak-theme/src/login/kc-i18n.ts` |

## What counts as done

- The Russian message set of the built theme holds `registerTitle` with «Регистрация».

## Stages

### 1. Russian registration title

- **Steps:**
    1. `registerTitle` in the Russian custom translations
    2. Theme tests, lint and build
- **Readiness sign:** the JAR Russian messages hold the title
- **Verified by:** `npm run build:auth-keycloak-theme` — the Russian messages file of the JAR holds `registerTitle`

## What this work does not do

- The ko and hi message sets.
