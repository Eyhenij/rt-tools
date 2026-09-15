# Plan

**Task:** RT-1902 · **Branch:** RT-1902-first-run
**Draft:** `docs/specs/message-bus/proposed/first-run/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/proposed/first-run/` → `docs/specs/message-bus/first-run/`; `admin-auth` (the rule, the decision and the scenarios about the commands); `spec.md` of the domain (the surface table, the decision, the subdomain table)                                                                                                                                                                                                                |
| Laws  | `docs/constitution/application/access.md`, `docs/constitution/navigation.md`                                                                                                                                                                                                                                                                                                                                                                                  |
| Rules | `.claude/skills/permissions/` (the companion names the public first-run operations), `testing`, `spec-driven`, `agent-kit-source` (the intake test)                                                                                                                                                                                                                                                                                                           |
| Code  | receiver: `libs/message-bus-api/accounts/{util,data-access,feature}/`, `apps/message-bus/src/main.ts`, `apps/message-bus/src/app/commands.module.ts`; admin: `libs/message-bus-admin/auth/{util,api,data-access,feature/*,shell}/`, `libs/message-bus-admin/common/core/util/` (the dictionary); stand: `apps/message-bus-admin-e2e/stand/`, `apps/message-bus-admin-e2e/src/`; intake: `tools/cargo-pull.mjs`, `projects/agent-kit/tests/cargo-pull.test.sh` |

## What counts as done

- `account:add`, `account:passwd`, `account:disable` and `account:list` are not in the tree, and
  the launch line answers an account command with the list of the tree commands.
- A node with an empty storage shows the first-run screen behind the address of the admin panel;
  the first record is created from it with the owner role and lands signed in; after it the
  first-run address shows the sign-in and a direct request is refused — checked by call and by
  the end-to-end suite where the stand can reach it.
- The stand seeds the account and the people by the operations, and the suite is green.
- The agreement is merged into the domain as the subdomain `first-run` with its companion; the
  texts of the domain, of `admin-auth` and of the intake name the screen; every scenario
  SC-MB-383…394 has a test or a partial-coverage mark with the reason.

## Stages

### 1. The receiver: the first-run operations and the end of the commands

- **What is done:** `SetupController` with `GET /api/setup` and `POST /api/setup` — the count of
  records, the creation with the owner role inside a transaction, the sign-in with the cookie,
  the refusals; the startup line names the screen; `AccountCommandsService`, its module, the
  command parse and the report leave, `main.ts` and `commands.module.ts` stop knowing them; the
  tests SC-MB-383…389 by a storage double; SC-MB-393 on the tree commands service.
- **Readiness sign:** the receiver builds; the accounts feature tests are green with the command
  tests gone (15 of today's 69) and the first-run tests added; the trees feature tests are green.
- **Verified by:** `pnpm exec nx build message-bus` — ends without an error line;
  `pnpm exec nx run-many -t test -p message-bus-api-accounts-feature message-bus-api-accounts-util message-bus-api-trees-feature`
  — «Successfully ran target test for 3 projects».

### 2. The admin panel: the first-run screen

- **What is done:** the dictionary words; `AuthApiService.setupOpen` and `setUp`;
  `AuthStore.setupOpen()` and `setUp(pair)` answering like the sign-in; the lib
  `auth/feature/setup` with `AdminSetupComponent` on the `login` layout block and the route
  `setup`; the sign-in screen sends to `setup` while the first run is open, the first-run screen
  sends to `sign-in` when it is closed; the boundaries and the alias; unit tests SC-MB-390, 391
  by call.
- **Readiness sign:** the admin panel builds; the layer check and the dupes check are green; the
  auth tests are green with the new files.
- **Verified by:** `pnpm exec nx build message-bus-admin` — ends without an error line;
  `pnpm run check:layers` and `node tools/check-dupes.mjs` — no divergence line;
  `pnpm exec nx run-many -t test -p message-bus-admin-auth-feature-setup message-bus-admin-auth-feature-sign-in message-bus-admin-auth-data-access`
  — «Successfully ran target test».

### 3. The stand, the suite and the intake text

- **What is done:** the stand seeds the account by `POST /api/setup` and the people by
  `POST /api/accounts` and `POST /api/accounts/<name>/disable` with the cookie of the first
  record; `first-run.spec.ts` with SC-MB-392 and SC-MB-394; the intake refusal names the people
  section instead of the command, and its scenario SC-AK-561 reads the new word.
- **Readiness sign:** the whole suite is green: 121 of today plus the new tests; the intake test
  is green.
- **Verified by:** `npx playwright test` from `apps/message-bus-admin-e2e` — the line «N passed»
  with N above 121 and no «failed»; `bash projects/agent-kit/tests/cargo-pull.test.sh` — no
  «FAIL» line.

### 4. The texts and the closing

- **What is done:** the agreement merges into `docs/specs/message-bus/first-run/` with the
  companion; `admin-auth` rewords its rule, its decision and the scenarios SC-MB-33, 42, 43, 58,
  59 to the screen; the domain `spec.md` gains the subdomain row, drops the command rows of the
  surface table and rewords the decision; the permissions companion names the public first-run
  operations; the epic plan closes its question about the first record; the archive record; the
  folder taken apart.
- **Readiness sign:** the specs check, the doc paths check, the file size check and the lint are
  green.
- **Verified by:** `node tools/check-specs.mjs` — no line «divergences N»;
  `node tools/check-doc-paths.mjs` and `node tools/check-file-size.mjs` — no refusal line;
  `pnpm run lint` — «Successfully ran target lint».

## What this work does not do

- The "no sections" screen for a person without a single right — the epic plan's open question,
  a task of its own after the epic.
- The tree commands of the launch line stay as they are.
- The password typed twice on the first-run screen — an open question of the agreement.
