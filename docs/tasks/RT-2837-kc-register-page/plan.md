# Plan

**Task:** RT-2837 · **Branch:** RT-2837-kc-register-page
**Spec:** `docs/specs/auth/theme/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                  |
| ----- | ------------------------------------------------------ |
| Specs | `docs/specs/auth/theme/`                               |
| Laws  | `docs/constitution/reuse-first.md`, `verifiability.md` |
| Rules | `.claude/skills/styling-bem/`, `component-structure/`  |
| Code  | `projects/auth-keycloak-theme/`                        |

## What counts as done

- `register.ftl` is drawn by a page of the theme: the address, the password, its confirmation, the
  requirement list, the provider buttons and the link back to the sign-in.
- The Google button carries the four-colour mark on every page, with no font asked.
- The card head shows the realm logo from its HTML display name, or the realm name without one.
- The theme tests and the build are green, and the theme package is released.

## Stages

### 1. The spec and the scenarios

- **Steps:**
    1. Rules of the registration page, the logo and the provider mark in the spec
    2. Scenarios of the registration page in the scenario list
- **Readiness sign:** the spec names every element of the approved mockup.
- **Verified by:** `pnpm run check:specs` — no line about the theme spec.

### 2. The registration page

- **Steps:**
    1. The page component with its form and its field errors
    2. The page in the theme map and its texts
    3. Tests of the page
- **Readiness sign:** the registration scenarios pass.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-keycloak-theme` — every suite green.

### 3. The card head, the provider mark and the viewport

- **Steps:**
    1. The logo from the HTML display name
    2. The provider mark as a picture of the theme
    3. The password placeholders and the viewport gaps
- **Readiness sign:** the login page tests pass with the new head and mark.
- **Verified by:** `pnpm exec nx run @rt-tools/auth-keycloak-theme:build` — the JAR is built.

### 4. Delivery

- **Steps:**
    1. Lint, the push gate and the PR
    2. The theme package release after the merge
- **Readiness sign:** the PR is open and the gate is green.
- **Verified by:** `pnpm exec nx lint @rt-tools/auth-keycloak-theme` — no findings.

## What this work does not do

- The realm settings of the consumer: its user profile and its HTML display name are edited in
  the consumer's own tree.
- The rollout of the auth node.
