# Plan

**Task:** RT-3003 · **Branch:** RT-3003-register-recaptcha
**Spec:** `docs/specs/auth/theme/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                            |
| ----- | ---------------------------------------------------------------- |
| Specs | `docs/specs/auth/theme/`                                         |
| Laws  | `docs/constitution/frontend-application.md`                      |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/testing/` |
| Code  | `projects/auth-keycloak-theme/src/login/`                        |

## What counts as done

- The frame of the theme pages loads every script address Keycloak put on the page.
- With `recaptchaRequired` and `recaptchaVisible` the registration form draws the `g-recaptcha`
  block with the site key above the submit button; with `recaptchaVisible: false` it draws none.
- The answer of the widget is posted with the form as `g-recaptcha-response`.
- Unit tests of the registration page and of the frame cover these cases, and the theme suite is green.
- On a local Keycloak with the Google test key the registration page shows the widget, and a
  registration with it passes.

## Stages

### 1. The agreement in the spec

- **Steps:**
    1. Write the two rules and their scenarios into the theme spec
    2. Bind the rules in the companion of the spec
- **Readiness sign:** the spec names the script loading and the widget, with scenarios SC-AUTH-84 to SC-AUTH-86.
- **Verified by:** `grep -c "SC-AUTH-8[4-6]" docs/specs/auth/theme/scenarios.md` — prints 3.

### 2. The code and the unit tests

- **Steps:**
    1. Load the page scripts from the frame after the first draw
    2. Draw the reCAPTCHA block in the registration form
    3. Write the unit tests of the frame and of the registration page
- **Readiness sign:** the theme suite passes, 39 tests before the work and more after it.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-keycloak-theme --skip-nx-cache --output-style=static` — the line `Tests:` names only passed tests.

### 3. The check on a local Keycloak

- **Steps:**
    1. Raise the auth stand with the built theme
    2. Turn on registration and reCAPTCHA with the Google test key on the stand realm
    3. Register through the page in the browser
- **Readiness sign:** the page shows the widget, and the posted form carries `g-recaptcha-response`; Keycloak creates the user.
- **Verified by:** `pnpm run serve:auth` — the stand comes up; the rest is a browser measurement written into the progress.

## What this work does not do

- The invisible reCAPTCHA v3 — the request leaves it out.
- The passwords lost in the move to Keycloak and the rollout of the theme to the server — work of the application repository.
- The stand realm keeps registration and reCAPTCHA off: the stand turns them on only for the check.
