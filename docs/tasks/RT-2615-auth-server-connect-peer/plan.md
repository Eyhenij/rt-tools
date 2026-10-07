# Plan

**Task:** RT-2615 · **Branch:** RT-2615-auth-server-connect-peer
**Behaviour:** unchanged — «Сделать обязательной зависимостью»: only the package manifest and the bus image change, no code

## Task footprint

| What  | Where                                                    |
| ----- | -------------------------------------------------------- |
| Specs | `docs/specs/auth/server/`                                |
| Laws  | `docs/constitution/delivery.md`                          |
| Rules | `.claude/skills/dependencies/`                           |
| Code  | `projects/auth-server/`, `deploy/message-bus.Dockerfile` |

## What counts as done

- `@connectrpc/connect` is a required peer of `@rt-tools/auth-server`, version 0.2.0.
- The bus image starts without module errors.

## Stages

### 1. Manifest and image

- **Steps:**
    1. Drop `peerDependenciesMeta` from the auth-server manifest and set the version to 0.2.0
    2. Build the bus and read whether the generated manifest carries `@connectrpc/connect`
    3. Drop the Dockerfile workaround if it does, keep it otherwise
    4. Build the bus image and start it
- **Readiness sign:** the image answers `connect ok`
- **Verified by:** `docker run --rm rt-bus-api:check node -e "require('@connectrpc/connect'); console.log('connect ok')"` — the line `connect ok`

### 2. Delivery

- **Steps:**
    1. Run the gate set and open the PR into the RT-2612 branch
- **Readiness sign:** the PR is open with the base `RT-2612-api-image-auth-packages`
- **Verified by:** `/opt/homebrew/bin/gh pr view --json baseRefName` — the base of the chain

## What this work does not do

- Publishing 0.2.0 to npm — a manual run of the publish workflow after the merge into main.
