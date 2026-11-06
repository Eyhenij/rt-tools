# Plan

**Task:** RT-3125 · **Branch:** RT-3125-auth-theme-remarks
**Spec:** `docs/specs/auth/theme/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                      |
| ----- | -------------------------------------------------------------------------- |
| Specs | `docs/specs/auth/theme/`                                                   |
| Laws  | `docs/constitution/mockups.md`, `docs/constitution/verifiability.md`       |
| Rules | `.claude/skills/browser-verification/`, `.claude/skills/rt-tools-styling/` |
| Code  | `projects/auth-keycloak-theme/`                                            |

## What counts as done

- The seven remarks of the grill are fixed in the theme, each seen on the stand.
- The screens are checked on the stand at 1440, 768 and 375 in the light and the dark theme.
- The spec says what the theme now does, and the new scenarios are covered by unit tests.
- The work is merged into main and a new theme release carries its version and the JAR sha256.

## Stages

### 1. The seven remarks in the theme code

- **Steps:**
    1. Every language is named by its own name with a capital letter
    2. The links between the entry pages carry the chosen language
    3. The info page is laid out like the login form and always leads on
    4. The reCAPTCHA widget stands without its frame
    5. On a wide screen the switches stand in the top right corner on their own pad
    6. The icon of the message banner stands on the line of its text
- **Readiness sign:** the unit tests of the theme pass with the new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-keycloak-theme --maxWorkers=2` — «Tests: … passed», no failed.

### 2. The screens on the stand

- **Steps:**
    1. The theme JAR is built and the stand is raised
    2. The screens are measured at 1440, 768 and 375 in both themes
    3. The stand is stopped
- **Readiness sign:** every remark is measured as fixed on the stand.
- **Verified by:** `pnpm run build:auth-keycloak-theme` — the JAR is written to `dist/auth-keycloak-theme/`.

### 3. The texts and the version

- **Steps:**
    1. The spec rules, their bindings and the scenarios say what the theme does now
    2. The theme version is raised
- **Readiness sign:** the spec check passes.
- **Verified by:** `npm run check:specs` — no refusal.

### 4. Delivery

- **Steps:**
    1. The check set passes
    2. The task folder is taken apart into the archive
    3. The PR opens and is shown to the owner
    4. After the merge the theme release is published
- **Readiness sign:** the release `rt-auth-keycloak-theme@<version>` carries the JAR, its sha256 is named.
- **Verified by:** `gh release view rt-auth-keycloak-theme@<version>` — the JAR is among the assets.

## What this work does not do

- The application that uses the theme raises its theme version itself.
- The kit's `rt-message` is not edited unless the owner says so.
