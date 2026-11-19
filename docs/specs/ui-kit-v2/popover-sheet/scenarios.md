# Scenarios — a panel of choice in the bottom sheet on a phone

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-1382 — on a narrow screen the panel opens in the bottom sheet

Given a select on a narrow screen
When the select is pressed
Then its list is inside the kit's bottom sheet, and no panel stands next to the field

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1383 — the switched-off sheet leaves the panel next to the trigger

Given a select with the sheet switched off on a narrow screen
When the select is pressed
Then its list opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1384 — on a wide screen the panel opens next to the trigger

Given a select on a wide screen
When the select is pressed
Then its list opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1385 — the sheet carries the label of the field as its title

Given a select inside a field labelled «Страна» on a narrow screen
When the select is pressed
Then the title of the bottom sheet is «Страна»

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1386 — a choice in the select closes the sheet

Given the list of a select open in the bottom sheet
When an option is chosen
Then the value of the select is the option, and the bottom sheet is closed

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1387 — choices in the multiselect keep the sheet open

Given the list of a multiselect open in the bottom sheet
When two options are chosen one after another
Then both are in the value, and the bottom sheet is still open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1388 — the backdrop of the sheet closes the panel

Given the list of a select open in the bottom sheet
When the backdrop of the sheet is pressed
Then the bottom sheet is closed, and the select reports its list closed

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1389 — the panel in the sheet takes the width of the sheet

Given the list of a select with the width of its trigger open in the bottom sheet
When it is drawn
Then the list carries no fixed width taken from the field

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.
