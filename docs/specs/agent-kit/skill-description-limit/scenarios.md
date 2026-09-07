# Scenarios — the length limit of a rule description

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared across the domain:
the numbers continue the through count `SC-AK`.

### SC-AK-635 — a description longer than the limit is named by name

Given a skill has a description of four hundred characters at a limit of three hundred
When the check of the length of the descriptions is called
Then it refuses and names the name of the skill together with the number of characters

Covered: `projects/agent-kit/tests/checks-descriptions.test.sh`.

### SC-AK-636 — a description within the limit does not trouble the check

Given a skill has a description of two hundred characters
When the check of the length of the descriptions is called
Then it stays silent about this skill

Covered: `projects/agent-kit/tests/checks-descriptions.test.sh`.

### SC-AK-637 — accepted debt does not drop the check

Given the description is longer than the limit, and the name of the skill stands in the list of the
accepted debt
When the check of the length of the descriptions is called
Then it does not refuse, but names this skill as a line of debt

Covered: `projects/agent-kit/tests/checks-descriptions.test.sh`.

### SC-AK-638 — a skill without a description is of no interest to the check

Given a skill has no description field in its header
When the check of the length of the descriptions is called
Then it passes it silently

Covered: `projects/agent-kit/tests/checks-descriptions.test.sh`.
