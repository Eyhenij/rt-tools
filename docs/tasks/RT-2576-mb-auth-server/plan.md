# Plan

**Task:** RT-2576 · **Branch:** RT-2576-mb-auth-server
**Spec:** `docs/specs/message-bus/access-rights/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/message-bus/access-rights/`, `docs/specs/message-bus/admin-auth/`, `docs/specs/message-bus/first-run/` |
| Code  | `libs/message-bus-api/access/`, `libs/message-bus-api/accounts/`, `apps/message-bus/src/`                          |
| Code  | `libs/message-bus-common/src/lib/rights.ts`                                                                        |

## What counts as done

- A person's request reaches an operation of the bus only with a Keycloak access token of the bus
  client; the rights are the client roles in that token.
- The catalog of the bus rights is declared once with `definePermissions` and is sent to Keycloak at
  the start when the sync client is configured.
- The sign-in, sign-out, session and first-run operations are gone from the server.
- Tree tokens, the widget site key and the embedded talks signature work as before.

## Stages

### 1. The bus server checks the Keycloak token

- **Steps:**
    1. The specs of access rights, sign-in and first run are rewritten for the token
    2. The rights catalog is declared with the contract and the server module is connected
    3. The bus access marks declare the module access, and the bus guard keeps the tree branch
    4. The operations of sign-in, sign-out, session and first run are removed
    5. The signed-in person of a request is read from the token
    6. The tests are rewritten
- **Readiness sign:** the bus server tests are green, and the server starts against the stand
  Keycloak and refuses a request without a token.
- **Verified by:** `pnpm exec nx run-many -t test -p 'message-bus-api-*' message-bus message-bus-common` — every test passes.

## What this work does not do

- The admin panel — task RT-2577.
- The people and roles screens, their tables and the link of a chat operator — task RT-2578.
