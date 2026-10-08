# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Snapshots and delivery
- **Done:** the spec, the component, ten specs, the overview page and seven stories; the frames were
  looked at and measured on :6007; seven references are taken.
- **Next step:** run the whole set of the second kit, then take the folder apart when the owner
  approves the opening.
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — the push and the PR wait
  for the owner's approval in the morning
- **PR:** not open

## Decisions along the way

- The ancestors keep their width and the row scrolls to its end: a shrinking last crumb collapsed to
  nothing once the row overflowed, and the open page vanished from a long chain.
- The row is scrolled to its end again whenever a crumb changes size: the page font arrives after the
  first render, and the end measured before it was 32 pixels short.
- The focus ring gets inner room in the scrolling row: the row clipped it to two vertical bars.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the subdomain spec, scenarios and bindings for the breadcrumbs
- [x] 1.2 Take scenario numbers from the tree command
- [x] 2.1 Write the component, its model and styles in the components layer
- [x] 2.2 Write the specs on inputs, links, the back button and the fold
- [x] 3.1 Write the overview page, the matrix stories and the playground
- [x] 3.2 Measure the layout on :6007 and show it to the owner
- [x] 4.1 Take the references of the new stories after looking at them
- [>] 4.2 Run the whole set and open the PR into the epic branch after the owner's word
