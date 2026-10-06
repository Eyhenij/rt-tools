# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — The component
- **Done:** the epic RT-2542 with nine tasks; the agreement; the pure logic (9 tests); the component, its directive, template, styles, barrel export and `CONTEXT.md` — typecheck and lint green
- **Next step:** write `rt-tree.component.spec.ts` for SC-UKV-639 … SC-UKV-651 through the drawn component; then `Overview.mdx`; the truncated label and description still need the kit tooltip-when-truncated directive (rule "truncation goes in a pair with a tooltip")
- **Uncommitted:** the folders of the other eight tasks of the epic — each goes into its own branch
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Declare `IRtTree` in `rt-tree.model.ts`: the node, the mode, the mark.
- [x] 1.2 Write `rt-tree.logic.ts`: `rtTreeChoose`, `rtTreeMark`, `rtTreeSelectAll`, `rtTreeLabelParts` over the select tree module.
- [x] 1.3 Write `rt-tree.logic.spec.ts` for SC-UKV-639 … SC-UKV-643, SC-UKV-645, SC-UKV-647 by the logic.
- [x] 2.1 Write `rt-tree.component.ts`, `.html`, `.scss` and `rt-tree.directives.ts` with the row template directive.
- [x] 2.2 Export the folder from the components barrel.
- [>] 2.3 Write `rt-tree.component.spec.ts` for every scenario through the drawn component.
- [ ] 2.4 Write `CONTEXT.md` and `Overview.mdx` next to the component.
- [ ] 3.1 Write the stories of `rt-tree` with a matrix per axis.
- [ ] 3.2 Run the story sweep over the raised showcase.
- [ ] 3.3 Take the snapshots of the new stories and look at every frame.
- [ ] 3.4 Give the owner the links to the stories on :6007.
- [ ] 4.1 Merge the agreement into `docs/specs/ui-kit-v2/tree/` and name it in the domain index.
- [ ] 4.2 Run the spec check and the full set before the push.

## Decisions along the way

- **The epic grill lives in this folder.** It was written for the whole epic before the numbers
  existed; RT-2548 is the first task, and the grill leaves for the archive with this folder.

## Sessions

### 2026-10-06

- The epic RT-2542 and tasks RT-2548 … RT-2556 created; the epic branch pushed.
- The consumer's name got into the first epic card and branch name; the owner caught it, both fixed
  before the branch left the machine.
