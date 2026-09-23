# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 6 — Material theme colours in the material preset
- **Done:** the grill, the plan and the measurement table
- **Next step:** wrap the brand, error and surface steps of the material preset in `var(--mat-sys-*, …)` at the tokens source
- **Uncommitted:** no
- **Waiting for the owner:** no; the board on the host does not list #2330, and the branch keeps its local name until it does
- **PR:** not open yet

## Steps

- [x] 1.1 Write a measurement script over both showcases: header fill colour, header and row height, font family, search field height and fill, header checkbox centre against title centre
- [x] 1.2 Run it over the first kit dynamic list story and the second kit data list story in the material preset
- [x] 1.3 Record the table of numbers in the progress
- [>] 2.1 Wrap the brand, error and surface steps of the material preset in the tokens source as `var(--mat-sys-<name>, <current value>)`, the same names the first kit reads
- [ ] 2.2 Rebuild the tokens and cover the wrapping with a spec
- [ ] 2.3 Give the second kit showcase a violet Material theme declared as plain properties, no Material package
- [ ] 2.4 Rewrite the Material rule of the proposed material preset spec by the owner's decision
- [ ] 3.1 Put the header checkbox on the vertical centre of its cell
- [ ] 3.2 Bring the header fill, the row height and the font of the table in the material preset to the measured first-kit values
- [ ] 3.3 Cover the checkbox centre and the row height with specs
- [ ] 4.1 Bring the fill look of the field to the first kit Material fill field by measurement: height, fill, underline, search icon
- [ ] 4.2 Re-take the field and list references
- [ ] 5.1 Measure each of the four against the first kit and size the edit
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

## Sessions

### 2026-09-23

- #2329 does not show in the board listing; #2330 created as its duplicate by the owner's word, #2329 closed. #2330 is not listed either — 41 cards on the host, none new.
