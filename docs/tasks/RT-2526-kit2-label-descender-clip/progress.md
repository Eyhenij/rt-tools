# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — frames
- **Done:** both stages; 779 of 779 frames on a second raising, the sweep clean
- **Next step:** take the folder apart, push and open the PR
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The spec of the subdomain, its scenarios and bindings
- [x] 1.2 The story with descender text in every field
- [x] 1.3 The field line height and the components the story shows clipped
- [x] 2.1 The new story frame and the re-taken field frames, looked over
- [x] 2.2 The full frame audit and the sweep

## Decisions along the way

- The line height is `--rt-leading-snug`, 1.35, not `tight`: Montserrat needs 1.219 of the size, and
  `tight` at 1.2 still cuts a fraction of a pixel. The field heights come from `min-height`, so the
  taller line box fits inside them.
- The descenders story was taken before the fix and cropped: in the select the tails of «р» and «у»
  are cut flat, in the plain input the same letters are whole. After the fix the select matches.
- The select's own trigger keeps the former line height: it holds the consumer's markup, and the
  field line height grew it by two points and moved the panel in four SelectTrigger frames.
- Thirteen frames were re-taken: the field anatomy, the multiselect chips, the form dictionary and
  ten data list frames; each moved by 0.02–0.07%, the text in a field shifting by a fraction of a
  pixel, no box moving. A second raising matched all 779 frames.
- The story wrapper keeps its template and styles in own files: the reuse check asks for it.
- The date picker gets no placeholder in the story: it has no such input and shows its date mask.

## Sessions

### 2026-10-05

- The task is taken by the owner's word «бери в работу».
