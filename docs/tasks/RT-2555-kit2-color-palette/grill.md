# Grill

## The owner request

> 1-9 берем

The words answer the list of the epic RT-2542; item 8 of it is the colour palette. The task card
#2555 retells it: «Палитра в приложении выбирает цвет из набора, допускает свой цвет и режим только
для чтения. Сделана на сторонней библиотеке. Во втором ките выбора цвета нет. Нужна
`rt-color-palette` со своей разметкой, без сторонних пакетов, как поле формы.»

A later word of the owner sets the shape of every port: «все переносимые компоненты из апки должны
иметь базовую вьюху кита + материальную но без использования пакетов материал, стили должны быть
заданы через токены чтобы поддавались модификации из апки + необходимые входы».

The delivery waits: «пры не открывай откроеш после моего апрува, проверь сам живьем все».

## What the application's component does

- A form field with a `#rrggbb` value, no alpha; a value that is not such a hex is ignored.
- Round swatches 30 points wide with gaps of 10, wrapping by the width. The chosen swatch shows a
  ring: its fill shrinks to a hollow centre with a glow around it. There is no check mark.
- The list is the inputs' own colours, a theme list, or a default list of eighteen colours.
- A colour outside the list shows as one more swatch. A text button «choose a custom colour» or
  «edit the custom colour» opens a panel with a saturation area, a hue slider, hex and RGB fields,
  and the buttons Cancel and Submit; Submit waits for a change.
- Read only: one swatch of 32 points with a thin border in the current colour, white when empty.
- No disabled look, no names for a screen reader, no arrows; swatches take Enter.
- Two screens use it: the role editor and the season settings, the second with read only.

## What the tree already has

- `RtFormControlBase<TValue>` is the base of every kit field: forms of both kinds, the error and
  the hint inside `rt-field`, size and disabled.
- `rtPopover` is the floating panel on CDK Overlay with Escape, a press outside and the presets
  carried onto the pane.
- `rt-input` is the text field; `rtButton` gives the kit buttons.
- The kit dictionary holds `uiCancel` and `uiApply`.

## What the rules already say

- A port takes the application's component into the kit; no Material and no third-party package.
- Every port has the kit look and the material look, its styles stand on its own `--rt-color-palette-*`
  properties, and the defaults of a ready component do not move.
- Every interactive element carries `qa-dataid`; labels come from the kit dictionary.

## Questions and answers

None: the shape follows the task card, the application's component and the owner's word on ports.

## Decisions

- **One component `rt-color-palette`, a field on `RtFormControlBase<string | null>`.** The value is
  `#rrggbb` in lower case; anything else written into it is read as no colour.
- **The swatches are a radio group.** Arrows move the choice and select, Home and End take the
  ends; one swatch is in the Tab order. The application's swatches had neither names nor arrows.
- **The custom colour is picked in the kit's own panel on `rtPopover`.** A saturation and
  brightness area, a hue strip, a hex field, Cancel and Apply — drawn by the kit, with keys on both
  the area and the strip. The colour maths is a pure module checked by calls.
- **The default list is the eighteen colours of the application's default list.** A theme list is
  the application's own and arrives by the colours input.
- **Every size, gap, ring, border and radius is a `--rt-color-palette-*` property.** The kit look
  is the default; the material preset paints the panel and the buttons through the shared
  assignments.

## What is left unclear

- The look of the ring and of the panel — shown on the showcase, the owner judges there.
