# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 из 5 — The rows
- **Done:** mockup drawn and measured; the owner approved mockup and plan; the agreement is written
  and reviewed by spec-critic.
- **Next step:** write the pure function of the table rows over `rtAiChatChartData` and its tests.
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-3335 (#3398)

## Steps

- [x] 1.1 Draw closed and open block, `line`, `grouped_bar`, `treemap`, widths 328 and 728, dark theme
- [x] 1.2 Measure the frames and ask the owner to approve mockup and plan
- [>] 2.1 Write a pure function that builds the table from `rtAiChatChartData(spec, locale)` —
- [ ] 2.2 Cover it by scenario id for each kind, a negative, a zero, a missing point, a
- [ ] 3.1 Add the text button with chevron under the chart and the `<table>` with kit tokens, marked
- [ ] 3.2 Add the labels «View data» and «Hide data» to `rt-kit-labels.en.ts` and the showcase
- [ ] 3.3 Cover open, close, not remembered, no button on pending, invalid and empty
- [ ] 4.1 Write the story `DataTable` with the open cases of the mockup, six series at 328 and a
- [ ] 4.2 Match the showcase with the mockup by numbers and ask the owner to approve it
- [ ] 5.1 Merge the agreement into the `ai-chat-chart` spec, bring the overview and README up to date
- [ ] 5.2 Take the task folder apart and run the push gate

## Decisions along the way

- The branch is taken from `RT-3335-ai-chat-chart-block` (chain): the block it extends is not merged
  into the epic branch yet. Its PR goes into that branch.
- spec-critic named seventeen gaps in the agreement; all went into its rules before the code. The
  histogram case of the plan is three equal bins: unequal bins make the spec invalid.
