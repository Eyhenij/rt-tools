# Plan

**Task:** RT-2629 · **Branch:** RT-2629-cms-lazy-routes
**Behaviour:** unchanged — the owner's word «Publish now»: the README names the lazy mount, the package code is the same

## Task footprint

| What    | Where                                                     |
| ------- | --------------------------------------------------------- |
| Docs    | `projects/cms-angular/README.md`                          |
| Code    | `projects/cms-angular/admin/src/lib/screen/cms.routes.ts` |
| Release | `.github/workflows/publish-cms-angular.yml`               |

## What counts as done

- The README mounts `cmsRoutes` and `mediaRoutes` by `loadChildren` and says why.
- `@rt-tools/cms-angular` 0.1.1 is in the registry, and its README carries the lazy mount.

## Stages

### 1. The lazy mount

- **Steps:**
    1. Mount the routes by `loadChildren` in the README
    2. Name the mount in the comment of the routes
- **Readiness sign:** the README and the routes comment name `loadChildren`; lint and build green.
- **Verified by:** `pnpm exec nx run-many -t lint test -p cms-angular` — green.

### 2. Release 0.1.1

- **Steps:**
    1. Raise the package to 0.1.1
    2. Publish the package from the task branch
- **Readiness sign:** the registry answers 0.1.1, and its README names `loadChildren`.
- **Verified by:** `npm view @rt-tools/cms-angular@0.1.1 version` — prints `0.1.1`.

## What this work does not do

- Entries per screen — a separate task: it changes the public API of the admin entry.
