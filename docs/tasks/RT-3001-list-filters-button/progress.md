# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — The showcase, the match and the approvals
- **Done:** the agreement `toolbar-filters`; the slot `rtToolbarFilters`, the filter button, the filters panel, the heading line of the aside header, `phoneCloseLabel` of the aside footer; SC-UKV-1086…1092 tested
- **Next step:** the owner's answer about the showcase goes into the approval record
- **Uncommitted:** nothing
- **Waiting for the owner:** the answer about the showcase on port 6017, built from this branch: the stories FilterOff, FilterOn and PanelOpen
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
- [x] 3.1 Write the stories of the three states
- [x] 3.2 Measure the stories against the frames and print the match line
- [x] 3.3 Draw the overlay of the whole block
- [>] 3.4 Show the owner the showcase and ask about it
- [ ] 3.5 Write the approval record
- [ ] 4.1 Merge the agreement into the kit spec
- [ ] 4.2 Run the specs check, the types, the linters and the tests of the kit
- [ ] 4.3 Take the task folder apart into the archive record
- [ ] 4.4 Push and open the PR by the owner's word
- [ ] 4.5 Release the kit by the owner's word and send the version to the consumer

## Decisions along the way

- **The mockup is fitted to the kit, not the kit to the mockup.** The panel matched 30 of 35; the
  five misses are the title weight of Aside Header, the body top gap and the label row of Field —
  values every aside and field of the kit already draws. The owner chose «Макет под кит
  (Рекомендую)» against «Кит под макет». The kit code stays; the Figma components change, and the
  match goes by the updated frame. Affected stage of the plan: 3.

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
- The stories `Organisms/Table/ToolbarFilters` — `FilterOff`, `FilterOn`, `PanelOpen` — measured at
  375×812 in the showcase on port 6017 of this copy. The toolbar against 7349-5090: 20 of 20 numbers
  (the filter button 12/12, 40, radius 8, `#155dfc`; the dot 46/10, 8, `#dc2626`, clipped by nothing;
  the next buttons at 60, 108, 156). The panel against 7349-4846: 30 of 35. The five misses are
  three divergences between ready kit parts and the Figma components, not the new code: the title
  weight of `rt-aside-header` is 700 in the kit and 600 in the frame; the body of `rt-aside` starts
  24 under the header in the kit and 8 in the frame; `rt-field` with a label is 65 high in the kit
  (label line height `normal`, 17) and 58 in the frame (label line height 1). The numbers files lie
  outside the tree, in the session scratchpad `fig/`.
- What the kit draws, for fitting the Figma components: the aside title Montserrat 20, weight 700,
  line height `normal` (24.5 high); the body of `rt-aside` 24 under the header (80), so the first
  field at 104; `rt-field` = label row 17 (14, weight 500, line height `normal`) + 4 + control 40 +
  4 + an empty messages row 0 = 65; the gap between fields 16, so the second field at 185.
- Figma fitted to the kit by the owner's word «Макет под кит (Рекомендую)»: the title of the Aside
  Header component 4658:3234 is Montserrat Bold with line height auto (the text style detached on
  that node); in frame 7349-4846 the body starts 24 under the header, and the two Field instances
  override the label line height to auto (17) and add 4 at the bottom for the empty messages row.
  Field 7349:3600 is a remote component and cannot be edited in this file, so the fit lives in the
  frame's instances. The match after the fit: the toolbar 20 of 20, the panel 35 of 35 — 55 of 55.
- One more divergence of the same kind, fitted by the same word: the select value is 16 in the kit
  on a phone and was 14 in the frame; the two instances now carry 16. The match: the toolbar 20 of
  20, the panel 36 of 36 — 56 of 56. References of the three stories taken by
  `node tools/visual-gate.mjs ui-kit-v2 --update 'toolbar-filters'` (3 of 3). The overlay of the
  whole block: the toolbar 0.26% of pixels, the panel 1.76% — the letters, the 1-point difference
  of the footer button widths that follows the text width (119/133 in Figma, 118/134 in the
  showcase), and in the image browser the label row of `rt-field` one point taller, since its line
  height `normal` comes from the machine's font metrics; on this machine the field stands at 125 as
  in the frame.
