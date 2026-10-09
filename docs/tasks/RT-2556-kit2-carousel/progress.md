# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Snapshots and delivery
- **Done:** the subdomain spec with scenarios SC-UKV-825–829, the tone logic, the component with both
  looks, 22 specs green, types, linter, token and cascade checks clean; the overview, five matrix
  stories and the playground, looked at in their frames and taken as references.
- **Next step:** run the whole snapshot set, take the folder apart and open the PR into the epic
  branch when the owner approves.
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — the push and the PR wait
  for the owner's approval.
- **PR:** not open

## Decisions along the way

- The application's component, read before the spec: an overlapping stack of coloured label cards
  in a table cell, not the scrolling carousel of the task card. The port carries the stack, and the
  divergence is named to the owner. The whole reading is in `grill.md`.
- The material preset takes the regular weight: the application's label is 300, and the kit has no
  such step. Affected stage: 2.
- The open look of a card is drawn by the styles alone, so SC-UKV-828 is covered partly by a call
  and partly by the States frame, and SC-UKV-829 by the Presets and Themes frames. Affected stage: 2.
- The layout was looked at in the snapshot frames rather than through the browser plugin: the
  session's tab group was gone, and the tree has no pinned browser profile, so the browser was not
  driven. Affected stage: 3.
- Row 133 of the application came in the middle of the work and went into PR #2748; the carousel
  work was set aside by a named stash and restored after the merge. Affected stage: 2.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [x] 1.2 Write the subdomain spec, scenarios and bindings for the carousel
- [x] 2.1 Write the tone choice as a pure function with its specs
- [x] 2.2 Write the component, its model and styles in the components layer
- [x] 2.3 Write the specs on the cards, the colour, the tone, the focus and an empty list
- [x] 3.1 Write the overview page, the matrix stories and the playground
- [x] 3.2 Measure the layout on :6007
- [x] 4.1 Take the references of the new stories after looking at them
- [>] 4.2 Run the whole set and open the PR into the epic branch after the owner's word
