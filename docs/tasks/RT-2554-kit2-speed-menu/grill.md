# Grill

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
