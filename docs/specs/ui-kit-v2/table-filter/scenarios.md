# Scenarios — the filter in the header cell of the table

Every scenario is checked by a test, and the test is named by the number. A scenario a test does not
reach carries a `Not covered:` mark saying what closes it instead.

The numbers are issued once and are never reused: a number given to a second scenario leaves the old
reference alive and pointing at something else.

### SC-UKV-214 — the filter stands in the header cell of the column

Given a column whose settings declare a filter
When the header of the table is drawn
Then the header cell of that column carries the filter next to the column's name

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-215 — a column without filter settings carries no filter

Given a column whose settings declare no filter
When the header of the table is drawn
Then that header cell carries no filter at all

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-216 — the kind of the filter decides which part of the kit is called

Given four columns, one of each kind — text, number, a choice from a list, a date
When the header of the table is drawn
Then each cell carries the part of the kit for its kind, and no cell carries a control of its own

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-217 — the operators offered are the ones the column allows

Given a column that allows two of the operators
When the menu of the operators is opened
Then exactly those two stand in it

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-218 — a value chosen goes outward with the whole set of conditions

Given a set of conditions that already holds another column
When a value is chosen in this column
Then the set that goes outward holds both columns

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-219 — an empty value takes the column out of the set

Given a set of conditions that holds this column
When the value is cleared
Then the set that goes outward does not hold this column at all, and no empty condition stands in it

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-220 — the value that is already chosen reports nothing

Given a column whose value is set
When the same value is chosen again
Then nothing goes outward

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-221 — the operator changed with no value reports nothing

Given a column with no value set
When another operator is chosen
Then nothing goes outward

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-222 — the operator changed with a value set goes outward

Given a column whose value is set
When another operator is chosen
Then the set that goes outward holds this column with the new operator and the same value

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-223 — a date is compared in the form it is kept in

Given a column of the date kind whose value is set
When the same date is chosen again
Then nothing goes outward

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-224 — the filter narrows no rows itself

Given a table with rows and a column with a filter
When a value is chosen
Then the rows of the table stay as they were, and only the set of conditions goes outward

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-225 — clearing is shown only where there is something to clear

Given a column with no value set
When the header cell is drawn
Then it carries no clearing; and it carries one as soon as a value is set

Not covered: the cell is not written yet — the test that closes this scenario comes by stage 3
of the plan of RT-2226.

### SC-UKV-226 — the styles of the filter live in the cascade layer

Given the styles file of the header cell filter
When the cascade layer audit runs
Then the file is wrapped in the sublayer of the kit's components whole

Not covered: a test has nothing to look at here — the wrapper of the layer is read from the styles
file by `npm run check:cascade-layer`, and that audit is what closes the scenario.
