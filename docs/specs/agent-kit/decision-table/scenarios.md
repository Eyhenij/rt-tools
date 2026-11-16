# Scenarios — the decision table of the package hooks

A promise of the subdomain and the test that closes it. A number is issued once and never reused.

### SC-AK-1562 — every hook of the package is named by the table

Given the hooks directory of the package
When the coverage mode reads the table
Then every deciding hook has rows, every helper and model hook carries its mark, and the count of
deciding hooks equals the count of hooks with rows

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1563 — a row matches the decision of its hook

Given a row with its fixture
When the conform mode runs the hook on that fixture
Then the hook gives the decision of the row, and its refusal text holds the words of the row; a
helper subscribed to an event refuses nothing on a plain command

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1564 — no state of an area is dead

Given the rows of one area
When the walk looks for a state where every action of the area is denied
Then it finds none in the real table, and a sample table with such a state prints `dead 1`

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1565 — a refusal names a move allowed in the same state

Given a refusal row and its named move
When another row of the area denies that move where the refusal fires
Then the walk counts the pair as unnamed: the real table prints `unnamed 0`, a sample table with
such a pair prints `unnamed 1`

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1566 — a state where only the question is allowed is counted apart

Given an area that names its question action
When every other action of a state is denied and no row denies the question
Then the walk prints that state in the `ask-only` count, and a sample table prints `ask-only 1`

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1567 — every derived chain has its scenario

Given the pairs where a refusal names the action another row of the area denies
When the chains mode reads this file
Then every pair stands here by its id in backticks, and in each pair the two conditions do not meet

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1568 — an edit of any hook selects the test of the table

Given a change of one hook of the package
When the suite selection reads the changed paths
Then the test of the table is among the selected files

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1569 — a hook removed by the tree is named, not refused

Given a tree that does not lay out one hook of the package
When the coverage mode reads the table against that tree
Then it prints the hook as skipped by the tree and exits zero

Covered: `projects/agent-kit/tests/decision-table.test.sh`.
