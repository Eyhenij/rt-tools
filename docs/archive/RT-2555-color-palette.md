# Grill

Former address: docs/tasks/RT-2555-kit2-color-palette/grill.md

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

## Decisions along the way

- The application's component, read before the spec. A form field on a third-party colour package
  with a `#rrggbb` value and no alpha. Round swatches of 30 points with gaps of 10 wrap by the width;
  the chosen one is a hollow ring. A colour outside the list shows as one more swatch, and a text
  button opens a panel with a saturation area, a hue slider, hex and RGB fields, Cancel and Submit.
  Read only is one swatch with a thin border. No disabled look, no names, no arrows. Two screens use
  it: the role editor and the season settings.
- The owner's rule for every ported component: «все переносимые компоненты из апки должны иметь
  базовую вьюху кита + материальную но без использования пакетов материал, стили должны быть заданы
  через токены чтобы поддавались модификации из апки + необходимые входы». The material preset
  reassigns the palette properties after the application: borderless 30-point swatches with gaps of
  10, a hollow 3-point ring on the chosen one, a swatch growing under the pointer.
- The spectrum of the hue strip and the layers of the area are built by the colour logic and set as
  inline properties. They are colour space, not styling, and the kit has no black step for them.
- The measurement on :6007 found one defect, fixed: the hex field of the picker carried the clear
  cross of the text field, and a colour record has nothing to clear. The measured numbers: the kit
  look draws 32-point swatches with gaps of 8 and an outer ring, the material look 30-point
  borderless swatches with gaps of 10 and a hollow 3-point ring.
- The test host keeps its inputs in signals: a plain field changed on an OnPush host never reached
  the palette.
- By the live comparison the material preset took the application's layout. The custom swatch is
  drawn on the row of its button by absolute placement and stays in the radio group, so the keys and
  the screen reader keep their order. The template is unchanged. The button is 16 points below the
  grid, grey `--mat-sys-on-surface-variant` at 16/400. The picker is 256 by 320 with the shadow
  `0 8px 16px` of `--rt-mat-neutral-60`, and its area takes the free height. New properties
  `--rt-color-palette-custom-gap`, `--rt-color-palette-picker-height` and
  `--rt-color-palette-area-grow` keep the former values by default. Measured on :6007: the button
  stands 16 points below the grid, the swatch is centred on its row, the picker is 256 by 320.
  Affected stage: 4.
- **2026-10-12. The custom swatch stays in the grid in the material look too.** The owner said
  «изменить свой цвет кнопку под палитру, на материальном виде она в ряду с пресетами». The
  absolute placement of the swatch on the button row was removed; the gap of 16 and the grey 16/400
  button stay. Measured on :6007: in both looks the custom swatch is the last in the grid, and the
  button starts at the grid's left edge, 8 points below it in the kit look and 16 in the material.
  Affected stage: 4.
- **2026-10-12. The missing functions are closed by an input, the look by a property.** The owner
  said «расширь чего не хватает по функционалу и возможность задать вью через вход или токены
  стилей». The application's picker has R, G, B fields; the kit gets them behind the `channels`
  input, false by default, so the present picker does not move. The empty read-only fill is the
  property `--rt-color-palette-empty-bg`, transparent by default and white under the material
  preset. Measured on :6007: three fields of 69.3 points fill the 256-point picker without
  overflow; the material picker stays 256 by 320 and its area shrinks to 131. Affected stage: 4.

## Live comparison of the epic's components, 10 October — what the next session fixes first

The owner asked «спавнивай на экране и поведение». A check agent compared the application on :4400
with the material halves on :6007 by measurement. It corrects the code-based comparison, and the
fixes go in this order, each on its own branch:

1. **RT-2556 carousel — roll back the shadow.** The live application draws `--rt-shadow-lg`, not
   `0 8px 16px #747474`: the variable read from its code is overridden on screen. Commit 05f19213b
   brought the wrong one, together with `--rt-card-stack-shadow` and two scale steps; they go away.
2. **RT-2554 speed menu — the action fill.** Live actions are `--mat-sys-primary-container` with the
   icon `--mat-sys-on-primary-container` (24px), not grey. The bare 24px trigger stays an input.
3. **RT-2553 inline edit — the badge look.** Live: background `--rt-mat-neutral-5`, border
   `--mat-sys-primary-fixed-dim`, text and icon `--mat-sys-primary`, pencil on the left; the edit
   happens inside the badge, which grows with the text up to 384px; leaving saves. The kit swaps the
   badge for a 191px field with buttons. Needs a badge edit mode and its inputs.
4. **RT-2552 breadcrumbs** — the application passes `›`; show the material half with it.
5. **RT-2555 palette** — the custom swatch stands next to its button, 16px below the grid; the
   button is grey 16/400; the picker panel is 256×320 with the shadow `0 8px 16px #747474`.
6. **Trees (new task of the epic)** — rows 32px with a 5px gap and radius 6px, padding 8 12;
   checkbox 16px in the accent; chevron in the accent; «Select All» 14/500.

Matches already: the palette swatches, ring and glow; the carousel sizes, overlap and hover; the
breadcrumbs type and colours; the speed menu step, distance and entry. Intended kit differences: the
keyboard in all of them, focus rings, Escape closing the speed menu.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [x] 1.2 Write the subdomain spec, scenarios and bindings for the palette
- [x] 2.1 Write the colour maths as a pure module with its specs
- [x] 2.2 Write the field, the swatches and the custom colour panel in the components layer
- [x] 2.3 Write the specs on the value, the choice, the keys, read only, disabled and the panel
- [x] 3.1 Write the overview page, the matrix stories and the playground
- [x] 3.2 Measure the layout on :6007
- [x] 4.1 Take the references of the new stories after looking at them
- [>] 4.2 Run the whole set and open the PR into the epic branch after the owner's word
