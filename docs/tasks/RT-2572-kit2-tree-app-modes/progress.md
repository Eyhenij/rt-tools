# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 5 — The component
- **Done:** the grill, the plan; the logic — `rtTreeChooseAlone`, the word cut, 11 tests; `rt-tag` `highlight`, 29 tests
- **Next step:** the new inputs of `rt-tree` (step 3.1)
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write `rtTreeChooseAlone` and the word cut of the label, description and badges in `rt-tree.logic.ts`.
- [x] 1.2 Write the rules and the scenarios of the logic into the tree spec, with tests in `rt-tree.logic.spec.ts`.
- [x] 2.1 Add the `highlight` input to `rt-tag` with its rule, scenario and test.
- [>] 3.1 Add `branchMarks`, `exclusive`, `filter`, the badges and the `rtTreeNodeMeta` slot to `rt-tree`.
- [ ] 3.2 Write the component scenarios and tests in `rt-tree.component.spec.ts`.
- [ ] 4.1 Add the new axes to the tree and tag stories and to both `Overview.mdx`.
- [ ] 4.2 Run the story sweep over the raised showcase.
- [ ] 4.3 Give the owner the links to the stories on :6007.
- [ ] 4.4 Take the snapshots after the owner's look and look at every frame.
- [ ] 5.1 Run the spec check and the full set before the push.

## Decisions along the way

- **The branch stands on the epic branch, not on RT-2549** — `rt-tree` does not depend on the
  dragged tree, and #2568 is merged there.
- **The word cut lives next to the side-menu cut** — `rt-tag` needs it too, and an atom does not
  import an organism. Affected stage: 1.

## Sessions

### 2026-10-06

- The task taken after PR #2574 opened.
