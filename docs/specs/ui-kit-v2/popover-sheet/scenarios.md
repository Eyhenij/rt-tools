# Scenarios — a panel of choice in the bottom sheet on a phone

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-1486 — on a phone the panel opens in the bottom sheet

Given a select on a phone
When the select is pressed
Then its list is inside the kit's bottom sheet, and no panel stands next to the field

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1487 — the switched-off sheet leaves the panel next to the trigger

Given a select with the sheet switched off on a phone
When the select is pressed
Then its list opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1488 — wider than a phone the panel opens next to the trigger

Given a select on a tablet or a desktop
When the select is pressed
Then its list opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1385 — the sheet carries the label of the field as its title

Given a select inside a field labelled «Страна» on a phone
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

### SC-UKV-1439 — the rest of the set opens its panel in the sheet on a phone

Given a part of the set — the split button, the speed menu, the colour palette, the action bar,
the dynamic selector, the table filter header — on a phone
When its panel is opened
Then the panel is inside the bottom sheet, and no panel stands next to the button

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-set.spec.ts` — for the split button, the speed menu, the colour palette, the action bar, the dynamic selector and the table filter header. The «more» panel of the tabs and the filters of the thread list are not covered by a spec yet: they are checked in the showcase.

### SC-UKV-1440 — the switched-off sheet keeps the panel of the rest of the set by its button

Given the same part of the set with the sheet switched off on a phone
When its panel is opened
Then the panel opens next to the button, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-set.spec.ts` — for the split button, the speed menu, the colour palette, the action bar, the dynamic selector and the table filter header. The «more» panel of the tabs and the filters of the thread list are not covered by a spec yet: they are checked in the showcase.

### SC-UKV-1441 — a tap on the autocomplete opens the sheet with a search before any typing

Given an autocomplete on a phone
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

Given the page header on a phone with a user and a profile menu, used with a mouse
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

### SC-UKV-1461 — tabs with the sheet switched off keep the tab menu and «more» by the tabs

Given tabs with the sheet switched off on a phone, where a tab carries a menu of its own
When the tab is long pressed
Then the menu stands by the tab, and no bottom sheet is open; the «more» panel is told the same

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-sheet-off.spec.ts`.

### SC-UKV-1462 — the application switches the sheet off for the popover by one setting

Given an application that provides `RT_POPOVER_SHEET` as false, on a phone
When a popover trigger is pressed
Then the panel opens next to the trigger; without the setting it opens in the sheet

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-guards.spec.ts`.

### SC-UKV-1463 — the same setting keeps the actions menu by its button

Given an application that provides `RT_POPOVER_SHEET` as false, on a phone
When the button of an `rt-menu` is pressed
Then the menu stands by the button, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1464 — the menu in the sheet is walked by keys and gives focus back

Given an `rt-menu` open in the bottom sheet
When the arrows are pressed, then Escape or the backdrop
Then focus stands on the first item and moves by the arrows; the close returns focus to the button

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1465 — the closed sheet returns focus to its trigger

Given a popover open in the bottom sheet
When the sheet closes while focus is inside it
Then focus returns to the trigger; focus that was outside the sheet stays where it was

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-guards.spec.ts`.

### SC-UKV-1466 — crossing the threshold with the menu open draws one panel

Given an `rt-menu` open in the sheet, or open by its button
When the window crosses the phone threshold
Then the menu keeps the surface it opened in, and no second panel appears

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1467 — the tab menu keeps its surface and focuses its first item

Given the menu of a tab open in the sheet
When the window crosses the phone threshold
Then no second panel appears, and the first item of the menu has focus

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu-sheet.spec.ts`.

### SC-UKV-1468 — the closed sheet slides down before it leaves

Given a popover open in the bottom sheet
When the sheet closes
Then it slides down and leaves when its slide ends, or by a timer of the same length

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-guards.spec.ts`.

### SC-UKV-1469 — the page header menu button opens the navigation in the sheet

Given the page header on a phone
When its menu button is pressed
Then the navigation opens in the bottom sheet titled by the menu label

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-sheet.spec.ts`.

### SC-UKV-1470 — «more» of the tabs opens in the sheet

Given tabs that fold the rest into «more», on a phone
When «more» is pressed
Then the list of the tabs opens in the bottom sheet

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-more-sheet.spec.ts`.

### SC-UKV-1471 — the setting keeps the tab menu by the press point

Given an application that provides `RT_POPOVER_SHEET` as false, on a phone
When a tab's menu is opened
Then the menu stands by the tab, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu-sheet.spec.ts`.

### SC-UKV-1472 — the date field with the sheet switched off opens its panel by the field

Given a date field with the sheet switched off, on a phone
When its calendar button is pressed
Then the panel opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.spec.ts`.

### SC-UKV-1473 — the period field with the sheet switched off opens its panel by the field

Given a period field with the sheet switched off, on a phone
When its calendar button is pressed
Then the panel opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.component.spec.ts`.

### SC-UKV-1474 — the folded toggle group passes the switch and has no clear cross

Given a toggle group folded into a field, with the sheet switched off, on a phone
When the field is pressed
Then the list opens next to the field, and the single choice field shows no clear cross

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1475 — «Show all» keeps disabled and unknown values

Given a field with toggles whose value holds a disabled option and a value not among the options
When «Show all» is pressed, and pressed again
Then both kept values stay in the value both times

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles-keys.spec.ts`.

### SC-UKV-1476 — «Reset» in the sheet keeps disabled values

Given a multiselect in the sheet whose value holds a disabled option
When «Reset» is pressed
Then the disabled value stays, and «Reset» goes inactive when nothing is left to take off

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles-keys.spec.ts`.

### SC-UKV-1477 — «Show all» is reached by the arrows

Given an open field with toggles
When the arrows are pressed, then Enter
Then «Show all» is the first highlighted row and Enter switches it; the trigger names the highlighted row

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles-keys.spec.ts`.

### SC-UKV-1478 — the panel with toggles carries no name without a role

Given a field with toggles and a field with a list
When both are opened
Then the toggles panel has no accessible name of its own, and the list keeps its name

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles-keys.spec.ts`.

### SC-UKV-1479 — the clear cross in the sheet mode does not reopen the sheet

Given an autocomplete with a value, on a phone
When its clear cross is pressed
Then the value is gone, and no bottom sheet opens

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1480 — moving into the sheet does not mark the field touched

Given a required autocomplete on a phone
When the field is pressed and the sheet opens, then the sheet closes
Then the field shows no error while the sheet is open and is marked touched when it closes

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1481 — keys in the sheet search walk the suggestions

Given an autocomplete open in the sheet with suggestions
When the arrows and Enter are pressed in the sheet search
Then the highlight moves and Enter chooses the highlighted suggestion

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1482 — the autocomplete with the sheet switched off suggests by the field

Given an autocomplete with the sheet switched off, on a phone
When a letter is typed in it
Then the suggestions open next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1483 — the floating label titles the sheet

Given a select with a floating label «Город» and no field around it, on a phone
When the select is pressed
Then the title of the bottom sheet is «Город»

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1489 — the application setting keeps the date panel by the field

Given an application that provides `RT_POPOVER_SHEET` as false, on a phone
When the calendar button of a date field is pressed
Then the panel opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.spec.ts`.

### SC-UKV-1490 — the application setting keeps the period panel by the field

Given an application that provides `RT_POPOVER_SHEET` as false, on a phone
When the calendar button of a period field is pressed
Then the panel opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.component.spec.ts`.

### SC-UKV-1491 — the table passes the switch to its filter header

Given a table with the sheet switched off, on a phone
When the operator of a column filter is pressed
Then its panel opens by the button, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/table/rt-table-sheet.spec.ts`.

### SC-UKV-1492 — the page header passes the switch to the user menu of its rail

Given a page header laid out as a rail, with the sheet switched off, on a phone
When the user button is pressed
Then the profile menu opens by the button, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-sheet.spec.ts`.

### SC-UKV-1484 — the select search works in the sheet

Given a select with a search, open in the sheet
When a part of an option is typed in the search
Then the search stands in the sheet and leaves only the matching options

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1493 — focus moves into the sheet once it is open

Given a menu or a popover opening in the bottom sheet on a phone
When the sheet opens
Then focus moves into it only after the sheet stops being inert

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`, `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet-focus.spec.ts`.

### SC-UKV-1494 — the tab menu in the sheet focuses its first item once open

Given the menu of a tab opening in the bottom sheet on a phone
When the sheet opens
Then the first item has focus, and the sheet is not inert at that moment

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu-sheet.spec.ts`.

### SC-UKV-1495 — crossing the threshold keeps the autocomplete surface as it opened

Given an autocomplete open in the sheet, or open by the field
When the window crosses the phone threshold
Then the sheet search neither disappears from the sheet nor appears by the field

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet-review.spec.ts`.

### SC-UKV-1496 — crossing the threshold keeps the multiselect footer as it opened

Given a multiselect open in the sheet, or open by the field
When the window crosses the phone threshold
Then the footer neither disappears from the sheet nor appears by the field

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet-review.spec.ts`.

### SC-UKV-1497 — a sheet opened during the close of another keeps the page still

Given a sheet still sliding down
When a new sheet opens
Then the old one leaves at once, and the page behind the new sheet does not scroll

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`.

### SC-UKV-1498 — focus returns to something that takes it

Given a sheet opened from a part whose own box takes no focus
When the sheet closes while focus is inside it
Then focus lands on the first focusable control of that part, and the autocomplete does not search or open again for it

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`, `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet-review.spec.ts`.

### SC-UKV-1499 — the folded group unfolds only with room to spare

Given a toggle group folded into a field
When its place grows, or changes because of the fold itself
Then it unfolds only when the place is the width of its buttons plus 8 px; the fold's own change does not unfold it

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1500 — a sheet dismissed by a drag slides out

Given a sheet dragged down past the dismissal point
When it closes
Then it slides out before it leaves

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`.

### SC-UKV-1501 — the sheet dialog is named by its title

Given a sheet with a title
When it opens
Then its dialog is named by that title for a screen reader

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`.

### SC-UKV-1502 — the autocomplete search in the sheet is announced as a combobox

Given an autocomplete open in the sheet
When its search is focused
Then the search carries the combobox role and its links to the suggestions

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet-review.spec.ts`.

### SC-UKV-1503 — a tap on the autocomplete does not search below the minimum

Given an autocomplete with a minimum query length, on a phone
When the field is tapped with a shorter text
Then the sheet opens and no search is asked of the application

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet-review.spec.ts`.

### SC-UKV-1504 — the multiselect footer counts what its rows show

Given a multiselect whose value holds a value not among the options
When its sheet footer is shown
Then the count includes only values among the options, disabled ones too

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet-review.spec.ts`.

### SC-UKV-1505 — the application panel class reaches the sheet

Given a popover with a panel class of the application
When it opens in the sheet
Then the class stands on the sheet's box

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`.
