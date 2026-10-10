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
  retaken, the material half alone moved.
- **Next step:** the rest of the comparison from the epic plan: the white circle of an empty
  read-only value, the custom colour button on a row of its own, and the picker panel's height,
  shadow and buttons. Then take the folder apart and open the PR when the owner approves.
  The owner answered about the browser «Открыт только один браузер»: the plugin drives it, and the
  application on :4400 opens on its users page. The live comparison of the ported components
  against the application goes first in the next session; the roles and permissions stacks are
  hidden columns there and are switched on in the column settings.
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
