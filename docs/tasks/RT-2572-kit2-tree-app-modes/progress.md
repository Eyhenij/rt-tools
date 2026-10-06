# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — Closing
- **Done:** the grill, the plan; the logic — `rtTreeChooseAlone`, the word cut, 11 tests; `rt-tag` `highlight`, 29 tests; `rt-tree` `branchMarks`, `exclusive`, `filter`, badges, `rtTreeNodeMeta` — 28 tests, typecheck green; stories `BranchMarks`, `NodeMeta`, tag `Highlight`, sweep green over 769 stories
- **Next step:** the full set, then the folder taken apart and the PR (step 5.1)
- **Uncommitted:** nothing
- **Waiting for the owner:** no — the owner said «Ок, открывай»
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write `rtTreeChooseAlone` and the word cut of the label, description and badges in `rt-tree.logic.ts`.
- [x] 1.2 Write the rules and the scenarios of the logic into the tree spec, with tests in `rt-tree.logic.spec.ts`.
- [x] 2.1 Add the `highlight` input to `rt-tag` with its rule, scenario and test.
- [x] 3.1 Add `branchMarks`, `exclusive`, `filter`, the badges and the `rtTreeNodeMeta` slot to `rt-tree`.
- [x] 3.2 Write the component scenarios and tests in `rt-tree.component.spec.ts`.
- [x] 4.1 Add the new axes to the tree and tag stories and to both `Overview.mdx`.
- [x] 4.2 Run the story sweep over the raised showcase.
- [x] 4.3 Give the owner the links to the stories on :6007.
- [x] 4.4 Take the snapshots after the owner's look and look at every frame.
- [>] 5.1 Run the spec check and the full set before the push.

## Decisions along the way

- **The branch stands on the epic branch, not on RT-2549** — `rt-tree` does not depend on the
  dragged tree, and #2568 is merged there.
- **The word cut lives next to the side-menu cut** — `rt-tag` needs it too, and an atom does not
  import an organism. Affected stage: 1.
- **The filter reads the label only, the marks read the badges too** — a word found only in a badge
  hides the row while `filter` is on; an application searching by badges turns `filter` off and
  filters itself, as it does today. Affected stage: 3.

## Sessions

### 2026-10-06

- The task taken after PR #2574 opened.
