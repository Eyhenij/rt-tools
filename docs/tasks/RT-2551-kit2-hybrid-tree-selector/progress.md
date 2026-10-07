# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Agreement and checks
- **Done:** both components with their tests — 96 tree and selector tests green, typecheck green; the 802 snapshots of the kit match, so `rt-tree` and `rt-tree-selector` kept their look; 9 new snapshots taken, looked at and confirmed by a second raising (811 of 811); check:all green — 131 projects and stylelint
- **Next step:** show the stories on :6007 and wait for «открывай»
- **Uncommitted:** nothing
- **Waiting for the owner:** the look of the stories on :6007 — the PR opens after «открывай»
- **PR:** not open yet

## Steps

- [x] 1.1 Write the single-group logic with its tests
- [x] 1.2 Open the tree and the selector to heirs without changing them
- [x] 1.3 Write both components with their tests
- [x] 2.1 Write the wrappers, Playground and the matrices
- [x] 2.2 Write the overview pages
- [x] 2.3 Take the snapshots and look at them
- [x] 3.1 Bind the spec rules in the companion and the indexes
- [x] 3.2 Run the full check set
- [>] 3.3 Show the stories to the owner

## Decisions along the way

- **The new components inherit, they do not copy** — `rt-hybrid-tree` extends `RtTreeComponent` and
  takes its template and styles; the tree opens four protected points of the choice. The hybrid
  selector extends `RtTreeSelectorComponent`, and the selector template draws the hybrid tree by
  the `hybrid` flag. Affected stage: 1.

## Sessions

### 2026-10-07

- The branch stands on RT-2550, which waits for «открывай»; RT-2550 took the epic branch with
  main merged in, and its 802 snapshots matched after the merge.
