# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Snapshots and delivery
- **Done:** the subdomain spec with scenarios SC-UKV-807–815, the colour maths, the palette and the
  picker with both looks, 14 specs green, types and linter clean; the overview, seven matrix stories
  and the playground, measured on :6007 and taken as references, the whole set of 844 frames green.
  On 9 October the epic branch with a fresh main went in; four icon frames were retaken for the
  added `folder`, and the kit tests and linter passed. The hover frame of the favourites submenu
  diverged once by a tooltip and matched on the second run. On 10 October, after the comparison
  with the application's code, the material checked swatch got the application's 5px glow of its
  colour through `--rt-color-palette-checked-glow` (0px by default); four palette frames were
  retaken, the material half alone moved. On 10 October, by the live comparison, the custom swatch
  stands on the row of its button 16 points below the grid, and the picker is 256 by 320 with the
  application's shadow; six palette frames were retaken. The epic plan marks the palette done.
  On 12 October, at the owner's word, the custom swatch went back into the grid in the material
  look as well, and the button stands alone 16 points below it; the Presets and Value frames were
  retaken, the other five matched, and the 14 specs passed. Later the same day the picker got the
  `channels` input with R, G, B fields (SC-UKV-847) and the material look a white empty read-only
  circle: 16 specs, types and linters green, Picker and Readonly retaken, 845 frames of 845.
- **Next step:** the owner looks at the material half on :6007; then take the folder apart and open
  the PR into the epic branch at their word. The white circle of an empty read-only value came
  from the code comparison; the live comparison did not name it, and the material look keeps the
  kit's empty ring.
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
