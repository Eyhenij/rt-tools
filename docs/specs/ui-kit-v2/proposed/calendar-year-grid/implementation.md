# Binding — the year grid and the period month grid

Where each rule of the agreement is carried out. At the merge into the specs `date-panel` and
`date-range` these lines move into their companions.

## Where the rules are carried out

| Rule                                                                                                    | Where                                                                                                |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| In the date panel the year in the header of the month grid is a button that opens the year grid.        | `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:openYears`       |
| The year grid shows twelve years: three in a row in the date panel, four in a row in the period panel.  | `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateYears`               |
| The span is a block of twelve that holds the shown year.                                                | `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateYearSpanStart`       |
| The arrows of the year grid page the span by twelve years and stop at the bounds.                       | `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateCanPageYears`        |
| A year outside `min` and `max` is unavailable, the chosen year is filled, the current year is outlined. | `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:currentYear`     |
| A year picked in the year grid opens the month grid of that year.                                       | `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:pickYear`        |
| In the period panel the month title of each calendar is a button that opens the month grid.             | `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:openMonths` |
| A month picked in a month grid returns to the days of that month.                                       | `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:pickMonth`  |
| A month outside the bounds is unavailable in both panels.                                               | `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateMonths`              |
| Escape in a month or a year grid returns one view back instead of closing the panel.                    | `projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.ts:onEscape`   |
