# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — the admin panel: the section of roles and the panel of access
- **Done:** stage 1 — the receiver: `IRoleView`, `IPersonAccessView` in the common lib; the role
  queries; the parse and the lock-out decision; `RolesController` and `AccountsAccessController`
  under `roles:manage`; build green, 69 + 38 tests green
- **Next step:** the dictionary words and right labels, the admin models and stores, the three
  screens, the routes, the menu item, the boundaries
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The roles stay in the `accounts` domain on both sides.** A domain of its own would be six libs
  for two screens and a store; the receiver already reads the role of an account there. Affected
  stage of the plan: 1, 2.

## Sessions

### 2026-09-15

- The epic branch got main merged in (ten frames re-taken, 112 green) and the renumbering of
  SC-MB-359 → SC-MB-370 after a collision with main; both pushed.
- The task branch, the folder, the agreement and the plan.
