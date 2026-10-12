# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — The showcase frames
- **Done:** the container gives the margin; the showcase dropped its rule; both descriptions say it
- **Next step:** read the frame match of `node tools/visual-gate.mjs ui-kit-v2`
- **Uncommitted:** the task folder, the container styles and description, the page header
  description, the showcase shell layer
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Add the margin rule for a page header in the header zone to the container styles
- [x] 1.2 Drop the margin rule from the showcase shell layer
- [x] 1.3 Rewrite the margin lines in the container and page header descriptions
- [x] 1.4 Add the line to the kit spec
- [>] 2.1 Match the showcase frames against their references

## Decisions along the way

- **The kit spec gets no rule line, only a history line** — the spec keeps its rules in subdomains,
  and the container has none. The rule lives in the container's description, where its other zones
  are described. Affected stage of the plan: 1.

## Sessions

### 2026-10-12

- The task, the branch and the folder are created.
- The container gives a page header straight in its header zone the `--rt-space-5` margin. The
  showcase rule is gone.
- `lint:styles` on both files: clean. `check:tokens-styles`: 0 new. Container tests: 59 of 59.
