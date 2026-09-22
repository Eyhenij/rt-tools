# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The spec and the showcase follow
- **Done:** stages 1–2, step 3.1 — the spec holds the icons rule, SC-UK-121…123; `check:specs` exit 0
- **Next step:** 3.2 — a story shows the set icons
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The config gets `icons`, the defaults are the trash can and the turned `arrows_outward`
- [x] 1.2 The service gives out `icons`, merged per icon, a blank glyph counting as absent
- [x] 1.3 The types are exported from the side menu's public entry
- [x] 2.1 The remove button draws `icons.remove` with its turn
- [x] 2.2 The handle draws `icons.drag` with its turn, and the styles lose the fixed turn
- [x] 2.3 The component specs cover the default and the set icons
- [x] 3.1 The spec gets the rule, the scenarios and the bindings
- [>] 3.2 A story shows the set icons, and the frames are looked at locally
- [ ] 3.3 The favourites references are taken from the runner's frame

## Decisions along the way

- A set icon replaces its default whole: a glyph without `rotate` is not turned, so `drag_indicator`
  set alone does not inherit the 90° of the default arrow.
- The turn is bound as `[style.rotate.deg]`, the independent `rotate` property: it does not argue
  with a `transform` the button or the drag preview may set.

## Sessions

### 2026-09-22

- Task #2307 created by the owner's word and taken into work; the default remove glyph is the
  trash can by the owner's word. The board listing lagged the added card by a minute: the move and
  the branch guard did not see it until it appeared.
