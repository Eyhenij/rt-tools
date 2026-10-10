# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Snapshots and delivery
- **Done:** the subdomain spec with scenarios SC-UKV-798–805; `rtPopover` takes its own places and
  `rt-icon-button` says it is expanded, both silent without the new inputs; the component, its model,
  logic and styles; 20 specs of the menu and three of the neighbours; the overview page, the folder
  note and the stories. Measured on :6007: the four sides, the gaps of 8 points, the keys and the
  press outside. The whole kit set is green, 226 spec files. Main is merged in through the epic.
  The nine references are taken and looked at; the entrance became a transition, and the open
  frames draw the actions.
  The whole set is green: lint, types, tests, build and verify of 112 projects, then the styles
  linter. On 9 October the epic branch with a fresh main went in again; four icon frames were
  retaken for the added `folder`, the other 843 frames matched, and the kit tests and linter passed.
- **Next step:** after the owner's word — the push and the PR into the epic branch; meanwhile the
  next task of the epic, RT-2555.
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
- The actions got an opaque ground of the surface colour. The second palette of the icon button
  fills with 4% of black, and over a map or a table the actions were lost.
- A press below the page body does not close the menu: the overlay listens to the presses on the
  body, and in the showcase the body is 435 points of a window of 1203. Every kit panel behaves so;
  a press inside the page closes the menu.
- The first take of the references drew the four open frames with the trigger alone: no action and
  no panel ground in a single pixel. The same steps of the harness repeated in the browser tab, on
  the live and on the built showcase, leave the actions drawn. The nine references were removed
  untaken. A retake with the entrance animation switched off, to tell whether the animation is the
  cause, did not run: on the network 172.20.10.x the image browser does not reach the showcase,
  twice by the timeout of page loading.
- The entrance is a transition from a starting style, not a keyframe animation. On the home network
  the retake ran: with the animation the four open frames again drew the trigger alone, with the
  animation switched off they drew the actions. The image browser left the keyframes at their first
  frame, while the harness brings transitions to their end, as it does for the expansion panel. The
  transition version matched the frames without animation pixel for pixel, all nine.
- The `expanded` input of the icon button is named in the accepted list of the boolean input check,
  next to `pressed`: the third value is a button that opens nothing and carries no `aria-expanded`.
- On 10 October the stories were compared with the application's code at the owner's word «сравни
  сторис перенесенных компонентов с их использованием». The menu had no material look at all. The
  preset now draws the application's mat-mini-fab: grey circles (dark step in the dark theme) with
  Material elevation 3 and 4 under the pointer, 16px between actions and 28px from the button, entry
  in 100 ms with a 50 ms step. Two properties were added for that: `--rt-speed-menu-inset` and
  `--rt-speed-menu-action-shadow-hover`; both default to what stood there, and 847 frames matched.
  The story UpMaterial shows the open menu under the preset: the overlay takes the flag from the
  container. The application's bare trigger is the `ghost` variant, an input, not the preset.
  Affected stage: 4.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [x] 1.2 Write the subdomain spec, scenarios and bindings for the quick menu
- [x] 2.1 Give `rtPopover` the positions input and `rt-icon-button` the expanded input
- [x] 2.2 Write the component, its model and styles in the components layer
- [x] 2.3 Write the specs on the opening, the directions, the choice, the closing and the keys
- [x] 3.1 Write the overview page, the matrix stories and the playground
- [x] 3.2 Measure the layout on :6007
- [x] 4.1 Take the references of the new stories after looking at them
- [>] 4.2 Run the whole set and open the PR into the epic branch after the owner's word
