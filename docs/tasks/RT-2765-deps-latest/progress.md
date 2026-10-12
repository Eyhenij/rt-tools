# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 2 — The toolbar field fits a narrow screen
- **Done:** task, folder; the admin suite run on the epic branch: 17 of 146 failed
- **Next step:** the `min-width` of the left bar
- **Uncommitted:** the epic plan rows
- **Waiting for the owner:** no
- **PR:** none — the owner chose a commit into the epic branch

## Steps

- [x] 1.1 Give the left bar of the toolbar `min-width: 0` and name it in the toolbar description
- [x] 1.2 Run SC-MB-235 and SC-MB-253 and the second showcase frames
- [x] 2.1 Look at every diverging admin frame
- [x] 2.2 Retake the frames that changed only by the toolbar field width
- [x] 2.3 Run the admin suite whole

## Decisions along the way

- `min-width: 0` alone did not help: a measurement of the parent chain on a 412px screen showed
  the left bar at 380px and the admin's own filter component around `rt-select` at 400px. The kit
  rule reached the wrapped field, the wrapper grew by it and could not shrink. The width rule now
  takes only a field placed straight in the left bar (`> rt-input`, `> rt-select`).
- With that the admin keeps its former filters: the whole admin suite passed 146 of 146 without a
  single retaken frame, so 2.2 retook nothing. The first run on the epic branch before the fix: 17
  of 146 failed, 15 frames and SC-MB-235, SC-MB-253.

## Sessions

### 2026-10-12

- Task RT-2789 filed in the epic RT-2765. The owner chose «Коммитом в ветку эпика», so the folder
  stands under the epic branch name and is taken apart before the epic PR.
