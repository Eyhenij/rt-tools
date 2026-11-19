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

### SC-UKV-1436 — the footer of the multiselect sheet counts the chosen values

Given a multiselect with two values chosen, open in the bottom sheet
When the sheet is drawn
Then its footer says «Selected: 2» and carries a reset and a done button

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1437 — the reset in the footer takes the whole choice off and keeps the sheet open

Given a multiselect with two values chosen, open in the bottom sheet
When the reset in the footer is pressed
Then the choice is empty, the multiselect reports it, and the sheet stays open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1438 — the done button in the footer closes the sheet

Given a multiselect open in the bottom sheet
When the done button in the footer is pressed
Then the bottom sheet is closed, and the choice made stays

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1439 — the rest of the set opens its panel in the sheet on a narrow screen

Given a part of the set — the split button, the speed menu, the colour palette, the action bar,
the dynamic selector, the table filter header — on a narrow screen
When its panel is opened
Then the panel is inside the bottom sheet, and no panel stands next to the button

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-set.spec.ts` — for the split button, the speed menu, the colour palette, the action bar, the dynamic selector and the table filter header. The «more» panel of the tabs and the filters of the thread list are not covered by a spec yet: they are checked in the showcase.

### SC-UKV-1440 — the switched-off sheet keeps the panel of the rest of the set by its button

Given the same part of the set with the sheet switched off on a narrow screen
When its panel is opened
Then the panel opens next to the button, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-set.spec.ts` — for the split button, the speed menu, the colour palette, the action bar, the dynamic selector and the table filter header. The «more» panel of the tabs and the filters of the thread list are not covered by a spec yet: they are checked in the showcase.

### SC-UKV-1441 — a tap on the autocomplete opens the sheet with a search before any typing

Given an autocomplete on a narrow screen
When its field gets the focus
Then the bottom sheet is open with a search at its top and the suggestions under it

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1442 — typing in the search of the sheet asks for suggestions and keeps the sheet open

Given the autocomplete open in the bottom sheet
When «Гру» is typed in the search of the sheet, then the search is emptied
Then the autocomplete asked for suggestions for «Гру», and the sheet stays open

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1443 — a suggestion chosen in the sheet sets the value and closes the sheet

Given the autocomplete open in the bottom sheet
When a suggestion is pressed
Then the autocomplete reports that value, and the bottom sheet is closed

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.
