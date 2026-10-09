# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Showcase
- **Done:** the subdomain spec with scenarios SC-UKV-798–805; `rtPopover` takes its own places and
  `rt-icon-button` says it is expanded, both silent without the new inputs; the component, its model,
  logic and styles; 20 specs of the menu and three of the neighbours; the overview page, the folder
  note and the stories.
- **Next step:** the measurement of the stories on :6007.
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
- The open menu stands one per story and without the pair of presets. A press on a second menu is a
  press outside the first and closes it, so the four sides are four stories, and the presets and
  themes show the closed trigger.
- The keyboard is told from the mouse by the click count: a press by a key comes with a count of
  zero. The stories open the menu by a click event without that count, so the frame shows no focus
  ring and no tooltip.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [x] 1.2 Write the subdomain spec, scenarios and bindings for the quick menu
- [x] 2.1 Give `rtPopover` the positions input and `rt-icon-button` the expanded input
- [x] 2.2 Write the component, its model and styles in the components layer
- [x] 2.3 Write the specs on the opening, the directions, the choice, the closing and the keys
- [x] 3.1 Write the overview page, the matrix stories and the playground
- [>] 3.2 Measure the layout on :6007
- [ ] 4.1 Take the references of the new stories after looking at them
- [ ] 4.2 Run the whole set and open the PR into the epic branch after the owner's word
