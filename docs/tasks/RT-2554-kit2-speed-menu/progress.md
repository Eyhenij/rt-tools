# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — Agreement
- **Done:** the task folder; the application's component is read.
- **Next step:** the subdomain spec, scenarios and bindings.
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — the push and the PR wait
  for the owner's approval.
- **PR:** not open

## Decisions along the way

- The application's sample, read before the spec. A round icon toggles a column of round Material
  buttons above it; the icon turns into a cross while open. Actions are bare icon names, and the
  choice sends the name and leaves the menu open. A transparent layer over the window closes it on
  a press outside. The buttons come in one by one, the nearest first. There is no Escape, no focus
  move and no accessible name on the buttons; the column stands in the flow, and only the upward
  direction is styled. The one place it is used is a zoom menu in the side menu footer: zoom in,
  zoom out, reset.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [>] 1.2 Write the subdomain spec, scenarios and bindings for the quick menu
- [ ] 2.1 Give `rtPopover` the positions input and `rt-icon-button` the expanded input
- [ ] 2.2 Write the component, its model and styles in the components layer
- [ ] 2.3 Write the specs on the opening, the directions, the choice, the closing and the keys
- [ ] 3.1 Write the overview page, the matrix stories and the playground
- [ ] 3.2 Measure the layout on :6007
- [ ] 4.1 Take the references of the new stories after looking at them
- [ ] 4.2 Run the whole set and open the PR into the epic branch after the owner's word
