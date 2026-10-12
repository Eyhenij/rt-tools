# Plan

**Task:** RT-2766 · **Branch:** RT-2766-deps-rt-tools
**Behaviour:** unchanged — the owner asked to raise the dependencies; no application code is touched

## Task footprint

| What | Where                                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Code | `projects/auth-keycloak-theme/package.json`, `projects/cms-angular/package.json`, `projects/cms-server/package.json`, `pnpm-lock.yaml` |

## What counts as done

- `pnpm outdated -r` names no `@rt-tools` package except the second kit, which RT-2772 raises.

## Stages

### 1. The neighbours raised

- **Steps:**
    1. Raise the declared ranges in the theme and the CMS packages
    2. Update the lockfile and run the checks
- **Readiness sign:** the outdated list holds only `@rt-tools/ui-kit-v2` among `@rt-tools` packages
- **Verified by:** `pnpm outdated -r` — no `@rt-tools/core`, `store`, `utils`, `auth-server` lines

## What this work does not do

- The second kit in the theme and the CMS front end — RT-2772.
