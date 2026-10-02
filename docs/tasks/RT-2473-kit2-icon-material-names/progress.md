# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — the spec, the showcase and the snapshots
- **Done:** epic RT-2472 with its nine tasks, its plan and branch; this task's branch and folder
- **Next step:** bring the texts up to date, take the folder apart, open the PR into the epic branch
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 One resolver of a Material name, with the menu item and the side menu moved onto it
- [x] 1.2 The glyph, the font ligature and the strategy option on rt-icon
- [x] 1.3 The spin and the size in pixels on rt-icon
- [x] 2.1 The glyph on rtButton, with the material drawing under the material preset
- [x] 2.2 The glyph on rt-icon-button, the toggle button group, the split button and the empty state
- [x] 3.1 The spec of the subdomain, its bindings and scenarios
- [x] 3.2 The overview tables and the icon stories for the glyph, the spin and the size
- [x] 3.3 Snapshots retaken for the new stories only

## Decisions along the way

- The ligature waits for the page's font readiness as a whole, not for one family: the kit ships
  no font and does not know which family the application connects.
- `name` of the icon became optional, so its type widened to a name or nothing; one helper in the
  data-table spec followed the type.
- The size input stores pixels: a step is turned into them on write. Nothing in the kit read the
  step back, and one number spared a second branch in the component.
- rtButton got no input of its own for a glyph: its `icon` already takes any string, so it is
  resolved the way `glyph` of the icon is. A kit name draws as before; a name that drew an empty
  place now draws its pair or the ligature.
- The material drawing on rtButton changes the material half of thirteen existing story wrappers
  that hold a button with an icon. Step 3.3 retakes those frames too, after a look by eye: the
  change is the one the spec names.
- The split button got no input of its own: its menu items draw through rtButton, and an item
  `icon` takes a Material name since step 2.1. `icon` of the icon button stopped being required.
- The icon probe of the snapshot gate held back only the own set. Under the material preset the
  button now asks for the material set, so the probe holds both sets.
- The second showcase ships no Material Symbols font, and the first showcase's file is a subset by
  its own names. The Glyph story therefore shows the ligature as the word in the fallback font, the
  state of an application without the font, and says so under the frames.
- Snapshots: two written, three retaken (the button and the split button, material half only),
  745 of 745 matched on a second raising.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
