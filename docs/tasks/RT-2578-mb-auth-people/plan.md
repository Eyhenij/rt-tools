# Plan

**Task:** RT-2578 · **Branch:** RT-2578-mb-auth-people
**Spec:** `docs/specs/message-bus/access-rights/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                        |
| ----- | -------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/` — `access-rights`, `people-list`, `people-editing`, `roles-page`   |
| Laws  | `docs/constitution/application/access.md`, `docs/constitution/lib-imports.md`                |
| Rules | `.claude/skills/permissions/`, `.claude/skills/lib-layers/`, `.claude/skills/navigation/`    |
| Code  | `libs/message-bus-admin/accounts/`, `libs/message-bus-api/accounts/`, `prisma/schema.prisma` |
| Suite | `apps/message-bus-admin-e2e/` — the stand and the specs of the people and roles screens      |

## What counts as done

- The admin panel has no people and roles sections, and the menu does not name them.
- The server serves no operation over accounts or roles, and the storage has no tables `account`,
  `role`, `account_permission` and `session`.
- A chat operator names its person by the Keycloak id.
- The end-to-end suite of the admin panel passes whole, its frames carry the merged main.

## Stages

### 1. People and roles leave the bus

- **Steps:**
    1. The frames of the suite are taken anew after the merge of main
    2. The specs of the people and roles screens are removed and the access spec is rewritten
    3. The admin panel loses the people and roles sections
    4. The server loses the accounts operations, and the signed-in person is read in the access domain
    5. The storage loses the four tables, and the operator column names the Keycloak person
    6. The stand and the suite lose the people rows
- **Readiness sign:** the admin suite passes whole and nothing in the tree names the accounts domain.
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e` — the line «passed» and no «failed».

## What this work does not do

- Does not move the production people into Keycloak: that is RT-2579.
- Does not edit the access law: its article about presets goes to the owner as text.
