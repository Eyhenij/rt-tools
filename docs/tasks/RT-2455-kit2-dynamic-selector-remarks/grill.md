# Grill

## The owner request

> замечания 1 при драге фон прозрачный, кнопки квадратные (нужно опционально по умолчанию круглые), при нажатии добавить попап открывается вдали от кнопки

## What the tree already has

- The row in flight is drawn by CDK in the top layer as a `popover` with a built-in transparent
  background a class rule does not override; the side menu favourites fixed the same by a
  background on an element inside the preview.
- The icon buttons of the list carry no rounding, so they take the icon button's default `md` step.
  Main brought the shared rounding input `radius` (`TRtRadius`) on every kit component.
- The popup is a `rtPopover` on the `anchor` element that wraps the whole list, so it opens under
  the whole block rather than under the button pressed.

## Decisions

- **Round buttons by default, through one rounding input of the selector** — the owner: «опционально
  по умолчанию круглые»; the step comes from the shared scale main brought. Rejected: a shape input
  of its own — main folded such inputs into `radius`.
- **The popup opens from the add button pressed** — each of the two add buttons carries the popover
  itself. Rejected: an origin input on the popover — the popover anchors to its host by design.
- **The row in flight gets its background from a layer inside the preview** — the inline background
  CDK sets on the preview beats any class rule.
