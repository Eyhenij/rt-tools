# Plan

**Task:** RT-2582 · **Branch:** RT-2582-mb-auth-cargo-tools
**Spec:** `docs/specs/auth/server/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/auth/server/`, `docs/specs/message-bus/admin-auth/`                                |
| Laws  | `docs/constitution/application/access.md`, `docs/constitution/verifiability.md`                |
| Rules | `.claude/skills/permissions/`, `.claude/skills/cargo-triage/`, `.claude/skills/testing/`       |
| Code  | `projects/auth-server/`, `deploy/auth/realm/rt.json`, `tools/cargo-*.mjs`, `apps/message-bus/` |

## What counts as done

- The auth server accepts a token of a service client it names, with the roles of the bus client.
- The realm holds the service client of the cargo commands with the rights of the old role.
- The cargo commands sign in by the token of that client, not by a name and a password.
- The receiver names its service client from the environment.

## Stages

### 1. The cargo commands sign in by a service client

- **Steps:**
    1. The auth server accepts the tokens of the service clients it names
    2. The realm holds the service client of the cargo commands
    3. The cargo commands sign in by the token of the service client
    4. The receiver and the guides name the service client
- **Readiness sign:** `pnpm exec nx test auth-server` is green, and the cargo read command answers
  against the stand with a token of the service client.
- **Verified by:** `pnpm exec nx run-many -t lint test typecheck build -p auth-server message-bus`
  — the line «Successfully ran».

## What this work does not do

- Does not create the client in the Keycloak of production: task RT-2581.
- Does not publish the package by itself: the publish runs by the owner's pipeline after the merge.
