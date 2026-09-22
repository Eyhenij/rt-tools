# Scenarios — a resource without a spec does not leave with the package

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1147 — full coverage lets the push through

Given every resource of the package is spoken of by a spec
When the check is run
Then it answers zero and says the coverage is whole

Covered: `projects/agent-kit/tests/spec-coverage.test.sh`.

### SC-AK-1148 — an uncovered resource refuses the push

Given a resource no spec speaks of
When the check is run
Then it refuses, names the count and prints the resource

Covered: `projects/agent-kit/tests/spec-coverage.test.sh`.

### SC-AK-1149 — a tree without package directories is not judged

Given a tree that declared no directories of package sources
When the check is run
Then it answers zero and says there is nothing to judge

Covered: `projects/agent-kit/tests/spec-coverage.test.sh`.

### SC-AK-1150 — a tree without the entry into the specs is not judged

Given the entry into the specs is not laid out in the tree
When the check is run
Then it answers zero and says there is nothing to ask with

Covered: `projects/agent-kit/tests/spec-coverage.test.sh`.
