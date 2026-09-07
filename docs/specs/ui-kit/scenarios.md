# Scenarios — the first kit

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across the
domain, and the numbers were not recounted at the merges of the agreements and at the move into a
subdomain: the number ties a scenario to the title of its test.

| Subdomain                                                                                    | Scenarios             |
| -------------------------------------------------------------------------------------------- | --------------------- |
| [The second level of the side menu](side-menu/scenarios.md)                                  | `SC-UK-17`…`SC-UK-52` |
| [The look of a field of input in the setting of the kit](form-field-appearance/scenarios.md) | `SC-UK-53`…`SC-UK-55` |

## The button of the copying at an empty cell

### SC-UK-01 — at an empty cell of a copyable column there is no button

Given the column is declared copyable, and the value of the cell is empty
When the row of the table is drawn
Then there is no button of the copying in the markup of the cell

Covered: `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.spec.ts`.

### SC-UK-02 — at a cell with a value the button stays

Given the column is declared copyable, and the value of the cell is not empty
When the row of the table is drawn
Then there is a button of the copying in the markup of the cell

Covered: `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.spec.ts`.

### SC-UK-03 — the emptiness is counted by the same utility that draws the dash

Given the value of the cell is an empty string, an empty array or an empty object
When the row of the table is drawn
Then there is no button of the copying in any of the three cases

Covered: `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.spec.ts`.

### SC-UK-04 — a column that is not copyable gets no button

Given the column is not declared copyable, and the value of the cell is not empty
When the row of the table is drawn
Then there is no button of the copying in the markup of the cell

Covered: `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.spec.ts`.

## The delay of the showing of a spinner

### SC-UK-05 — without a delay the spinner is visible at once

Given the delay is not named
When the spinner is inserted
Then the circle of the waiting is drawn by the same frame

Covered: `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.spec.ts`.

### SC-UK-06 — until the end of the delay the spinner is not visible

Given a delay of three hundred milliseconds is named
When the spinner is inserted and two hundred and ninety-nine milliseconds have passed
Then there is no circle of the waiting in the markup

Covered: `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.spec.ts`.

### SC-UK-07 — after the end of the delay the spinner appears

Given a delay of three hundred milliseconds is named
When the spinner is inserted and three hundred milliseconds have passed
Then the circle of the waiting is drawn

Covered: `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.spec.ts`.

### SC-UK-08 — a spinner lifted before the term takes its counter away with it

Given a delay is named, and the spinner is lifted earlier than its end
When the time of the delay has run out
Then no postponed showing happens and no waiting counters are left

Covered: `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.spec.ts`.

## What a curtain is closed by

### SC-UK-09 — Esc does not close an open curtain

Given the curtain is open without a setting of the closing
When Esc is pressed
Then the curtain stays open, and no answer about the closing arrives

Covered: `projects/ui-kit/src/lib/ui-kit/aside/aside.service.spec.ts`.

### SC-UK-10 — a closing by a key allowed by the setting works

Given the curtain is open with a permission to close it by a key
When Esc is pressed
Then the curtain closes

Covered: `projects/ui-kit/src/lib/ui-kit/aside/aside.service.spec.ts`.

### SC-UK-11 — a click on the backing closes the curtain as before

Given the curtain is open without a setting of the closing
When the backing is pressed
Then the curtain closes

Covered: `projects/ui-kit/src/lib/ui-kit/aside/aside.service.spec.ts`.

### SC-UK-12 — a programmatic closing is not put out by the setting

Given the curtain is open without a setting of the closing
When the consumer closes it by their own code
Then the curtain closes and gives back an answer

Covered: `projects/ui-kit/src/lib/ui-kit/aside/aside.service.spec.ts`.

## A sorting by a column the table does not have

### SC-UK-13 — a sorting by a declared column goes away to the consumer

Given a column is declared at the table, and its heading is pressed
When the table gives the sorting outward
Then the consumer gets the same column and the same direction

Covered: `projects/ui-kit/src/lib/ui-kit/table/components/table/rtui-table.component.spec.ts`.

### SC-UK-14 — a sorting by a column the table does not have does not go outward

Given the name of the column coincides with none of the declared ones
When the table is about to give the sorting
Then nothing goes outward

Covered: `projects/ui-kit/src/lib/ui-kit/table/components/table/rtui-table.component.spec.ts`.

## The choice of the outcome at fast repeated calls

### SC-UK-15 — the setting is shown by the last reading, not by the one that answered last

Given the composition of the columns changed, and the reading of the saved setting is called twice
When the first reading answers later than the second
Then the table shows the setting under the present composition of the columns

Covered: `projects/ui-kit/src/lib/ui-kit/table/util/table-config.service.spec.ts`.

### SC-UK-16 — a write and a lifting reach the storage in the order of the calls

Given the setting is written, and right after it it is lifted
When the write has not answered yet
Then the lifting waits for it and does not outrun it

Covered: `projects/ui-kit/src/lib/ui-kit/table/util/table-config.service.spec.ts`.
