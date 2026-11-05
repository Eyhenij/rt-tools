# What it is carried out by — the date range field of the kit

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **The value is a pair of days `{ start, end }`, or `null` when empty.** — `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.logic.ts:rtRangeOrder` — the panel puts the two days in order by it; the field reads the form by `rtRangeRead`. Scenario `SC-UKV-468`
- **The field shows the range as two dates in the order of the interface language.** — `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.component.ts:onTyped` — the text is written by `rtRangeText` and read back by `rtRangeParse`, then checked against the bounds. Scenario `SC-UKV-469`
- **The panel opens by the button at the end of the field and closes by Escape or a click outside.** — `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.component.ts:openPanel` — the button calls it; the text input does not. Scenario `SC-UKV-470`
- **The panel shows two months side by side, and paging moves both by a month.** — `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:months` — the shown month and the next one, one month in the sheet. Scenario `SC-UKV-471`
- **The first click picks the start, and the second picks the end.** — `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:pickDay` — the future range is drawn by `rtRangeMonth` from the day the calendar reports by `dayHover`. Scenario `SC-UKV-472`
- **A preset fills the draft with its range and marks itself chosen.** — `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.logic.ts:rtRangePresets` — the ranges are counted from today; `rtRangePresetCells` switches off a preset outside the bounds. Scenario `SC-UKV-473`
- **The footer shows the summary, «Сбросить» and «Применить».** — `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:apply` — the draft is emitted only here; the summary is the field `summary` next to it. Scenario `SC-UKV-474`
- **Days outside the bounds are switched off, and paging stops at the months of the bounds.** — `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.logic.ts:rtRangeInBounds` — the presets and the typed text ask it; the days and the paging ask the date field's bounds. Scenario `SC-UKV-475`
- **The keys in the months move the day like a grid, and Enter picks it.** — `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:onGridKey` — the next day comes from the date field's grid logic, and the months page when it leaves them. Scenario `SC-UKV-476`
- **On a narrow screen the panel opens in the kit's bottom sheet with one month.** — `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.component.ts:narrow` — read from the breakpoints service; the template picks the sheet by it. Scenario `SC-UKV-477`
- **In the period panel the month title of each calendar is a button that opens the month grid.** — `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:openMonths` — the calendar's title click passes its month. Scenario `SC-UKV-1151`
- **The year in the header of the period month grid opens the year grid, four years in a row.** — `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:openYears` — the cells and the span come from the date panel logic. Scenario `SC-UKV-1152`
- **A month picked in a month grid returns to the days of that month.** — `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:pickMonth` — the picked month becomes the shown first month. Scenario `SC-UKV-1153`
- **Escape in a month or a year grid returns one view back instead of closing the panel.** — `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:onEscape`. Scenario `SC-UKV-1154`
- **In the bottom sheet the period panel keeps the 20px side padding of the sheet header and footer.** — `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.scss:padding-inline` — the modifier `--sheet` sets `--rt-space-5`. Scenario `SC-UKV-1156`
- **The names of months, weekdays and the summary follow the locale of the application.** — `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.logic.ts:rtRangeDates` — the dates of the summary; `rtRangePlural` picks the label of the day count. Scenario `SC-UKV-478`
