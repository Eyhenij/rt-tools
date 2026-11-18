# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 5 из 5 — Close
- **Done:** mockup drawn and measured; the owner approved mockup and plan; the agreement is written
  and reviewed by spec-critic; `rtAiChatChartTable` builds the rows from the chart data, 9 of 9 tests; the switch and the table stand in the block, 20 of 20 block tests. The stories `DataTable`, `DataTableWidths` and `DataTableLong` match the mockup, 31 of 31 numbers; 11 references taken, the whole kit 1148 of 1148; the owner approved the showcase. The agreement stands as the subdomain `ai-chat-chart-data` with its bindings; the overview and the chat context name the table.
- **Next step:** take the task folder apart, run the push gate, open the PR into `RT-3335-ai-chat-chart-block`.
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
- [x] 4.1 Write the story `DataTable` with the open cases of the mockup, six series at 328 and a
- [x] 4.2 Match the showcase with the mockup by numbers and ask the owner to approve it
- [x] 5.1 Merge the agreement into the `ai-chat-chart` spec, bring the overview and README up to date
- [>] 5.2 Take the task folder apart and run the push gate

## Decisions along the way

- The branch is taken from `RT-3335-ai-chat-chart-block` (chain): the block it extends is not merged
  into the epic branch yet. Its PR goes into that branch.
- spec-critic named seventeen gaps in the agreement; all went into its rules before the code. The
  histogram case of the plan is three equal bins: unequal bins make the spec invalid.
- Tree rows follow the chart's tree, a node before its children: the table reads the chart data,
  so the agreement and SC-UKV-1390 name that order instead of the first appearance of a path.
- The showcase found two defects of the table, both fixed in the styles. Six series at 328 squeezed
  the first column to one letter per line: the cell broke words anywhere. It now breaks by words,
  and a series name in the head wraps instead of widening the table. A row measured 29 instead of
  28: the cell border stands outside its height, so the height is 27 plus the border.
- After the fix the showcase matches the mockup: rows 28, tables 197 and 113, blocks 550, 502 and
  418. The right edges of the numbers are 232/320, 290/378 and 632/720 at the widths 328, 386 and 728.
- The closed toggle is 169 wide against 170 in the mockup: the label font renders one point
  narrower. Its build matches — padding 14 and 14, gap 8, icon 14, Montserrat 13/500, height 32 —
  so the match counts those, not the width the text gives; the mockup is left as approved.
- The agreement went to a subdomain of its own, `ai-chat-chart-data`, as the block agreement did:
  next to the block spec it is longer than the document limit. README is left as is: the entry and
  its provider did not change.
