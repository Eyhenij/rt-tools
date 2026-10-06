# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — Showcase
- **Done:** component, showcase stories and overview; selector tests 17 of 17; 6 snapshots taken and looked at
- **Next step:** confirm the snapshots by a second raising, then bind the spec
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the search and draft logic with its tests
- [x] 1.2 Write the component with its tests
- [x] 1.3 Add the kit labels in eight languages
- [x] 2.1 Write the wrapper, Playground and the matrices
- [x] 2.2 Write the overview page
- [>] 2.3 Take the snapshots and look at them
- [ ] 3.1 Bind the spec rules in the companion and the indexes
- [ ] 3.2 Run the full check set
- [ ] 3.3 Show the stories to the owner

## Decisions along the way

- **The branch is renamed to `RT-2550-kit2-tree-selector`** — the owner turned the task from a
  `rt-multiselect` mode into a port. Affected stage: all.

- **Labels in English and the showcase Russian, not eight languages** — the kit carries one English
  set and the application gives its language through the translator; the multi toggle, its hint and
  the search placeholder reuse the labels of the dynamic selector. Affected stage: 1.

## Sessions

### 2026-10-06

- The branch stands on RT-2584: the epic branch does not carry main until #2585 merges.
