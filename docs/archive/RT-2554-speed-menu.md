# Grill

Former address: docs/tasks/RT-2554-kit2-speed-menu/grill.md

## The owner request

> 1-9 берем

The words answer the list of the epic RT-2542; item 7 of it is the quick menu at the floating button.
The task card #2554 retells it: «Быстрое меню в приложении — круглая плавающая кнопка, которая
раскрывает несколько действий. Сделана на Material FAB. Во втором ките такого нет. Нужен свой
вариант на кнопках кита. Место в ките подтверждается показом на витрине.»

A later word of the owner holds the delivery: «снимай драфт пр и возвращайся к эпику делай все я
утром гляну пры не открывай откроеш после моего апрува, проверь сам живьем все».

## What the tree already has

- The second kit has the round icon button `rt-icon-button` with the radius `full`, the tooltip on
  it, and the floating panel `rtPopover` on CDK Overlay: Escape, a press outside, the theme of the
  place and the Material preset carried onto the panel.
- `rtPopover` places its panel only below or above the host; a quick menu also opens to the sides.
- `rt-icon-button` sets no `aria-expanded`, so a button that opens a panel does not say it is open.
- The epic plan says every component is shown on :6007 first, and the PR opens after the owner's
  word.

## What the rules already say

- A port takes the application's component into the kit; no Material in the second kit.
- What the kit has ready is extended, not cloned: the panel is `rtPopover`, the buttons are
  `rt-icon-button`.
- Every interactive element carries `qa-dataid`; labels come from the kit dictionary.
- Any new input of a ready component defaults to its present look.

## Questions and answers

None: the shape follows the task card and the application's component.

## Decisions

- **One component `rt-speed-menu`: a round trigger and a row of round action buttons beside it.**
  The trigger shows its icon closed and a cross open; the actions open up, down, to the start or to
  the end.
- **The panel is `rtPopover`, extended by a positions input that keeps the present two by default.**
  The application's own panel stood in the flow and was cut by any parent with a clipping overflow.
- **A chosen action goes out by an output, and the menu stays open unless an input closes it.** The
  application's zoom menu is pressed several times in a row.
- **`rt-icon-button` gets an `expanded` input that writes `aria-expanded`; without it nothing is
  written.**

## What is left unclear

- The look of the action buttons and the animation — shown on the showcase, the owner judges there.

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
- On 10 October a live comparison measured the application on screen: its actions are filled with
  `--mat-sys-primary-container`, and the icon is `--mat-sys-on-primary-container` at 24px. The
  preset reads both by name with the former grey and dark steps as fallbacks. The icon colour went
  into a new property `--rt-speed-menu-action-color`, whose default is the text colour the
  `secondary` variant set. The 24px icon rewrites the `md` icon step on the panel. Affected stage: 4.

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
