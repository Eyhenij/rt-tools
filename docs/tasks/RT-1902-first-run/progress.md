# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — the stand and the end-to-end suite
- **Done:** stage 1 — the receiver: `SetupController` with `GET`/`POST /api/setup`, the first
  record under a table lock with the owner role and the sign-in by the shared issue
  `sign-in-issue.ts`, the startup line names the screen, the four commands and their parse and
  report are gone from the tree; build green, 61 + 38 + 43 tests. Stage 2 — the admin panel: the
  lib `auth/feature/setup` with `AdminSetupComponent` on the kit `login` block, the route
  `setup`, `AuthStore.setupState`/`setUp`, the sign-in screen sends to `setup` while the first
  run is open and the first-run screen sends to `sign-in` when it is closed, the paths moved to
  `auth/util`; build green, 5 + 6 tests
- **Next step:** `stand/seed-account.mjs` seeds by `POST /api/setup` and the people operations,
  `first-run.spec.ts` with SC-MB-392 and SC-MB-394, the text of `tools/cargo-pull.mjs` and its
  test, the suite run
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The first record is created and signed in by one public operation, and the screen closes
  after it.** The card proposed the screen; the sign-in in the same operation spares a second
  screen for a pair typed a moment ago. Affected stage of the plan: 1, 2.
- **The sign-in screen draws its form at once and leaves for the first-run screen by the answer,
  not after it.** A node with records is the usual case, and an empty card on every sign-in for
  the sake of the one first run would cost every person every time. Affected stage of the plan: 2.
- **The addresses of both screens live in `auth/util`, not next to the routes.** The screens send
  to one another and cannot see the shell, and the container reads the same word from the same
  place. Affected stage of the plan: 2.

## Sessions

### 2026-09-15

- The task branch from the epic branch, the folder, the agreement and the plan.
- Stage 1: the receiver. The sign-in issue moved out of the auth controller into a file of its
  own so that the first record signs in by the same road as the sign-in.
- Stage 2: the admin panel. The first-run screen holds its own form on the kit fields: its fault
  is one word of the receiver, not the three kinds of the sign-in form.
