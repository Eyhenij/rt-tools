# What it is carried out by — the kit's own panel of the date field

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **The value keeps its shape: `YYYY-MM-DD`, `HH:mm` or `YYYY-MM-DDTHH:mm`, and `''` when empty.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateWrite` — the panel writes every choice through it. Scenario `SC-UKV-418`
- **The field takes typed text in the shape of the value.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.ts:onTyped` — the text is read by `rtDateRead` and checked against the bounds. Scenario `SC-UKV-419`
- **The panel opens by the button at the end of the field and closes by Escape or a click outside.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.ts:openPanel` — the button calls it; the text input does not. Scenario `SC-UKV-420`
- **The date panel shows a month with paging, and its title opens a choice of month and year.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:openMonths` — the calendar's title click switches the panel to the months. Scenario `SC-UKV-421`
- **Today is outlined and the chosen day is filled.** — `projects/ui-kit-v2/src/lib/components/calendar/rt-calendar.model.ts:today` — a day carries the today sign; the chosen day carries the state `Chosen`. Scenario `SC-UKV-422`
- **For a date a click on a day chooses it and closes the panel; «Сегодня» chooses today.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:pickDay` — for a date it emits the value and the close at once. Scenario `SC-UKV-423`
- **For a time the panel shows an hours column and a minutes column with the minute step.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateTimeColumns` — the columns come from the step and the bounds. Scenario `SC-UKV-424`
- **For a date with time the month and the columns stand side by side, and «Применить» applies.** — `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts:apply` — the draft is emitted only here. Scenario `SC-UKV-425`
- **Days and times outside the bounds are switched off, and paging stops at the months of the bounds.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateInBounds` — the month, the columns and the paging ask it. Scenario `SC-UKV-426`
- **The keys in the month move the day like a grid.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateGridKey` — the calendar passes a key and the focused day and applies the answer. Scenario `SC-UKV-427`
- **On a narrow screen the panel opens in the kit's bottom sheet, with days of 44px under a finger.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.ts:narrow` — read from the breakpoints service; the template picks the sheet by it. Scenario `SC-UKV-428`
- **The names of months and weekdays follow the locale of the application.** — `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts:rtDateMonth` — the month is counted with the locale the field injects. Scenario `SC-UKV-429`
