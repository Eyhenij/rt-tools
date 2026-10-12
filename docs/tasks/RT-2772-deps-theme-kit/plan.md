# Plan

**Task:** RT-2772 · **Branch:** RT-2772-deps-theme-kit
**Behaviour:** unchanged — the owner asked to raise the dependencies; the theme code is not touched

## Task footprint

| What  | Where                                                                            |
| ----- | -------------------------------------------------------------------------------- |
| Code  | `projects/auth-keycloak-theme/package.json`, `projects/cms-angular/package.json` |
| Lock  | `pnpm-lock.yaml`, `pnpm-workspace.yaml`                                          |
| Rules | `.claude/skills/dependencies/`, `.claude/skills/browser-verification/`           |

## What counts as done

- Both packages declare `@rt-tools/ui-kit-v2` `^0.23.3`, and the lock holds 0.23.3.
- Build, specs and lint of both packages are green.
- The sign-in page on the stand looks the same as before, or every difference is named.

## Stages

### 1. The kit raised in the theme and the CMS front

- **Steps:**
    1. Take a frame of the sign-in page on the stand with 0.17.0
    2. Write `^0.23.3` into both manifests and install
    3. Run build, specs and lint of both packages
    4. Take the frame again with 0.23.3 and compare
    5. Run the push gate set
- **Readiness sign:** the push gate passes, and the frames are compared
- **Verified by:** `pnpm outdated -r` — no `@rt-tools/ui-kit-v2` line

## What this work does not do

- It does not publish the theme; the release goes by the owner's word.
