# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — Agreement
- **Done:** the grill and the plan; the application's component is read.
- **Next step:** the subdomain spec of the palette with its scenarios and bindings.
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — the push and the PR wait
  for the owner's approval.
- **PR:** not open

## Decisions along the way

- The application's component, read before the spec. A form field on a third-party colour package
  with a `#rrggbb` value and no alpha. Round swatches of 30 points with gaps of 10 wrap by the width;
  the chosen one is a hollow ring. A colour outside the list shows as one more swatch, and a text
  button opens a panel with a saturation area, a hue slider, hex and RGB fields, Cancel and Submit.
  Read only is one swatch with a thin border. No disabled look, no names, no arrows. Two screens use
  it: the role editor and the season settings.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [>] 1.2 Write the subdomain spec, scenarios and bindings for the palette
- [ ] 2.1 Write the colour maths as a pure module with its specs
- [ ] 2.2 Write the field, the swatches and the custom colour panel in the components layer
- [ ] 2.3 Write the specs on the value, the choice, the keys, read only, disabled and the panel
- [ ] 3.1 Write the overview page, the matrix stories and the playground
- [ ] 3.2 Measure the layout on :6007
- [ ] 4.1 Take the references of the new stories after looking at them
- [ ] 4.2 Run the whole set and open the PR into the epic branch after the owner's word
