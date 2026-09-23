# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 5 of 6 — toolbar buttons, row selection, paginator, floating bar
- **Done:** measurement; the material preset reads the Material theme from the page
- **Next step:** measure the toolbar buttons, the row selection, the paginator and the floating bar against the first kit
- **Uncommitted:** no
- **Waiting for the owner:** no; the board on the host does not list #2330 — the branch carries the number by the owner's «если тупик заводи дубликт и работаем», and the board is checked again before the PR
- **PR:** not open yet

## Steps

- [x] 1.1 Write a measurement script over both showcases: header fill colour, header and row height, font family, search field height and fill, header checkbox centre against title centre
- [x] 1.2 Run it over the first kit dynamic list story and the second kit data list story in the material preset
- [x] 1.3 Record the table of numbers in the progress
- [x] 2.1 Wrap the brand, error and surface steps of the material preset in the tokens source as `var(--mat-sys-<name>, <current value>)`, the same names the first kit reads
- [x] 2.2 Rebuild the tokens and cover the wrapping with a spec
- [x] 2.3 Give the second kit showcase a violet Material theme declared as plain properties, no Material package
- [x] 2.4 Rewrite the Material rule of the proposed material preset spec by the owner's decision
- [x] 3.1 Put the header checkbox on the vertical centre of its cell
- [x] 3.2 Bring the header fill, the row height and the font of the table in the material preset to the measured first-kit values
- [x] 3.3 Cover the checkbox centre and the row height with specs
- [x] 4.1 Bring the fill look of the field to the first kit Material fill field by measurement: height, fill, underline, search icon
- [x] 4.2 Re-take the field and list references
- [>] 5.1 Measure each of the four against the first kit and size the edit
- [ ] 5.2 Bring those that fit this task, file the rest as tasks of epic 1870 and tell the owner the numbers
- [ ] 6.1 Write the new rules and scenarios into the table family spec
- [ ] 6.2 Re-take the references changed by stages 2–5 and run the whole check set

## Measurement

Taken from the pixels of the references: the first kit `components-dynamiclist--few-items`, the
second kit `organisms-dynamiclist-datalist--selection`, material half. The live pages are not
measured: the tree has no pinned browser profile, and the rule allows no other door.

| Property                      | First kit                                 | Second kit, material preset                                   |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------------------- |
| Search field height           | 52 px (51 fill + 1 underline)             | 32 px, pill                                                   |
| Search field fill / underline | `#e8e0eb` / `#49454e`, 1 px               | `#ecedef`, no underline                                       |
| Header height                 | 44 px                                     | 40 px                                                         |
| Header fill                   | `#e8e0eb` (violet theme surface)          | `#ecedef`                                                     |
| Row pitch                     | 64 px (63 + 1 line)                       | 51 px (50 + 1 line)                                           |
| Row fill / line               | `#ffffff` / `#e0e0e0`                     | `#f5f6f8` / `#e8e8e8`                                         |
| Header title cap band         | 95–106 in a 80–123 header                 | 224–237 in a 209–248 header                                   |
| Header checkbox               | none (radio column has no header control) | 217–236: centre 226.5 against the cell centre 228.5 — 2 px up |
| Row control against row text  | radio centre 156.5, text centre 157.5     | checkbox centre 272.5, text centre 276                        |

## Decisions along the way

- **Material names stand in the preset assignments, not in the scale** — a scale step is computed on
  the page root, and a Material theme declared on a container does not reach it; an assignment is
  declared on the node carrying the preset flag. Hover, press and the transparent shades of the
  brand are counted from the same Material name. Affected stage of the plan: 2.
- **The field fill reads `--mat-form-field-filled-container-color` first, then
  `--mat-sys-surface-variant`** — the first kit paints its table header with the former, and the
  first kit showcase theme (`mat.define-theme` with `all-component-themes`) declares no
  `--mat-sys-*` at all; `surface-variant` is what the fill field takes in Material 22. Affected
  stage of the plan: 2, 3.
- **The first kit row height 64 px belongs to its story, not to the kit** — the kit default is
  `3rem`; the story sets `--rt-table-row-height: 64px`. Affected stage of the plan: 3.
- **The token checks read a Material name as its fallback** — they judge the kit on a page without
  a Material theme; `tools/tokens-looks.mjs:withoutMaterial`. Affected stage of the plan: 2.

- **The checkbox and radio of the selection column are block hosts** — an inline host stood on the
  text baseline and rose 2 px above the cell middle; it also stretched the header to 40 px. After
  the edit: header checkbox centre 230.5 against the header centre 230.5, row checkbox 278.5 against
  278.5 (frame `organisms-dynamiclist-datalist--material-theme`). Affected stage of the plan: 3.
- **The header height is its own property, 44 px** — `calc(lg − space-1)`: the scale has no 44, and
  the first kit's 10 px cell padding does not lie on it. Affected stage of the plan: 3.
- **The row stays 50 px** — cell padding 8 plus text padding 8 around the line; within 2 px of the
  first kit's default 48. Affected stage of the plan: 3.
- **The table header colour is a name of its own, `--rt-color-table-head-bg`, with a dark answer** —
  without the answer the dark theme yielded it to the preset, and the dark material header lost its
  fill. Affected stage of the plan: 3.
- **Step 3.3 is covered by frames, not by specs** — jsdom computes no layout; the centre and the
  height are held by the list and table references and measured above. Affected stage of the plan: 3.
- **The font is the application's** — the first kit showcase sets Roboto on the page
  (`--font-default`), the first kit ships no font of its own. Named to the owner in stage 5.
  Affected stage of the plan: 3, 5.

- **The fill search is 52 px and its underline has a colour name of its own** — the list toolbar
  gives the fill search size lg and sets its height to `calc(xl − space-1)`; the underline of every
  fill field reads `--rt-color-field-fill-underline`, which the preset takes from
  `--mat-sys-on-surface-variant`. Measured on `organisms-dynamiclist-datalist--material-theme`: fill
  51 px `#e8e0eb`, underline 1 px `#49454e` — the first kit's numbers. Affected stage of the plan: 4.

## Sessions

### 2026-09-23

- #2329 does not show in the board listing; #2330 created as its duplicate by the owner's word, #2329 closed. #2330 is not listed either — 41 cards on the host, none new.
