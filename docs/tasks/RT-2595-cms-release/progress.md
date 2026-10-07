# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — The contract
- **Done:** the three publication workflows are in main (#2621 merged by the owner); main merged
  into the epic branch; the lockfile entry for `@rt-tools/utils` of the Angular package added
- **Next step:** 2.1 — run the contract workflow on the task branch
- **Uncommitted:** nothing
- **Waiting for the owner:** nothing
- **PR:** #2621 into main merged; the task PR into the epic branch is not open yet

## Steps

- [x] 1.1 Write the three publication workflows after the auth server one
- [x] 1.2 Open the PR of the workflows into main
- [>] 2.1 Run the contract workflow on the epic branch
- [ ] 3.1 Replace the `workspace:*` links with `^0.1.0` and update the lockfile
- [ ] 3.2 Run the server and the Angular workflows on the task branch

## Decisions along the way

- **The delivery and plan guards are bypassed for this epic.** The owner's words: «Да, на весь
  эпик», «Обходи и его на весь эпик».

- **The workflows run on the task branch, not on the epic branch.** The first run on the epic
  branch failed at the install: the lockfile lacked the `@rt-tools/utils` entry the Angular package
  declares. The fix is an edit, and the epic branch takes merges only; the task branch carries it.

## Sessions

### 2026-10-07

- The task taken after RT-2594 was merged.
- #2621 merged by the owner; the contract run on the epic branch failed at the frozen install.
