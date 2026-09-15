# Plan

**Task:** RT-1900 · **Branch:** RT-1900-people-editing
**Draft:** `docs/specs/message-bus/proposed/people-editing/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                                   |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/proposed/people-editing/` → `docs/specs/message-bus/people-editing/`; `docs/specs/message-bus/people-list/spec.md` — "the list only reads" leaves               |
| Laws  | `docs/constitution/entity-editing.md`, `docs/constitution/application/access.md`, `docs/constitution/verifiability.md`                                                                  |
| Rules | `.claude/skills/permissions/`, `.claude/skills/entity-aside/`, `.claude/skills/testing/`, `.claude/skills/api-layer/`                                                                   |
| Code  | `libs/message-bus-api/accounts/`, `libs/message-bus-admin/accounts/`, `libs/message-bus-admin/common/core/util/`, `libs/message-bus-admin/invites/util/`, `apps/message-bus-admin-e2e/` |

## What counts as done

- A person with `accounts:manage` creates a record by a name and a first password from a panel next
  to the list, changes a password from a second panel and disables a record from the row menu; the
  list shows the outcome at once.
- A disabled record signs in nowhere, and its live sign-ins are cut; the own record has no
  disabling item.
- Without `accounts:manage` the button and the row menu are not drawn, and the three operations of
  the receiver are refused by the right.

## Stages

### 1. The agreement

- **What is done:** the feature spec — rules, refusal codes, screens, scenarios SC-MB-361…; the
  people-list spec loses "the list only reads".
- **Readiness sign:** the spec check reads the draft without a divergence.
- **Verified by:** `node tools/check-specs.mjs` — no line about `proposed/people-editing`.

### 2. The receiver

- **What is done:** the manage controller with three operations under `accounts:manage`, the
  decisions in a pure util, the row query by name in data-access; specs by call with a storage double.
- **Readiness sign:** the accounts specs are green, the operations table of the draft matches the
  decorators.
- **Verified by:** `pnpm exec nx test message-bus-api-accounts-feature` and `… message-bus-api-accounts-util` — `passed`.

### 3. The admin panel

- **What is done:** the api service and the store methods, the two panels, the button and the row
  menu by right, the dictionary words, the shared refusal-word util lifted from the invites section.
- **Readiness sign:** the units of the accounts libs and of the invites util are green, the layer
  and reuse checks stay silent.
- **Verified by:** `pnpm exec nx run-many -t test -p message-bus-admin-accounts-feature-list message-bus-admin-accounts-util message-bus-admin-invites-util message-bus-admin-common-core-util` — `passed`; `pnpm run check:layers` — `no divergences`.

### 4. The suite

- **What is done:** `people-panel.spec.ts` walks the three actions on the stand as a person does;
  the frame of the creating panel.
- **Readiness sign:** the whole end-to-end suite is green.
- **Verified by:** `npx playwright test` in `apps/message-bus-admin-e2e` — `passed`.

## What this work does not do

- Switching a disabled record back on: no such action on the launch line either; a record needed
  again is created anew.
- Removing the launch-line commands and the first record's path — task #1902.
- The page of roles and pointed edits — task #1901; the panel of creating assigns no role.
- A person changing their own password from the profile — an open question of the access law.
