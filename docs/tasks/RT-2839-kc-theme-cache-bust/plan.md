# Plan

**Task:** RT-2839 · **Branch:** RT-2839-kc-theme-cache-bust
**Spec:** `docs/specs/auth/theme/`
**Behaviour:** changes

## Task footprint

| What    | Where                                       |
| ------- | ------------------------------------------- |
| Specs   | `docs/specs/auth/theme/`                    |
| Code    | `projects/auth-keycloak-theme/project.json` |
| Rollout | `.github/workflows/deploy-auth.yml`         |

## What counts as done

- The built `index.html` of the theme names `main-<hash>.js` and `styles-<hash>.css`, and the JAR
  login template refers to the same names.
- The theme check of the rollout finds the entry file by its hashed name.

## Stages

### 1. Hashed file names of the theme

- **Steps:**
    1. `outputHashing: "all"` in the `build-app` target
    2. The theme check takes the entry file name from the login page
    3. A spec rule on hashed file names of the theme
- **Readiness sign:** the build puts out `main-<hash>.js`, the template in the JAR refers to it
- **Verified by:** `npm run build:auth-keycloak-theme` — `ls dist/auth-keycloak-theme/app` shows `main-*.js` and no `main.js`

### 2. Hand-in

- **Steps:**
    1. Theme tests and linters
    2. Folder taken apart, PR
- **Readiness sign:** the PR is open with a green run
- **Verified by:** `gh pr checks --watch` — every check passes

## What this work does not do

- Cache headers on the auth node and the Keycloak resource path stay as they are.
