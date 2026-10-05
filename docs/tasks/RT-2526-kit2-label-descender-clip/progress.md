# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — frames
- **Done:** the field line height is `snug`, 1.35; the descenders story shows the select's tails
  cut before and whole after; 2492 kit tests
- **Next step:** the full frame audit, then re-take and look over the diverged field frames
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The spec of the subdomain, its scenarios and bindings
- [x] 1.2 The story with descender text in every field
- [x] 1.3 The field line height and the components the story shows clipped
- [>] 2.1 The new story frame and the re-taken field frames, looked over
- [ ] 2.2 The full frame audit and the sweep

## Decisions along the way

- The line height is `--rt-leading-snug`, 1.35, not `tight`: Montserrat needs 1.219 of the size, and
  `tight` at 1.2 still cuts a fraction of a pixel. The field heights come from `min-height`, so the
  taller line box fits inside them.
- The descenders story was taken before the fix and cropped: in the select the tails of «р» and «у»
  are cut flat, in the plain input the same letters are whole. After the fix the select matches.
- The date picker gets no placeholder in the story: it has no such input and shows its date mask.

## Sessions

### 2026-10-05

- The task is taken by the owner's word «бери в работу».
