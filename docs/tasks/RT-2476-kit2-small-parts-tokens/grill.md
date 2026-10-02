# Grill

## The owner request

> это запрос из апки по миграции с первого кита на второй, там используется материальный вид

> проанализируй, важно правки не должны сломать второй кит

> делай не так как просят а так как лучше

The consumer's items 4, 9 and 14–19: size properties of the tag, the toggle switch and the toggle
button group declared where the component's own tag can override them; a label of the toggle
switch and a property for its disabled opacity; colour, padding and letter-spacing properties of
the tag; height, padding, bottom border, alignment and gap properties of the toolbar; a button
that hides its label while loading and keeps its width; tooltips on the left and on the right.

## What the tree already has

- The tag, the toggle switch and the toggle button group declare their size properties on the
  root of their template. A rule on the component's tag reaches the host, and the declaration on
  the root shadows what the host would pass down.
- The size steps of those three components reassign the properties or the CSS properties on that
  same root.
- The toggle switch dims its disabled look by the literal `0.5`.
- The tooltip places itself above or below; the overlay position logic is shared with the popover.

## Decisions

- **Size properties move to the host, and the size steps move with them.** A step is a host rule
  by an attribute, so a consumer rule on the tag stays stronger than any step.
- **Where a kit modifier must yield to the consumer, the property is a handle.** The tag's colours
  follow its severity and its padding follows its size; the CSS reads the consumer's property
  first and the kit's value as the fallback. Such names are listed as consumer handles.
- **The label of the toggle switch is a sibling of the button inside the host.** It is a `<label>`
  bound to the button, so a press on it toggles and it names the switch for a screen reader.
  Rejected: text inside the button — it would change the button's box for every consumer.
- **The disabled opacity of the toggle switch stays `0.5` by default.** The kit's
  `--rt-opacity-disabled` is `0.6`, and taking it would move the look of every disabled switch.
- **A loading button with a hidden label keeps the label in the box, only invisible.** Its width
  stays the width of the label; the spinner stands over it.
