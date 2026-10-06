# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — Model and pure logic
- **Done:** the epic RT-2542 with nine tasks, the agreement `docs/specs/ui-kit-v2/proposed/tree/`, the plan
- **Next step:** write `IRtTree` and the pure logic over the select tree module
- **Uncommitted:** the folders of the other eight tasks of the epic — each goes into its own branch
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [>] 1.1 Declare `IRtTree` in `rt-tree.model.ts`: the node, the mode, the mark.
- [ ] 1.2 Write `rt-tree.logic.ts`: `rtTreeChoose`, `rtTreeMark`, `rtTreeSelectAll`, `rtTreeLabelParts` over the select tree module.
- [ ] 1.3 Write `rt-tree.logic.spec.ts` for SC-UKV-639 … SC-UKV-643, SC-UKV-645, SC-UKV-647 by the logic.
- [ ] 2.1 Write `rt-tree.component.ts`, `.html`, `.scss` and `rt-tree.directives.ts` with the row template directive.
- [ ] 2.2 Export the folder from the components barrel.
- [ ] 2.3 Write `rt-tree.component.spec.ts` for every scenario through the drawn component.
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
