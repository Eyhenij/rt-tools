# Plan

**Task:** RT-2638 · **Branch:** RT-2638-auth-server-nest12
**Behaviour:** unchanged — «делай свою часть работу»: a package of the tree, not application code under apps or libs

## Task footprint

| What  | Where                           |
| ----- | ------------------------------- |
| Specs | `docs/specs/auth/server/`       |
| Laws  | `docs/constitution/delivery.md` |
| Rules | `.claude/skills/dependencies/`  |
| Code  | `projects/auth-server/`         |

## What counts as done

- The built package starts and refuses and lets through calls under NestJS 12 as under NestJS 11.
- `@rt-tools/auth-server` is published with the peer range `^11.0.0 || ^12.0.0`.

## Stages

### 1. Nest 12 check and the range

- **Steps:**
    1. Run the built package under NestJS 12 in a scratch install
    2. Widen the peer range and raise the version
    3. Add the rule to the server spec
- **Readiness sign:** the package tests are green and the scratch run under NestJS 12 answers 401, 403 and 200 where expected
- **Verified by:** `pnpm exec nx test auth-server` — no failed test

### 2. Delivery

- **Steps:**
    1. Open the PR into the epic branch and publish the package
- **Readiness sign:** the registry answers with the new version
- **Verified by:** `npm view @rt-tools/auth-server version` — the new version

## What this work does not do

- Raising the tree itself to NestJS 12.
- The move of the application's sign-in: that work lives in the application.
