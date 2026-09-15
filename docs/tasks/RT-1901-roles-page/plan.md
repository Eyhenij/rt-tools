# Plan

**Task:** RT-1901 · **Branch:** RT-1901-roles-page
**Draft:** `docs/specs/message-bus/proposed/roles-page/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/proposed/roles-page/` → `docs/specs/message-bus/roles-page/`; `access-rights` (the open question closes); `spec.md` of the domain (the subdomain table); `admin` (the section table, if it lists sections)                                                                                                                                                                                                                                                |
| Laws  | `docs/constitution/application/access.md`, `docs/constitution/entity-editing.md`, `docs/constitution/lists.md`, `docs/constitution/navigation.md`                                                                                                                                                                                                                                                                                                                                 |
| Rules | `.claude/skills/permissions/` (the companion names the roles page), `lists`, `entity-conventions`, `navigation`, `lib-layers`, `testing`                                                                                                                                                                                                                                                                                                                                          |
| Code  | receiver: `libs/message-bus-api/accounts/{util,data-access,feature}/`, `libs/message-bus-common/`; admin: `libs/message-bus-admin/accounts/{util,api,data-access,feature/*,shell}/`, `libs/message-bus-admin/common/core/util/` (the dictionary), `libs/message-bus-admin/common/container/util/` (the menu), `apps/message-bus-admin/src/app/app.routes.ts`; suite: `apps/message-bus-admin-e2e/`; boundaries: `eslint/boundaries/domains/message-bus-admin-accounts.config.mjs` |

Both sides keep the roles inside the `accounts` domain: the roles are the access side of the
people, the receiver already reads the role and the edits of an account there, and a domain of its
own would be six libs for two screens and a store.

## What counts as done

- A signed-in person with `roles:manage` sees the item "Роли", creates a role from the panel,
  recomposes and renames it, deletes one nobody holds; without the right the item is absent and
  the address does not open.
- From the people list the item "Права" opens the panel of access: the role and three words per
  right with the outcome; the save replaces the access whole, and the person, signed in, sees
  exactly the sections their rights name — checked by the end-to-end suite.
- The receiver refuses a taken name, a right outside the set, deleting a held role and an edit
  that would lock the signed-in person out — checked by call.
- The agreement is merged into the domain as the subdomain `roles-page` with its companion; the
  open question of `access-rights` is closed; every scenario SC-MB-371…382 has a test.

## Stages

### 1. The receiver: roles and the access of a person

- **What is done:** the shared views `IRoleView`, `IPersonAccessView` in the common lib; the
  queries over roles and over the access of a person in the accounts data-access; the pure parse
  of the role input and of the access input, the key of a role and the lock-out decision in the
  accounts util; the controllers `roles` and `accounts/:name/access` closed by `roles:manage`,
  with the tests SC-MB-376, 379, 380, 381, 382 by a storage double.
- **Readiness sign:** the receiver builds; the accounts feature and util tests are green with the
  new files on top of the 34 and 11 of today.
- **Verified by:** `pnpm exec nx build message-bus` — ends without an error line;
  `pnpm exec nx run-many -t test -p message-bus-api-accounts-feature message-bus-api-accounts-util`
  — «Successfully ran target test for 2 projects» and the test count above 45.

### 2. The admin panel: the section of roles and the panel of access

- **What is done:** the words in the dictionary, the right labels by section; the role model,
  columns, mapper and logic in the accounts util; `RolesApiService` and the access calls in the
  accounts api; `RolesStore` and the access calls of `PeopleStore`; the screens
  `feature/roles-list`, `feature/role-aside`, `feature/access-aside`; the routes «roles»,
  «roles/new», «roles/:id», «people/:id/access»; the menu item "Роли" with `roles:manage`; the
  boundaries lines; the unit tests of the list and of the pure outcome of the access form.
- **Readiness sign:** the admin panel builds; the layer check and the dupes check are green; the
  accounts admin tests are green with the new files.
- **Verified by:** `pnpm exec nx build message-bus-admin` — ends without an error line;
  `pnpm run check:layers` and `node tools/check-dupes.mjs` — no divergence line;
  `pnpm exec nx run-many -t test -p message-bus-admin-accounts-feature-list message-bus-admin-accounts-util message-bus-admin-accounts-feature-roles-list message-bus-admin-accounts-feature-access-aside`
  — «Successfully ran target test».

### 3. The end-to-end suite

- **What is done:** the section `roles` in the suite support; the spec `roles.spec.ts` with
  SC-MB-371…378; the frames of the roles list and of the panel of access; every frame with the
  top row re-taken for the seventh item.
- **Readiness sign:** the whole suite is green: 112 of today plus the new tests.
- **Verified by:** `npx playwright test` from `apps/message-bus-admin-e2e` — the line
  «N passed» with N above 112 and no «failed».

### 4. The texts and the closing

- **What is done:** the agreement merges into `docs/specs/message-bus/roles-page/` with the
  companion; the domain `spec.md` gains the subdomain row and the history line; `access-rights`
  closes its open question; the permissions companion names the page; READMEs of the touched
  libs; the archive record; the folder taken apart.
- **Readiness sign:** the specs check, the doc paths check, the file size check and the lint are
  green.
- **Verified by:** `node tools/check-specs.mjs` — «divergences 0» absent from the tail, that is
  no line «divergences N»; `node tools/check-doc-paths.mjs` and `node tools/check-file-size.mjs`
  — no refusal line; `pnpm run lint` — «Successfully ran target lint».

## What this work does not do

- Removing the launch-line commands and the first record's path — task #1902.
- A role assigned at creating a person — an open question of the agreement, not a task yet.
- The screen for a person without a single right after the sign-in — a question of the epic,
  noted in the plan of the epic when this task closes.
