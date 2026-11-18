# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 из 5 — Showcase
- **Done:** mockup drawn and measured; the owner approved mockup and plan; the agreement is written
  and reviewed by spec-critic; `rtAiChatChartTable` builds the rows from the chart data, 9 of 9 tests; the switch and the table stand in the block, 20 of 20 block tests.
- **Next step:** the story `DataTable` with the cases of the mockup, then its frames and the match.
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-3335 (#3398)

## Steps

- [x] 1.1 Draw closed and open block, `line`, `grouped_bar`, `treemap`, widths 328 and 728, dark theme
- [x] 1.2 Measure the frames and ask the owner to approve mockup and plan
- [x] 2.1 Write a pure function that builds the table from `rtAiChatChartData(spec, locale)` —
- [x] 2.2 Cover it by scenario id for each kind, a negative, a zero, a missing point, a
- [x] 3.1 Add the text button with chevron under the chart and the `<table>` with kit tokens, marked
- [x] 3.2 Add the labels «View data» and «Hide data» to `rt-kit-labels.en.ts` and the showcase
- [x] 3.3 Cover open, close, not remembered, no button on pending, invalid and empty
- [>] 4.1 Write the story `DataTable` with the open cases of the mockup, six series at 328 and a
- [ ] 4.2 Match the showcase with the mockup by numbers and ask the owner to approve it
- [ ] 5.1 Merge the agreement into the `ai-chat-chart` spec, bring the overview and README up to date
- [ ] 5.2 Take the task folder apart and run the push gate

## Decisions along the way

- The branch is taken from `RT-3335-ai-chat-chart-block` (chain): the block it extends is not merged
  into the epic branch yet. Its PR goes into that branch.
- spec-critic named seventeen gaps in the agreement; all went into its rules before the code. The
  histogram case of the plan is three equal bins: unequal bins make the spec invalid.
- Tree rows follow the chart's tree, a node before its children: the table reads the chart data,
  so the agreement and SC-UKV-1390 name that order instead of the first appearance of a path.
