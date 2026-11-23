# Scenarios — a panel of choice in the bottom sheet on a phone

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-1608 — on a phone the panel opens in the bottom sheet

Given a select on a phone
When the select is pressed
Then its list is inside the kit's bottom sheet, and no panel stands next to the field

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`; on the admin
panel's state filter by `apps/message-bus-admin-e2e/src/list-state-filter-sheet.narrow.spec.ts`.

### SC-UKV-1609 — the switched-off sheet leaves the panel next to the trigger

Given a select with the sheet switched off on a phone
When the select is pressed
Then its list opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1610 — wider than a phone the panel opens next to the trigger

Given a select on a tablet or a desktop
When the select is pressed
Then its list opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1628 — a narrow window wider than a phone keeps the panel next to the trigger

Given a select in a window narrower than the kit's narrow threshold and wider than 480 px
When the select is pressed
Then its list opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1672 — the sheet carries the label of the field as its title

Given a select inside a field labelled «Страна» on a phone
When the select is pressed
Then the title of the bottom sheet is «Страна»

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1673 — a choice in the select closes the sheet

Given the list of a select open in the bottom sheet
When an option is chosen
Then the value of the select is the option, and the bottom sheet is closed

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`; on the admin
panel's state filter by `apps/message-bus-admin-e2e/src/list-state-filter-sheet.narrow.spec.ts`.

### SC-UKV-1674 — choices in the multiselect keep the sheet open

Given the list of a multiselect open in the bottom sheet
When two options are chosen one after another
Then both are in the value, and the bottom sheet is still open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1675 — the backdrop of the sheet closes the panel

Given the list of a select open in the bottom sheet
When the backdrop of the sheet is pressed
Then the bottom sheet is closed, and the select reports its list closed

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1676 — the panel in the sheet takes the width of the sheet

Given the list of a select with the width of its trigger open in the bottom sheet
When it is drawn
Then the list carries no fixed width taken from the field

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1677 — the footer of the multiselect sheet counts the chosen values

Given a multiselect with two values chosen, open in the bottom sheet
When the sheet is drawn
Then its footer says «Selected: 2» and carries a reset and a done button

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1678 — the reset in the footer takes the whole choice off and keeps the sheet open

Given a multiselect with two values chosen, open in the bottom sheet
When the reset in the footer is pressed
Then the choice is empty, the multiselect reports it, and the sheet stays open

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1679 — the done button in the footer closes the sheet

Given a multiselect open in the bottom sheet
When the done button in the footer is pressed
Then the bottom sheet is closed, and the choice made stays

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1680 — the rest of the set opens its panel in the sheet on a phone

Given a part of the set — the split button, the speed menu, the colour palette, the action bar,
the dynamic selector, the table filter header — on a phone
When its panel is opened
Then the panel is inside the bottom sheet, and no panel stands next to the button

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-set.spec.ts` — for the split button, the speed menu, the colour palette, the action bar, the dynamic selector and the table filter header. The «more» panel of the tabs and the filters of the thread list are not covered by a spec yet: they are checked in the showcase.

### SC-UKV-1681 — the switched-off sheet keeps the panel of the rest of the set by its button

Given the same part of the set with the sheet switched off on a phone
When its panel is opened
Then the panel opens next to the button, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-set.spec.ts` — for the split button, the speed menu, the colour palette, the action bar, the dynamic selector and the table filter header. The «more» panel of the tabs and the filters of the thread list are not covered by a spec yet: they are checked in the showcase.

### SC-UKV-1682 — a tap on the autocomplete opens the sheet with a search before any typing

Given an autocomplete on a phone
When its field gets the focus
Then the bottom sheet is open with a search at its top and the suggestions under it

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1683 — typing in the search of the sheet asks for suggestions and keeps the sheet open

Given the autocomplete open in the bottom sheet
When «Гру» is typed in the search of the sheet, then the search is emptied
Then the autocomplete asked for suggestions for «Гру», and the sheet stays open

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1684 — a suggestion chosen in the sheet sets the value and closes the sheet

Given the autocomplete open in the bottom sheet
When a suggestion is pressed
Then the autocomplete reports that value, and the bottom sheet is closed

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1685 — on a phone a tap on the user name opens the profile menu in the bottom sheet

Given the page header on a phone with a user and a profile menu
When the user name is tapped
Then the profile menu is inside the bottom sheet titled with the user name, and no panel stands by the name

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-sheet.spec.ts`.

### SC-UKV-1686 — a mouse passing over the button opens no sheet, and leaving it closes none

Given the page header on a phone with a user and a profile menu, used with a mouse
When the mouse comes over the user name, then the name is pressed and the mouse leaves it
Then nothing opens on hover, the press opens the bottom sheet, and it stays open after the mouse left

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-sheet.spec.ts`.

### SC-UKV-1687 — on a phone the actions menu opens in the bottom sheet titled by its button

Given an actions menu labelled «Действия» with two items on a phone
When its button is pressed
Then both items are inside the bottom sheet titled «Действия», and no panel stands by the button

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1688 — an item in the sheet does its action and closes the sheet

Given the actions menu open in the bottom sheet
When an item is pressed
Then the item's action runs once, the sheet is closed, and the menu reports it opened and then closed

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1689 — the backdrop of the sheet closes the actions menu

Given the actions menu open in the bottom sheet
When the backdrop of the sheet is pressed
Then the sheet is closed, and the menu reports it opened and then closed

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1690 — the actions menu stays by its button with the sheet off or on a wide screen

Given the actions menu with the sheet switched off on a phone, then with it on on a wide screen
When its button is pressed
Then the panel opens by the button each time, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1691 — on a phone the menu of a tab opens in the bottom sheet titled by the tab

Given tabs on a phone, where the tab «Брони» carries a menu of its own
When the tab is long pressed
Then the menu of the tab is inside the bottom sheet titled «Брони», and no menu stands by the tab

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu-sheet.spec.ts`.

### SC-UKV-1692 — an item of the tab menu in the sheet does its action and closes the sheet

Given the menu of the tab «Брони» open in the bottom sheet
When its item is pressed
Then the item's action runs for that tab, and the sheet is closed

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu-sheet.spec.ts`.

### SC-UKV-1702 — tabs with the sheet switched off keep the tab menu and «more» by the tabs

Given tabs with the sheet switched off on a phone, where a tab carries a menu of its own
When the tab is long pressed
Then the menu stands by the tab, and no bottom sheet is open; the «more» panel is told the same

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-sheet-off.spec.ts`.

### SC-UKV-1703 — the application switches the sheet off for the popover by one setting

Given an application that provides `RT_POPOVER_SHEET` as false, on a phone
When a popover trigger is pressed
Then the panel opens next to the trigger; without the setting it opens in the sheet

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-guards.spec.ts`.

### SC-UKV-1586 — the same setting keeps the actions menu by its button

Given an application that provides `RT_POPOVER_SHEET` as false, on a phone
When the button of an `rt-menu` is pressed
Then the menu stands by the button, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1587 — the menu in the sheet is walked by keys and gives focus back

Given an `rt-menu` open in the bottom sheet
When the arrows are pressed, then Escape or the backdrop
Then focus stands on the first item and moves by the arrows; the close returns focus to the button

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1588 — the closed sheet returns focus to its trigger

Given a popover open in the bottom sheet
When the sheet closes while focus is inside it
Then focus returns to the trigger; focus that was outside the sheet stays where it was

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-guards.spec.ts`.

### SC-UKV-1589 — crossing the threshold with the menu open draws one panel

Given an `rt-menu` open in the sheet, or open by its button
When the window crosses the phone threshold
Then the menu keeps the surface it opened in, and no second panel appears

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts`.

### SC-UKV-1590 — the tab menu keeps its surface and focuses its first item

Given the menu of a tab open in the sheet
When the window crosses the phone threshold
Then no second panel appears, and the first item of the menu has focus

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu-sheet.spec.ts`.

### SC-UKV-1591 — the closed sheet slides down before it leaves

Given a popover open in the bottom sheet
When the sheet closes
Then it slides down and leaves when its slide ends, or by a timer of the same length

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-guards.spec.ts`.

### SC-UKV-1592 — the page header menu button opens the navigation in the sheet

Given the page header on a phone
When its menu button is pressed
Then the navigation opens in the bottom sheet titled by the menu label

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-sheet.spec.ts`.

### SC-UKV-1593 — «more» of the tabs opens in the sheet

Given tabs that fold the rest into «more», on a phone
When «more» is pressed
Then the list of the tabs opens in the bottom sheet

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-more-sheet.spec.ts`.

### SC-UKV-1594 — the setting keeps the tab menu by the press point

Given an application that provides `RT_POPOVER_SHEET` as false, on a phone
When a tab's menu is opened
Then the menu stands by the tab, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu-sheet.spec.ts`.

### SC-UKV-1595 — the date field with the sheet switched off opens its panel by the field

Given a date field with the sheet switched off, on a phone
When its calendar button is pressed
Then the panel opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.spec.ts`.

### SC-UKV-1596 — the period field with the sheet switched off opens its panel by the field

Given a period field with the sheet switched off, on a phone
When its calendar button is pressed
Then the panel opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.component.spec.ts`.

### SC-UKV-1602 — the clear cross in the sheet mode does not reopen the sheet

Given an autocomplete with a value, on a phone
When its clear cross is pressed
Then the value is gone, and no bottom sheet opens

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1603 — moving into the sheet does not mark the field touched

Given a required autocomplete on a phone
When the field is pressed and the sheet opens, then the sheet closes
Then the field shows no error while the sheet is open and is marked touched when it closes

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1604 — keys in the sheet search walk the suggestions

Given an autocomplete open in the sheet with suggestions
When the arrows and Enter are pressed in the sheet search
Then the highlight moves and Enter chooses the highlighted suggestion

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1605 — the autocomplete with the sheet switched off suggests by the field

Given an autocomplete with the sheet switched off, on a phone
When a letter is typed in it
Then the suggestions open next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1606 — the floating label titles the sheet

Given a select with a floating label «Город» and no field around it, on a phone
When the select is pressed
Then the title of the bottom sheet is «Город»

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1611 — the application setting keeps the date panel by the field

Given an application that provides `RT_POPOVER_SHEET` as false, on a phone
When the calendar button of a date field is pressed
Then the panel opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.spec.ts`.

### SC-UKV-1612 — the application setting keeps the period panel by the field

Given an application that provides `RT_POPOVER_SHEET` as false, on a phone
When the calendar button of a period field is pressed
Then the panel opens next to the field, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.component.spec.ts`.

### SC-UKV-1613 — the table passes the switch to its filter header

Given a table with the sheet switched off, on a phone
When the operator of a column filter is pressed
Then its panel opens by the button, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/table/rt-table-sheet.spec.ts`.

### SC-UKV-1614 — the page header passes the switch to the user menu of its rail

Given a page header laid out as a rail, with the sheet switched off, on a phone
When the user button is pressed
Then the profile menu opens by the button, and no bottom sheet is open

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-sheet.spec.ts`.

### SC-UKV-1607 — the select search works in the sheet

Given a select with a search, open in the sheet
When a part of an option is typed in the search
Then the search stands in the sheet and leaves only the matching options

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1615 — focus moves into the sheet once it is open

Given a menu or a popover opening in the bottom sheet on a phone
When the sheet opens
Then focus moves into it only after the sheet stops being inert

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`, `projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet-focus.spec.ts`.

### SC-UKV-1616 — the tab menu in the sheet focuses its first item once open

Given the menu of a tab opening in the bottom sheet on a phone
When the sheet opens
Then the first item has focus, and the sheet is not inert at that moment

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-context-menu-sheet.spec.ts`.

### SC-UKV-1617 — crossing the threshold keeps the autocomplete surface as it opened

Given an autocomplete open in the sheet, or open by the field
When the window crosses the phone threshold
Then the sheet search neither disappears from the sheet nor appears by the field

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet-review.spec.ts`.

### SC-UKV-1618 — crossing the threshold keeps the multiselect footer as it opened

Given a multiselect open in the sheet, or open by the field
When the window crosses the phone threshold
Then the footer neither disappears from the sheet nor appears by the field

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet-review.spec.ts`.

### SC-UKV-1619 — a sheet opened during the close of another keeps the page still

Given a sheet still sliding down
When a new sheet opens
Then the old one leaves at once, and the page behind the new sheet does not scroll

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`.

### SC-UKV-1620 — focus returns to something that takes it

Given a sheet opened from a part whose own box takes no focus
When the sheet closes while focus is inside it
Then focus lands on the first focusable control of that part, and the autocomplete does not search or open again for it

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`, `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet-review.spec.ts`.

### SC-UKV-1622 — a sheet dismissed by a drag slides out

Given a sheet dragged down past the dismissal point
When it closes
Then it slides out before it leaves

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`.

### SC-UKV-1623 — the sheet dialog is named by its title

Given a sheet with a title
When it opens
Then its dialog is named by that title for a screen reader

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`.

### SC-UKV-1624 — the autocomplete search in the sheet is announced as a combobox

Given an autocomplete open in the sheet
When its search is focused
Then the search carries the combobox role and its links to the suggestions

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet-review.spec.ts`.

### SC-UKV-1625 — a tap on the autocomplete does not search below the minimum

Given an autocomplete with a minimum query length, on a phone
When the field is tapped with a shorter text
Then the sheet opens and no search is asked of the application

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet-review.spec.ts`.

### SC-UKV-1626 — the multiselect footer counts what its rows show

Given a multiselect whose value holds a value not among the options
When its sheet footer is shown
Then the count includes only values among the options, disabled ones too

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet-review.spec.ts`.

### SC-UKV-1627 — the application panel class reaches the sheet

Given a popover with a panel class of the application
When it opens in the sheet
Then the class stands on the sheet's box

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-review.spec.ts`.

### SC-UKV-1710 — every sheet has a close button on the left of its header

Given an open bottom sheet of the kit
When its header is shown
Then a close button stands on the left of the header, and the title stands in the centre

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.spec.ts`.

### SC-UKV-1711 — the close button closes the sheet and returns the focus

Given a select open in the sheet
When the close button is pressed
Then the sheet closes, and the focus stands on the field

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1712 — a sheet with no title keeps the close button

Given a bottom sheet with no title
When it is open
Then the close button stands on the left, and the header holds no title

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.spec.ts`.

### SC-UKV-1713 — the action of a sheet stands on the right of its header

Given a multiselect open in the sheet
When its header is shown
Then a filled done button stands on the right of the header, and the footer holds the count and the reset

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet.spec.ts`.

### SC-UKV-1714 — a choice of one value is drawn as cards with the kit radio button

Given a select open in the sheet
When its list is shown
Then every option is a card with the label on the left and the kit radio button on the right, and the chosen one is checked

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1715 — a choice of several values is drawn as cards with the kit checkbox

Given a multiselect open in the sheet
When its list is shown
Then every option is a card with the kit checkbox on the right

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet.spec.ts`.

### SC-UKV-1716 — the description of an option is the second line of its card

Given a select whose option carries a description
When the select is open in the sheet
Then the card shows the description under the label, and next to the trigger the row does not show it

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1717 — one input returns the rows the panel has next to its trigger

Given a select with the cards switched off
When it is open in the sheet
Then its rows are the rows the list has next to the field

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1718 — the dynamic selector draws cards in the sheet

Given a dynamic selector open in the sheet
When its list is shown
Then every option is a card with the mark on the right

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-sheet.spec.ts`.

### SC-UKV-1719 — the hints of an autocomplete are cards in the sheet

Given an autocomplete open in the sheet
When its hints are shown
Then every hint is a card

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.

### SC-UKV-1720 — the comparison kinds of a column filter are cards in the sheet

Given a table column filter on a phone
When the comparison kind is pressed
Then the kinds are cards with the kit radio button, and the current one is checked

Covered: `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.spec.ts`.

### SC-UKV-1721 — a sheet with a search takes the full height while the keyboard is open

Given a select with a search open in the sheet by the height of its content
When the search takes the focus
Then the sheet takes the full height, and it returns to the height of its content when the search loses the focus

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`.

### SC-UKV-1722 — the page filters open at full height with the apply button in the header

Given the page filters on a phone
When they are opened
Then the sheet takes the full height, and the apply button stands on the right of the header

Covered: `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.spec.ts`.

### SC-UKV-1723 — a sheet with a choice not applied asks before it closes

Given the page filters open in the sheet with an input made since they opened
When the close button is pressed
Then a question with apply, do not apply and cancel stands at the bottom of the screen, and the sheet stays open

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-unsaved.spec.ts`.

### SC-UKV-1724 — the answers of the question apply, drop or keep

Given the question before closing
When apply is pressed the sheet applies and closes, when do not apply is pressed it closes without applying, when cancel is pressed it stays open
Then the application learns of the apply only in the first case

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-unsaved.spec.ts`.

### SC-UKV-1725 — a sheet with nothing changed closes at once

Given the page filters open in the sheet with nothing changed
When the close button is pressed
Then the sheet closes, and no question is shown

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-unsaved.spec.ts`.

### SC-UKV-1726 — the sheet of a date field locks the page scroll and closes by Escape

Given a date field open in the sheet
When Escape is pressed
Then the sheet closes, and while it was open the page did not scroll

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.spec.ts`; for the page filters by `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.spec.ts`.

### SC-UKV-1727 — the dynamic selector with marks set asks before it closes

Given a dynamic selector open in the sheet with marks changed and not applied
When the sheet is dragged down
Then the question before closing is shown

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-sheet.spec.ts`.
