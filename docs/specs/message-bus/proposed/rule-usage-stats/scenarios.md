# Scenarios — usage of the rules over a month, the receiving side

The numbers continue the numbering of the domain of the intake and do not change after the merge.
The next free number was asked of the tree command across all branches: `SC-MB-327`.

### SC-MB-327 — a digest without the month block is taken in as before

Given a tree with a valid token sends a digest of the former edition, without the block
When the intake checks the form of the digest
Then the record of a month is created or updated, and the answer names the month, as before

Not covered: the block does not exist yet; the test is written with the intake.

### SC-MB-328 — the block lands in the record as it arrived

Given a digest with a block of three lines and a line of the own
When the intake writes the record of a month
Then the record carries the block whole, and the reading of the record gives it back unchanged

Not covered: the block does not exist yet.

### SC-MB-329 — the panel draws the table of usage from the record

Given a record of a month whose digest carries a block of three lines
When a person who has entered opens the record from the list of the digests
Then the panel shows the section of usage with three rows — the resource, the kind, the loads, the
sessions and the refusals of each — in the order the block carries

Not covered: the table does not exist yet; closed by the end-to-end suite of the admin application.

### SC-MB-330 — a record without the block draws no table

Given a record of a month whose digest has no block
When the panel of the record is opened
Then there is no section of usage, and the digest stands as a block of code as before

Not covered: the table does not exist yet.

### SC-MB-331 — an empty block draws one line about no loads

Given a record of a month whose block has the month and the day and no lines
When the panel of the record is opened
Then the section of usage shows one line saying nothing was loaded over the month, and no rows

Not covered: the table does not exist yet.

### SC-MB-332 — the line of the own stands last with the number of names

Given a block whose line of the own has more loads than any resource, and two names behind it
When the panel of the record is opened
Then the row of the own skills stands last, names two names in brackets and no name itself

Not covered: the table does not exist yet.

### SC-MB-333 — the kind is shown by a word of the domain

Given a block with a rule, a pattern and a skill of the package
When the panel of the record is opened
Then the column of the kind reads "правило", "паттерн" and "скил пакета", and no cell reads the word of
the cargo

Not covered: the table does not exist yet.

### SC-MB-334 — the month of the block is shown when it differs from the month of the record

Given a record of the month `2026-10` whose block names the month `2026-09`
When the panel of the record is opened
Then the heading of the section of usage names `2026-09` next to it

Not covered: the table does not exist yet.

### SC-MB-335 — the day counted through stands under the heading

Given a block counted through the fourteenth day of its month
When the panel of the record is opened
Then a line under the heading of the section names the first day and the fourteenth

Not covered: the table does not exist yet.

### SC-MB-336 — the table stands under the right of the digests

Given an account without the right to read the digests
When it asks for the record of a month
Then the reading refuses as before, and there is no second operation that would give the block out

Not covered: the table does not exist yet.
