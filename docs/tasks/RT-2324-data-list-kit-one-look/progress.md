# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 5 — The theme stories do not overlap
- **Done:** stage 1 — the overlap measured, the icons and the settings panel compared, the agreement written.
- **Next step:** make the list toolbar and table stay inside a narrow pane.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no.
- **PR:** not open yet.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 The overlap in the theme stories measured on a narrow canvas
- [x] 1.2 The icons of both kits listed glyph against glyph
- [x] 1.3 The settings panel of both kits compared element by element
- [x] 1.4 The agreement written in `proposed/data-list-kit-one-look`
- [>] 2.1 The pane of the theme wrapper keeps its content inside
- [ ] 2.2 The fix measured on a narrow canvas
- [ ] 3.1 Missing glyphs drawn into the kit set
- [ ] 3.2 The family's icon mapping switched to them
- [ ] 4.1 The panel content rebuilt by the first kit's layout inside `rt-aside`
- [ ] 4.2 The tests of the panel brought to the new markup
- [ ] 5.1 The family's references re-taken after being looked at
- [ ] 5.2 The pairs written into `tools/kit-shot-pairs.json`

## Decisions along the way

- **The branch stands on RT-1882, not on the epic branch** — the theme wrapper of the showcase was
  rewritten there, and #2323 is not merged. Affected stage of the plan: none.
- **The icons are not redrawn into the kit's own set; only the drag handle changes** — the grill
  assumed the first kit's glyphs go into the own set, but the second kit has a material set, and
  the look of the first kit is that set. The sheet of the family icons, shot by the image browser:
  in the material set all sixteen mapped icons match the first kit glyph for glyph. The own set
  draws its own look on purpose and stays. A first reading paired `drag_handle` with `bars` — that
  pair was mine, not the kit map's: in the first kit `drag_handle` is the «equals» sign of the filter
  cell, already drawn by RT-2316, and the drag handle of the settings panel is `open_with` (✥),
  which neither set of the second kit has. Affected stage of the plan: 3 — it shrinks to drawing ✥.
- **The shared `rt-table-settings-panel` is not edited** — the second kit's own table draws its
  settings with it, and that look is the second kit's. The column list in the first kit's look is
  the list's own. Affected stage of the plan: 4.

## Sessions

### 2026-09-23

- The task created from the owner's remarks on the showcase; the grill closed from the
  conversation and the RT-2316 record.
- The overlap measured on the built showcase of `34eaa2ec0` by the image browser, the right edge of
  every node of a theme pane against the pane: `DataList → Themes` at 900 px — pane 352 px, content
  197 px past its edge, the document 1056 px wide; at 600 and 1280 px — 0. `DataTable → Themes` — 0
  at all three. What leaves the pane is the list toolbar (search, refresh, columns) and the table,
  and at 900 px the panes stand two in a row, so it lies over the neighbour. The references are
  shot wide and do not see it.
