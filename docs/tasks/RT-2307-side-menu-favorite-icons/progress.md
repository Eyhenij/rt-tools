# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The spec and the showcase follow
- **Done:** stages 1–2, steps 3.1–3.2 — red hover added by the owner's word, SC-UK-121…124, specs 187 of 187; four favourites frames looked at locally
- **Next step:** 3.3 — the favourites references are taken from the runner's frame
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
- [x] 3.2 A story shows the set icons, and the frames are looked at locally
- [>] 3.3 The favourites references are taken from the runner's frame

## Decisions along the way

- The owner widened the task mid-work: the remove icon turns red under hover, and the colour is the
  property `--rt-side-menu-favorite-remove-hover-color`, the danger icon token by default. It rides
  in stage 2 and step 3.1 by one more modifier and one more rule, without a stage of its own.
- The narrow story is shot at the window of 1280 px, so the remove buttons and handles never reach
  its frame. The narrow stories now take a window of 360 px and open the section by a `play` step.
- The showcase's Symbols subset lacked `drag_indicator` and drew it as a stray shape. The subset is
  fetched again with the same 79 names plus that one; the comparison of the ligatures shows nothing
  lost.

- A set icon replaces its default whole: a glyph without `rotate` is not turned, so `drag_indicator`
  set alone does not inherit the 90° of the default arrow.
- The turn is bound as `[style.rotate.deg]`, the independent `rotate` property: it does not argue
  with a `transform` the button or the drag preview may set.

## Sessions

### 2026-09-22

- Task #2307 created by the owner's word and taken into work; the default remove glyph is the
  trash can by the owner's word. The board listing lagged the added card by a minute: the move and
  the branch guard did not see it until it appeared.
