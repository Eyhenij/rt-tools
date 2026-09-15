# Grill

Epic RT-2097, task 6 — found by the executor while showing RT-2115 to the owner: the chart stands without an axis.

## The owner request

> там есть графики а у тебя графиков нет! если … не можешь скопировать решение из примера который я тебе предоставил …

No new words from the owner: the task closes a gap in the answer to the order above.

## What the tree already has

- **The chart** — `AdminUsageDigestComponent`: a bar per day, the height by `heightPercent`, the day only in the `title` hint. `IUsageChartBar.label` — `ДД.ММ` — is computed by `chartDayLabel` and drawn nowhere.
- **The sample** — the bars carry a title, and the axis is not drawn either; a hint on hover is all it has.
- **The frame** — `list-usage` in the end-to-end suite holds the section whole; the axis changes it.

## Questions and answers

None asked: the gap is visible on the screenshot, and the fix has one shape.

## Decisions

- **An axis of two labels — the first and the last day of the period — under the bars.** Thirty-one labels crowd at a narrow screen, and one per bar would need a rule for hiding; the two ends are enough to read where a bar lands, and the hint names the exact day.
- **The labels come from `chartDayLabel`, already in the bar model.** No second computation.
