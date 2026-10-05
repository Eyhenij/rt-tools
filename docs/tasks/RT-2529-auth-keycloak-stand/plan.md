# Plan

**Task:** RT-2529 · **Branch:** RT-2529-auth-keycloak-stand
**Draft:** `docs/specs/auth/proposed/keycloak-stand/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                        |
| ----- | ------------------------------------------------------------ |
| Specs | `docs/specs/auth/` — a new domain, the stand agreement       |
| Laws  | `docs/constitution/verifiability.md`, `delivery.md`          |
| Rules | `.claude/skills/spec-driven/`, `.claude/skills/task-flow/`   |
| Code  | `deploy/auth/`, `tools/auth-stand-check.mjs`, `package.json` |

## What counts as done

- `pnpm run serve:auth` raises Keycloak 26.5.5, its Postgres and Mailpit on ports 58080, 55434,
  58025 and 51025 and returns when all are healthy.
- The realm `rt` with the client `rt-example-admin` and its roles is applied from
  `deploy/auth/realm/rt.json` at every raising.
- `pnpm run check:auth-stand` asks the running stand and prints a line per scenario SC-AUTH-1…5.
- The agreement is merged into `docs/specs/auth/` with its companion.

## Stages

### 1. Stand

- **Steps:**
    1. Write the compose file of the stand
    2. Write the realm file
    3. Add the raising command
- **Readiness sign:** the command returns, and `docker compose -p rt-auth ps` shows four services,
  three healthy and the config job exited with code 0.
- **Verified by:** `pnpm run serve:auth` — exits with code 0.

### 2. Check of the stand

- **Steps:**
    1. Write the check command
    2. Run the check over the raised stand
    3. Check that an edited realm file reaches a running stand
- **Readiness sign:** the check prints five passed lines SC-AUTH-1…5 and exits with code 0.
- **Verified by:** `pnpm run check:auth-stand` — five lines `ok SC-AUTH-…`.

### 3. Domain spec

- **Steps:**
    1. Merge the agreement into the domain spec
    2. Write the companion of the domain
    3. Add the domain to the specs index
- **Readiness sign:** the specs audit is green with the new domain.
- **Verified by:** `npm run check:specs` — no divergence for `docs/specs/auth/`.

## What this work does not do

- The theme, the client and the server packages — tasks RT-2530, RT-2531, RT-2532 of the epic.
- The stand check in the pipeline: the pipeline machine runs other containers, and the stand joins
  it with the end-to-end task RT-2534.
