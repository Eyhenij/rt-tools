# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — The frame is steady
- **Done:** the gesture waits for the page fonts; five whole runs of the second kit's snapshots in a row are green, 971 of 971 each
- **Next step:** the push gate, the folder taken apart, the PR
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Make the gesture of the overlay helper wait for the page fonts
- [x] 1.2 Run the showcase specs and the types
- [x] 2.1 Run the PageHeaderMore frames five times in the image
- [x] 2.2 Run the whole snapshot set of the second kit once

## Decisions along the way

- **A spec guards the order «fonts, then the gesture».** The run catches a rollback only now and
  then, so `story-overlay.spec.ts` holds the fonts back and checks the gesture waits; the scenario
  SC-UKV-06 became partly covered. Affected stage of the plan: 1.

## Sessions

### 2026-10-30

- Two kept evidences read: the panel 31 points left, the window not widened.
- `story-overlay.spec.ts`: 2 of 2 green, 2 of 2 red with the font wait taken out.
- `node tools/visual-gate.mjs ui-kit-v2` five times in a row: the path sample ran the whole set
  each time, 971 of 971 green in every run, the frame More among them, no reference re-taken.
