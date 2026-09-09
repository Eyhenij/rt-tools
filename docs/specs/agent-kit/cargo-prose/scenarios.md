# Scenarios — the wording of the cargo leaving for the intake

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-954 — a record with officialese does not leave

Given a proposal whose text carries a word the wording check bans
When the send gathers the batch
Then the record does not leave, and the line about it names the file, the line and the finding

Covered: `projects/agent-kit/tests/cargo-prose.test.sh`.

### SC-AK-955 — a clean record leaves next to a refused one

Given two proposals: one clean, one with findings
When the send gathers the batch
Then the clean one leaves, and the refusal names only the second

Covered: `projects/agent-kit/tests/cargo-prose.test.sh`.

### SC-AK-956 — an incident analysis is judged by the same check

Given an analysis whose text carries a sentence longer than the limit
When the send gathers the batch
Then the analysis does not leave, and the line about it names the file and the finding

Covered: `projects/agent-kit/tests/cargo-prose.test.sh`.

### SC-AK-957 — a refusal of a record does not fail the send

Given every proposal of the batch is refused by its wording
When the send goes through
Then the command ends with zero, the summary leaves, and the output says that no proposals left

Covered: `projects/agent-kit/tests/cargo-prose.test.sh`.

### SC-AK-958 — a tree without the wording check sends as before

Given the tree has no wording check laid out
When the send gathers the batch
Then every record leaves, and the output names that the wording was not judged

Covered: `projects/agent-kit/tests/cargo-prose.test.sh`.

### SC-AK-959 — a refused record keeps no mark of a send

Given a record was refused by its wording
When the send is over
Then the file of the record carries no mark of the send, and a repeated send offers it again

Covered: `projects/agent-kit/tests/cargo-prose.test.sh`.
