# Plan

**Task:** RT-2627 · **Branch:** RT-2627-esm-imports
**Behaviour:** unchanged — the owner's word «Publish now»: the fix makes the module build loadable and changes no API

## Task footprint

| What    | Where                                                                                   |
| ------- | --------------------------------------------------------------------------------------- |
| Specs   | `docs/specs/cms/`, `docs/specs/auth/`                                                   |
| Code    | `projects/cms-server/`, `projects/auth-server/`                                         |
| Release | `.github/workflows/publish-cms-server.yml`, `.github/workflows/publish-auth-server.yml` |

## What counts as done

- No relative import in the sources of `cms-server` and `auth-server` lacks `.js`, and a test of
  each package holds it.
- The module build of both packages loads under Node from an install out of the registry.
- `@rt-tools/auth-server` and `@rt-tools/cms-server` 0.1.1 are in the registry.

## Stages

### 1. Extensions and their check

- **Steps:**
    1. Add `.js` to the relative imports of both packages
    2. Add a test per package that holds the extensions
- **Readiness sign:** both test suites green, the builds pass, the built module files have no
  relative path without an extension.
- **Verified by:** `pnpm exec nx run-many -t test build -p cms-server auth-server` — both green.

### 2. Release 0.1.1

- **Steps:**
    1. Raise both packages to 0.1.1
    2. Publish both packages from the task branch
    3. Load the published module build under Node
- **Readiness sign:** the registry answers 0.1.1 for both, and a clean install loads `esm/index.js`.
- **Verified by:** `npm view @rt-tools/cms-server@0.1.1 version` — prints `0.1.1`.

## What this work does not do

- The admin entry of `cms-angular` — task RT-2629.
