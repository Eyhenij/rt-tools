# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — The shared module
- **Done:** the task folder
- **Next step:** create the shared module after the import map of the moved names is read
- **Uncommitted:** the owner's `.claude/rt-kit/assignments.md` row
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 Create the shared module under `src/lib/` with the tree walk, its types, the scroll helper and the highlight, and publish it from `core`.
- [ ] 1.2 Turn the select and side-menu files into re-exports of the moved names, marked `@deprecated`.
- [ ] 1.3 Move the tests of the moved functions next to the module.
- [ ] 2.1 Switch the six users to import from `core`.
- [ ] 2.2 Point the spec bindings at the new file.
- [ ] 3.1 Run the push gate set, the showcase snapshots included.

## Decisions along the way

None yet.

## Sessions

### 2026-10-20

- The task taken under epic RT-2861; the epic branch caught up with `main`.
