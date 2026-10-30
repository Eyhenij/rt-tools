# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — The showcase, the match and the approvals
- **Done:** the agreement `toolbar-filters`; the slot `rtToolbarFilters`, the filter button, the filters panel, the heading line of the aside header, `phoneCloseLabel` of the aside footer; SC-UKV-1086…1092 tested
- **Next step:** the stories of the three states
- **Uncommitted:** the kit code and its tests — they are committed after the match with the mockup
- **Waiting for the owner:** nothing
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the kit parts the button and the panel are assembled from
- [x] 1.2 Write the agreement and its scenarios
- [x] 2.1 Put the title of the aside header on one line with the back arrow
- [x] 2.2 Hide the toolbar filters behind the filter button on a narrow screen
- [x] 2.3 Open the filters panel from the button
- [x] 2.4 Keep the indicator dot uncut by the toolbar
- [x] 2.5 Write the tests of the scenarios
- [>] 3.1 Write the stories of the three states
- [ ] 3.2 Measure the stories against the frames and print the match line
- [ ] 3.3 Draw the overlay of the whole block
- [ ] 3.4 Show the owner the showcase and ask about it
- [ ] 3.5 Write the approval record
- [ ] 4.1 Merge the agreement into the kit spec
- [ ] 4.2 Run the specs check, the types, the linters and the tests of the kit
- [ ] 4.3 Take the task folder apart into the archive record
- [ ] 4.4 Push and open the PR by the owner's word
- [ ] 4.5 Release the kit by the owner's word and send the version to the consumer

## Decisions along the way

## Sessions

### 30 October 2026

- Task RT-3001 created outside an epic by the owner's word «Да, вне эпика (Рекомендую)»; branch
  `RT-3001-list-filters-button` from `origin/main` 1173a9d5c in the working copy
  `rt-filters-mobile`; the card moved to In progress.
- The mockup approval «Одобряю (Рекомендую)» of frames 7349-4846 and 7349-5090 written; the Aside
  Header component changed by the owner's word «Исправь макет и компонент (Рекомендую)».
- The kit edit: the toolbar slot `rtToolbarFilters`, the input `filtersActive`, the outputs
  `filtersApply` and `filtersReset`, the panel `RtToolbarFiltersAsideComponent`, the input
  `phoneCloseLabel` of the aside footer, the heading column of the aside header as high as the back
  button. Specs of the kit: 283 files, 3363 tests passed; types, eslint, stylelint, the cascade
  layer and the token checks clean.
