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

### SC-UKV-1444 — on a phone a tap on the user name opens the profile menu in the bottom sheet

Given the page header on a phone with a user and a profile menu
When the user name is tapped
Then the profile menu is inside the bottom sheet titled with the user name, and no panel stands by the name

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-sheet.spec.ts`.

### SC-UKV-1445 — a mouse passing over the button opens no sheet, and leaving it closes none

Given the page header on a narrow screen with a user and a profile menu, used with a mouse
When the mouse comes over the user name, then the name is pressed and the mouse leaves it
Then nothing opens on hover, the press opens the bottom sheet, and it stays open after the mouse left

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-sheet.spec.ts`.

### SC-UKV-1446 — on a phone the actions menu opens in the bottom sheet titled by its button

Given an actions menu labelled «Действия» with two items on a phone
When its button is pressed
Then both items are inside the bottom sheet titled «Действия», and no panel stands by the button

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1447 — an item in the sheet does its action and closes the sheet

Given the actions menu open in the bottom sheet
When an item is pressed
Then the item's action runs once, the sheet is closed, and the menu reports it opened and then closed

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1448 — the backdrop of the sheet closes the actions menu

Given the actions menu open in the bottom sheet
When the backdrop of the sheet is pressed
Then the sheet is closed, and the menu reports it opened and then closed

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1449 — the actions menu stays by its button with the sheet off or on a wide screen

Given the actions menu with the sheet switched off on a phone, then with it on on a wide screen
When its button is pressed
Then the panel opens by the button each time, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1450 — on a phone the menu of a tab opens in the bottom sheet titled by the tab

Given tabs on a phone, where the tab «Брони» carries a menu of its own
When the tab is long pressed
Then the menu of the tab is inside the bottom sheet titled «Брони», and no menu stands by the tab

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu-sheet.spec.ts`.

### SC-UKV-1451 — an item of the tab menu in the sheet does its action and closes the sheet

Given the menu of the tab «Брони» open in the bottom sheet
When its item is pressed
Then the item's action runs for that tab, and the sheet is closed

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu-sheet.spec.ts`.

### SC-UKV-1452 — a toggle group that does not fit folds into a select, and a choice there counts as a press

Given a toggle group «Период» of six values that need 520 px where 343 px are free, on a phone
When it is drawn, its field is pressed and «Месяц» is chosen in the sheet
Then the group stands as a select, its buttons are hidden and only measured, and the group reports «Месяц»

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1453 — a toggle group that fits stays buttons

Given the same group needing 280 px where 343 px are free
When it is drawn
Then it stays buttons, and no field of choice stands in its place

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1454 — a toggle group of multiple choice folds into a multiselect

Given a toggle group of multiple choice that does not fit its place
When it is drawn
Then it stands as a multiselect

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1455 — the folding switched off, or a wrapping layout, keeps the buttons

Given a toggle group that does not fit its place, with the folding switched off, then with a wrapping layout
When it is drawn
Then it stays buttons each time; a group not laid out yet, or short of its place by less than half a pixel, does not fold either

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1456 — the field with toggles sums up the choice instead of chips

Given a multiselect with toggles over five categories
When all five are on, then three, then none
Then the field says «Все», then «3 из 5», then its placeholder, and no chip stands in it

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.spec.ts`.

### SC-UKV-1457 — a row with a toggle switches its value and keeps the panel open

Given a multiselect with toggles open, «Продукты» off
When the row «Продукты» is pressed
Then its toggle is on, the value holds «Продукты», and the panel is still open

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.spec.ts`.

### SC-UKV-1458 — «Show all» turns every value on, and off when all are on

Given a multiselect with toggles open with three of five on
When «Показать все» is pressed twice
Then all five are on after the first press, and none after the second

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.spec.ts`.

### SC-UKV-1459 — the application's own toggles stand above the line, the values under it

Given a multiselect with toggles and the application's toggle «Скрыть пустые»
When its panel is open
Then «Показать все» and «Скрыть пустые» stand above the line, and the five categories under it

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.spec.ts`.

### SC-UKV-1460 — in the sheet the field with toggles has no footer

Given a multiselect with toggles on a phone
When its field is pressed
Then its rows are inside the bottom sheet, and no footer «Выбрано · Сбросить · Готово» stands under them

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.spec.ts`.
