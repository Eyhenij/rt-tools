# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — the admin panel: the first-run screen
- **Done:** stage 1 — the receiver: `SetupController` with `GET`/`POST /api/setup`, the first
  record under a table lock with the owner role and the sign-in by the shared issue
  `sign-in-issue.ts`, the startup line names the screen, the four commands and their parse and
  report are gone from the tree; build green, 61 + 38 + 43 tests
- **Next step:** the dictionary words, `AuthApiService`/`AuthStore` first-run calls, the lib
  `auth/feature/setup`, the route `setup`, the redirects of both screens, the unit tests
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The first record is created and signed in by one public operation, and the screen closes
  after it.** The card proposed the screen; the sign-in in the same operation spares a second
  screen for a pair typed a moment ago. Affected stage of the plan: 1, 2.

## Sessions

### 2026-09-15

- The task branch from the epic branch, the folder, the agreement and the plan.
- Stage 1: the receiver. The sign-in issue moved out of the auth controller into a file of its
  own so that the first record signs in by the same road as the sign-in.
