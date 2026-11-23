# Scenarios — the header of a bottom sheet and the cards of choice

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

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

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`; for the
multiselect by `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet.spec.ts`.

### SC-UKV-1717 — one input returns the rows the panel has next to its trigger

Given a select with the cards switched off
When it is open in the sheet
Then its rows are the rows the list has next to the field

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`; for the
multiselect by `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet.spec.ts`,
for the autocomplete by `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`,
for the dynamic selector by `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-sheet.spec.ts`,
for the table column filter by `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.spec.ts`.

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

### SC-UKV-1721 — a sheet with a search is open by the height of its content and marked as typed in while the focus is in its search

Given a select with a search open in the sheet by the height of its content
When the search takes the focus
Then the sheet is marked as typed in, which on a touch screen gives it the full height, and the mark
leaves with the focus; the focus on a card, a checkbox, a radio button, a button or a read-only
field does not set the mark: nobody types there

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts`; which node is
typed in — by `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.logic.spec.ts`.

### SC-UKV-1722 — the filters sheet opens by the height of its fields, the apply button stands in its header

Given the page filters on a phone
When they are opened
Then the sheet takes the height of its fields, and the apply button stands on the right of the header

Covered: `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.spec.ts`.

### SC-UKV-1723 — a sheet with a choice not applied asks before it closes

Given the page filters open in the sheet with an input made since they opened
When the close button is pressed
Then a question with apply, do not apply and cancel stands at the bottom of the screen, and the sheet stays open

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-unsaved.spec.ts`; for
the page filters by `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.spec.ts`.

### SC-UKV-1724 — the answers of the question apply, drop or keep

Given the question before closing
When apply is pressed the sheet applies and closes, when do not apply is pressed it closes without applying, when cancel is pressed it stays open
Then the application learns of the apply only in the first case

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-unsaved.spec.ts`.

### SC-UKV-1725 — a sheet with nothing changed closes at once

Given the page filters open in the sheet with nothing changed
When the close button is pressed
Then the sheet closes, and no question is shown

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-unsaved.spec.ts`; for
the page filters by `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.spec.ts`,
for the dynamic selector by `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-sheet.spec.ts`.

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

### SC-UKV-1750 — a header template stands in place of the close button, the title and the action

Given a bottom sheet with a header template of the application
When the sheet is drawn
Then the template stands in the header, the close button, the title and the action of the sheet are
not drawn, and the handle stays; without the template the sheet draws its own header

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-templates.spec.ts`.

### SC-UKV-1751 — a footer template stands in the footer of the sheet

Given a bottom sheet with a footer template of the application
When the sheet is drawn
Then the template stands in the footer instead of the nodes projected there

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-templates.spec.ts`.

### SC-UKV-1752 — the request to close from a template closes the sheet or asks first

Given a bottom sheet with its own header and footer templates
When a button of a template calls the request to close
Then the sheet closes, and with a choice not applied the question before closing is shown first

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-templates.spec.ts`.

### SC-UKV-1753 — a panel of choice puts its templates into the header and the footer of its sheet

Given a panel of choice with a header template and a footer template, on a phone
When the panel is opened
Then both templates stand in its sheet, and the request to close from the header closes the panel

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-templates.spec.ts`.

### SC-UKV-1754 — a list of choice hands its sheet templates over to the sheet

Given a select with a header template and a footer template on its inputs, on a phone
When the list is opened
Then the sheet shows the options with the templates in its header and footer

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-templates.spec.ts`.

### SC-UKV-1755 — the reset in the footer of the filters sheet reports the reset and keeps the sheet open

Given the sheet of the page filters open on a phone with an input made in it
When the reset in its footer is pressed
Then the application is told to reset the filters, the sheet stays open and closes without a
question; with no filter set and nothing typed the reset is off

Covered: `projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.spec.ts`.
