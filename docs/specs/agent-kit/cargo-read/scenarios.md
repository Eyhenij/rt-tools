# Scenarios — reading the cargo from the intake

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain: the
number ties a scenario to a test title and is never issued twice.

### SC-AK-560 — an unknown kind is refused before the network

Given the kind of the cargo is named by a word outside the set
When the reading command is called
Then it refuses, lists the known kinds and goes to no network

Covered: `projects/agent-kit/tests/cargo-pull.test.sh`.

### SC-AK-561 — without the pair of the account the call does not go

Given there is no pair of the service account on the disk
When the reading command is called
Then it refuses and names where the pair lies and what the record itself is created by

Covered: `projects/agent-kit/tests/cargo-pull.test.sh`.

### SC-AK-562 — a sign-in that was not accepted differs from cargo that was not read

Given the intake did not accept the pair
When the reading command is called
Then the refusal names the answer of the intake and its number, not an empty list

Covered: `projects/agent-kit/tests/cargo-pull.test.sh`.

### SC-AK-563 — next to a record the key of its mark is printed

Given a proposal lies in the intake
When the cargo is read
Then the line of the record carries the sign of its text — the very one it is marked by

Covered: `projects/agent-kit/tests/cargo-pull.test.sh`.

### SC-AK-564 — for an incident analysis the key is the name of the file

Given an incident analysis lies in the intake
When the cargo is read
Then the line of the record carries the name of the file and does not repeat it a second time

Covered: `projects/agent-kit/tests/cargo-pull.test.sh`.

### SC-AK-565 — the filter leaves in the request line, it is not sifted after the reading

Given a state and a tree are named
When the reading command is called
Then both leave into the request to the intake

Covered: `projects/agent-kit/tests/cargo-pull.test.sh`.

### SC-AK-566 — an overview without texts speaks of its own incompleteness

Given it is named that the texts are not to be read through
When the cargo is read
Then the proposals have no keys, and a line of the output names the reason

Covered: `projects/agent-kit/tests/cargo-pull.test.sh`.

### SC-AK-567 — whole texts are printed by a separate argument

Given it is named that the texts are to be printed
When the cargo is read
Then every record comes out whole, not as its first line

Covered: `projects/agent-kit/tests/cargo-pull.test.sh`.

### SC-AK-568 — an empty selection does not count as a refusal

Given not a single record fell under the filter
When the cargo is read
Then the command answers zero and prints the count "total 0"

Covered: `projects/agent-kit/tests/cargo-pull.test.sh`.

### SC-AK-696 — the title of the article is taken from the quote of the proposal

Given a proposal whose quote of the proposed article starts with a bold title
When the pick reads the record
Then the first bold text inside the quote counts as the title, and the lines outside the quote are
not judged

Covered: `projects/agent-kit/tests/cargo-fixed.test.sh`.

### SC-AK-697 — a proposal without a quote does not fall under the pick

Given a proposal of the old shape that has no quote of an article at all
When the pick reads the record
Then the record goes into the third group and does not fall into the list of the marked

Covered: `projects/agent-kit/tests/cargo-fixed.test.sh`.

### SC-AK-698 — the title is checked against the sources by one line

Given the title of an article wrapped over two lines inside the quote
When the pick looks for it in the sources of the package
Then it is found: a line break does not count as a difference

Covered: `projects/agent-kit/tests/cargo-fixed.test.sh`.

### SC-AK-699 — the records split into three groups, and the count is named by numbers

Given three records: one with the article standing, one with it not standing and one without a quote
When the pick takes them apart
Then each falls into its own group, and only the first goes into the list of the marked

Covered: `projects/agent-kit/tests/cargo-fixed.test.sh`.

### SC-AK-745 — a record taken into work with a ready edit is picked by two signs

Given a record in the state "in work": for one the article title stands in the sources, for the
other the proposal landed in other words and the full key is named in the archive
When the pick takes apart what was taken into work
Then both fall into the list of the lagging mark, and a record without either sign does not

Covered: `projects/agent-kit/tests/cargo-fixed.test.sh`.

### SC-AK-746 — a key from the archive is judged in full, not by eight characters

Given an archive where the keys of the records are named by eight characters
When the pick gathers the keys from the archive records
Then a short one is not gathered at all, and a full one is: the mark command accepts only the full
one and answers a short one with "the tree has no such record"

Covered: `projects/agent-kit/tests/cargo-fixed.test.sh`.

### SC-AK-953 — the reason of the quarantine stands next to the record

Given a record of the cargo stands in the quarantine and carries the reason
When the cargo is read with the filter on that state
Then the reason stands next to the record — in the row of the list and in the record whole; a
record outside the quarantine prints none

Covered: `projects/agent-kit/tests/cargo-pull.test.sh`.
