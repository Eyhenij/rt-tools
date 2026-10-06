# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — The showcase
- **Done:** the grill, the agreement, the plan; the logic and the component, 12 tests; the stories and `Overview.mdx`, the sweep green over 772 stories; the agreement merged into the domain spec
- **Next step:** the owner looks at the stories on :6007 (step 3.3)
- **Uncommitted:** five snapshot frames, taken and looked at, kept until the owner's look
- **Waiting for the owner:** the look at the stories
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write `rt-draggable-tree.logic.ts`: `rtDragPlace`, `rtDragAllowed`, `rtDragMove`, `rtDragKeyPlace`.
- [x] 1.2 Write `rt-draggable-tree.logic.spec.ts` for SC-UKV-654 … SC-UKV-658.
- [x] 2.1 Write `rt-draggable-tree.component.ts`, `.html`, `.scss` and the row template directive.
- [x] 2.2 Export the folder from the components barrel and write `CONTEXT.md`.
- [x] 2.3 Write `rt-draggable-tree.component.spec.ts` for SC-UKV-659 … SC-UKV-663.
- [x] 3.1 Write the stories with `Playground` and the matrices, and `Overview.mdx`.
- [x] 3.2 Run the story sweep over the raised showcase.
- [>] 3.3 Give the owner the links to the stories on :6007.
- [ ] 3.4 Take the snapshots after the owner's look and look at every frame.
- [x] 4.1 Merge the agreement into `docs/specs/ui-kit-v2/draggable-tree/` and name it in the domain index.
- [ ] 4.2 Run the spec check and the full set before the push.

## Decisions along the way

- **The branch stands on `RT-2548-kit2-tree`** — the epic plan stacks the tree tasks; the PR goes
  into that branch's successor base once #2568 is merged.

- **All branches are open when the tree appears** — an order is judged seen whole; what the person
  folds stays folded, and a container a node was put into opens. Affected stage: 2.
- **The handle is decoration, the row moves by keys** — the handle has no label of its own, so no
  new kit label is started; Alt with an arrow is the way without a mouse. Affected stage: 2.
- **The row content has a gap** — the frame of the application markup showed the tag glued to
  the label; the content element got `--rt-space-sm` between its children. Affected stage: 3.

## Sessions

### 2026-10-06

- The task taken after PR #2568 opened; the owner answered the four grill questions.
