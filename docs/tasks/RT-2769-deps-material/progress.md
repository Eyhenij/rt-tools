# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — CDK and Material raised
- **Done:** task, branch, folder
- **Next step:** write the new versions
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write 22.2.2 for CDK and Material into the root manifest
- [x] 1.2 Install, then run build, types, tests and lint over the tree
- [x] 1.3 Run the showcase frames of both kits and read every diverging frame
- [>] 1.4 Run the push gate set

## Decisions along the way

- CDK 22.2 widened the overlay setting `disposeOnNavigation` to `true`, `false` or `'url-change'`;
  the aside spec typed the read value as a boolean and failed the type check of the second kit.
  The spec now takes the setting's own type; the tree run was 351 of 352 before the fix.
- The showcase frames match without a retake: the first kit 99 of 99, the second 789 of 789, no
  frame diverged.

## Sessions

### 2026-10-12

- Task RT-2769 taken from the epic RT-2765; the branch stands on RT-2783.
