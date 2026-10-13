# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — The changelog generator
- **Done:** the old CLI is replaced by `conventional-changelog` 8.1.3 with the preset 9.4.0; the
  six scripts lost `-s`; 352 of 352 tasks are green
- **Next step:** run the push gate set
- **Uncommitted:** folders of other tasks of the epic, not part of this branch
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Replace the old CLI with the new package and the preset in the root manifest
- [x] 1.2 Drop `-s` from the six scripts and the header comment
- [x] 1.3 Compare the new output with the old one for three packages
- [>] 1.4 Run build, types, tests and lint over the tree and the push gate set

## Decisions along the way

- **Two differences in the output are accepted** — the new command writes `%40` instead of `@` in
  the compare links, and leaves out the blank line after a release heading. Both compare links
  open on the host with code 200. The fold script reads headings, not links, and a run of the
  whole script on a copy of the core log ended without an error. Affected stage of the plan: 1.

## Sessions

### 2026-10-13

- The task is taken. Old and new output of the core, the second kit and the rules package differ
  only in those two ways; 352 of 352 tasks.
