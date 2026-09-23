# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 1 of 5 — The divergences measured and the agreement written
- **Done:** the task, the branch from `RT-1882-kit-settings-theme`, the grill and the plan.
- **Next step:** measure the overlap of the theme stories on a narrow canvas.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no.
- **PR:** not open yet.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 The overlap in the theme stories measured on a narrow canvas
- [x] 1.2 The icons of both kits listed glyph against glyph
- [>] 1.3 The settings panel of both kits compared element by element
- [ ] 1.4 The agreement written in `proposed/data-list-kit-one-look`
- [ ] 2.1 The pane of the theme wrapper keeps its content inside
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
  the look of the first kit is that set. The sheet of seventeen icons of the family, shot by the
  image browser: in the material set sixteen match the first kit glyph for glyph, the drag handle
  differs (two strokes against three). The own set draws its own look on purpose and stays.
  Affected stage of the plan: 3 — it shrinks to the drag handle.

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
