# Scenarios — the filter in the header cell of the table

Every scenario is checked by a test, and the test is named by the number. A scenario a test does not
reach carries a `Not covered:` mark saying what closes it instead.

The numbers are issued once and are never reused: a number given to a second scenario leaves the old
reference alive and pointing at something else.

### SC-UKV-214 — the filter stands in the header cell of the column

Given a column whose settings declare a filter
When the header of the table is drawn
Then the header cell of that column carries the filter next to the column's name

Covered by the component test of the header cell.

### SC-UKV-215 — a column without filter settings carries no filter

Given a column whose settings declare no filter
When the header of the table is drawn
Then that header cell carries no filter at all

Covered by the component test of the header cell.

### SC-UKV-216 — the kind of the filter decides which part of the kit is called

Given four columns, one of each kind — text, number, a choice from a list, a date
When the header of the table is drawn
Then each cell carries the part of the kit for its kind, and no cell carries a control of its own

Covered by the component test of the header cell.

### SC-UKV-217 — the operators offered are the ones the column allows

Given a column that allows two of the operators
When the menu of the operators is opened
Then exactly those two stand in it

Covered by the component test of the header cell.

### SC-UKV-218 — a value chosen goes outward with the whole set of conditions

Given a set of conditions that already holds another column
When a value is chosen in this column
Then the set that goes outward holds both columns

Covered by the component test of the header cell.

### SC-UKV-219 — an empty value takes the column out of the set

Given a set of conditions that holds this column
When the value is cleared
Then the set that goes outward does not hold this column at all, and no empty condition stands in it

Covered by the component test of the header cell.

### SC-UKV-220 — the value that is already chosen reports nothing

Given a column whose value is set
When the same value is chosen again
Then nothing goes outward

Covered by the component test of the header cell.

### SC-UKV-221 — the operator changed with no value reports nothing

Given a column with no value set
When another operator is chosen
Then nothing goes outward

Covered by the component test of the header cell.

### SC-UKV-222 — the operator changed with a value set goes outward

Given a column whose value is set
When another operator is chosen
Then the set that goes outward holds this column with the new operator and the same value

Covered by the component test of the header cell.

### SC-UKV-223 — a date is compared in the form it is kept in

Given a column of the date kind whose value is set
When the same date is chosen again
Then nothing goes outward

Covered by the component test of the header cell.

### SC-UKV-224 — the filter narrows no rows itself

Given a table with rows and a column with a filter
When a value is chosen
Then the rows of the table stay as they were, and only the set of conditions goes outward

Covered by the component test of the header cell.

### SC-UKV-225 — clearing is shown only where there is something to clear

Given a column with no value set
When the header cell is drawn
Then it carries no clearing; and it carries one as soon as a value is set

Covered by the component test of the header cell.

### SC-UKV-226 — the styles of the filter live in the cascade layer

Given the styles file of the header cell filter
When the cascade layer audit runs
Then the file is wrapped in the sublayer of the kit's components whole

Not covered: a test has nothing to look at here — the wrapper of the layer is read from the styles
file by `npm run check:cascade-layer`, and that audit is what closes the scenario.

### SC-UKV-227 — a typed value is reported when the field is left

Given a column with a text filter and an empty set of conditions
When a value is typed into the field letter by letter
Then nothing goes outward until the field is left or Enter is pressed, and then the whole set goes
once

Covered by the component test of the header cell.

### SC-UKV-228 — a chosen value is reported at once

Given a column with a filter that is a choice from a list
When an option is chosen
Then the set of conditions goes outward without waiting for the field to be left

Covered by the component test of the header cell.

### SC-UKV-229 — an empty field says what is expected of it

Given a column with a filter and no value set
When the header cell is drawn
Then the field carries the hint of its kind, taken from the kit's dictionary

Covered by the component test of the header cell.

### SC-UKV-230 — the table draws the filter row itself

Given a table whose column configuration declares a filter on two of its three columns
When the table is told to show the filters
Then a row of filter cells stands under the header, a cell on each of the two columns, and the
third column keeps an empty cell of its own place

Covered by the component test of the table.

### SC-UKV-231 — the filter row is hidden while it is not asked for

Given a table whose column configuration declares filters
When the table is not told to show the filters
Then the filter row is absent from the markup altogether, not hidden by styling

Covered by the component test of the table.

### SC-UKV-232 — the whole set of conditions leaves the table

Given a table drawing the filter row over a set of conditions that came in by an input
When a value is set in one of the cells
Then the table reports the whole set outward, not the one condition that changed, and narrows no
rows itself

Covered by the component test of the table.

### SC-UKV-233 — the row-actions column keeps its place in the filter row

Given a table with the row actions turned on and the filters shown
When the filter row is drawn
Then the column of row actions gets a cell of its own in it, and the cells of the columns do not
shift by one

Covered by the component test of the table.

### SC-UKV-234 — the filter row is not drawn in the card view

Given a table told to show the filters on a narrow showing, where it puts cards in place of its rows
When the cards are drawn
Then the filter row is not seen at all: the card view hides it together with the rows of the table

Not covered: it cannot be closed by a test with an identifier — the hiding is done by the
component's own styles, and a component test raises the markup without them. It is checked by the
narrow frame of the story `Organisms/Table/Table › Filters`.
