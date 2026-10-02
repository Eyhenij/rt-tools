# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — the controls that draw an icon
- **Done:** epic RT-2472 with its nine tasks, its plan and branch; this task's branch and folder
- **Next step:** the glyph on rtButton, with the material drawing under the material preset
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 One resolver of a Material name, with the menu item and the side menu moved onto it
- [x] 1.2 The glyph, the font ligature and the strategy option on rt-icon
- [x] 1.3 The spin and the size in pixels on rt-icon
- [>] 2.1 The glyph on rtButton, with the material drawing under the material preset
- [ ] 2.2 The glyph on rt-icon-button, the toggle button group, the split button and the empty state
- [ ] 3.1 The spec of the subdomain, its bindings and scenarios
- [ ] 3.2 The overview tables and the icon stories for the glyph, the spin and the size
- [ ] 3.3 Snapshots retaken for the new stories only

## Decisions along the way

- The ligature waits for the page's font readiness as a whole, not for one family: the kit ships
  no font and does not know which family the application connects.
- `name` of the icon became optional, so its type widened to a name or nothing; one helper in the
  data-table spec followed the type.
- The size input stores pixels: a step is turned into them on write. Nothing in the kit read the
  step back, and one number spared a second branch in the component.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
