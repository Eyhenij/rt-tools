# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — the end-to-end suite
- **Done:** stage 1 — the receiver (build green, 69 + 38 tests); stage 2 — the admin panel: the
  dictionary, right labels by section, `RolesStore`, the access calls of `PeopleStore`, the
  screens `roles-list`, `role-aside`, `access-aside`, the routes, the item "Роли", the item
  "Права" of the people row, the boundaries; build, layers, dupes and lint green, 6 + 4 + 12 tests
- **Next step:** the section `roles` in the suite support, `roles.spec.ts` with SC-MB-371…378,
  the frames
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
