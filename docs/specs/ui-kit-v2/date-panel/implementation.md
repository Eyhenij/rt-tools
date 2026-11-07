# What it is carried out by — the kit's own panel of the date field

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **The value keeps its shape: `YYYY-MM-DD`, `HH:mm` or `YYYY-MM-DDTHH:mm`, and `''` when empty.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateWrite` — the panel writes every choice through it. Scenario `SC-UKV-418`
- **The field shows the date in the order of the interface language.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-text.logic.ts:rtDateText` — the field writes its text through it, in the order `rtDateLayout` takes from the locale. Scenario `SC-UKV-467`
- **Typed text becomes the value only when it reads as one within the bounds.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.ts:onTyped` — the text is read by `rtDateParse` and checked against the bounds. Scenario `SC-UKV-419`
- **The panel opens by the button at the end of the field and closes by Escape or a click outside.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.ts:openPanel` — the button calls it; the text input does not. Scenario `SC-UKV-420`
- **The date panel shows a month with paging, and its title opens a choice of month and year.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:openMonths` — the calendar's title click switches the panel to the months. Scenario `SC-UKV-421`
- **In the date panel the year in the header of the month grid is a button that opens the year grid.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:openYears` — the year button of the month grid calls it. Scenario `SC-UKV-1146`
- **The year grid shows twelve years: three in a row in the date panel, four in a row in the period panel.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateYears` — both panels take the cells from it; the row width is each panel's grid. Scenarios `SC-UKV-1146`, `SC-UKV-1152`
- **The span is a block of twelve that holds the shown year.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateYearSpanStart`. Scenario `SC-UKV-1146`
- **The arrows of the year grid page the span by twelve years and stop at the bounds.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateCanPageYears`. Scenarios `SC-UKV-1147`, `SC-UKV-1148`
- **A year outside `min` and `max` is unavailable, the chosen year is filled, the current year is outlined.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:currentYear` — next to `chosenYear`; the unavailable cell comes from `rtDateYears`. Scenarios `SC-UKV-1148`, `SC-UKV-1149`
- **A year picked in the year grid opens the month grid of that year.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:pickYear`. Scenario `SC-UKV-1150`
- **A month outside the bounds is unavailable in both panels.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateMonths` — both panels take the month cells from it. Scenario `SC-UKV-426`
- **Escape in a month or a year grid returns one view back instead of closing the panel.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:onEscape`. Scenario `SC-UKV-1154`
- **Today is outlined and the chosen day is filled.** — `projects/ui-kit-v2/src/lib/components/calendar/rt-calendar.model.ts:today` — a day carries the today sign; the chosen day carries the state `Chosen`. Scenario `SC-UKV-422`
- **For a date a click on a day chooses it and closes the panel; «Сегодня» chooses today.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:pickDay` — for a date it emits the value and the close at once. Scenario `SC-UKV-423`
- **For a time the panel shows an hours column and a minutes column with the minute step.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateTimeColumns` — the columns come from the step and the bounds. Scenario `SC-UKV-424`
- **For a date with time the month and the columns stand side by side, and «Применить» applies.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:apply` — the draft is emitted only here. Scenario `SC-UKV-425`
- **Days and times outside the bounds are switched off, and paging stops at the months of the bounds.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateInBounds` — the month, the columns and the paging ask it. Scenario `SC-UKV-426`
- **The keys in the month move the day like a grid.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateGridKey` — the calendar passes a key and the focused day and applies the answer. Scenario `SC-UKV-427`
- **On a narrow screen the panel opens in the kit's bottom sheet, with days of 44px under a finger.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.ts:narrow` — read from the breakpoints service; the template picks the sheet by it. Scenario `SC-UKV-428`
- **In the bottom sheet the panel keeps the 20px side padding of the sheet header and footer.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.scss:padding-inline` — the modifier `--sheet` sets `--rt-space-5`. Scenario `SC-UKV-1155`
- **The names of months and weekdays follow the locale of the application.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateMonth` — the month is counted with the locale the field injects. Scenario `SC-UKV-429`
- **The entry point `date-picker` gives out the panel for a choice without a text field.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:RtDatePanelComponent` — the barrel of the entry point gives the component out. Scenario `SC-UKV-1171`
- **The input `isTodayButtonShown` hides «Сегодня» of a date panel.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:hasFooter` — the template draws the footer by it. Scenario `SC-UKV-1172`
