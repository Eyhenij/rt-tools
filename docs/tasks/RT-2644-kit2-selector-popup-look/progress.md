# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 5 — Search highlight
- **Done:** stage 1 — row 92: the kit linter is clean, the Popup frame retaken (1 updated, 11
  matched); the second run comes with the whole set in stage 5. Stage 2 — row 93: `searchRadius`
  in the popup, the selector and the kit settings; selector specs 68 of 68.
- **Next step:** split an option label into matched and plain parts by a pure function.
- **Uncommitted:** no
- **Waiting for the owner:** «ща еще накину что делать в новую задачу» — further rows of this task.
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Settle the lint finding of the single-choice label
- [x] 1.2 Retake the Popup frame after looking at it
- [x] 2.1 Add `searchRadius` to the popup, the selector and the kit settings
- [x] 2.2 Write its spec scenario and test
- [>] 3.1 Split an option label into matched and plain parts by a pure function
- [ ] 3.2 Draw the matched parts with the highlight properties and keep the ellipsis
- [ ] 3.3 Write its spec scenario and tests
- [ ] 4.1 Add `applyLabel` and `applyLabelCase` to the popup, the selector and the kit settings
- [ ] 4.2 Write its spec scenario and test
- [ ] 5.1 Run the whole set and the snapshots, measure on :6007
- [ ] 5.2 Build the package to the desktop and open the PR into main

## Decisions along the way

- Rows 96 and 97 came from the application's session: the search field takes focus on opening
  (`autofocusSearch`, default `false` — the application agreed), and the option line height and
  minimum height become properties. They wait for the owner's word on whether they join this task.
- The popup minimum-height scenario of row 91 took SC-UKV-726, and the dense toolbar of RT-2639
  took the same number in main first: the spec check in main refuses. The row 91 scenario is
  renumbered SC-UKV-729 here; it has no test, only the heading moves.
