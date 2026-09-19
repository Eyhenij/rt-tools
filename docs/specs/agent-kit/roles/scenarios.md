# Scenarios — the roles, the skills, the blanks and the declarations the package ships

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1136 — every role declares its name and its tools

Given the roles of the package
When their headers are read
Then each names itself and the tools it is allowed

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.

### SC-AK-1137 — a role description says when it is called

Given the roles of the package
When their descriptions are read
Then each names the case it is called in

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.

### SC-AK-1138 — a role that writes no files declares no writing tools

Given a role whose description says it writes no files
When its declared tools are read
Then none of them writes

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.

### SC-AK-1139 — a skill without a law declares no law

Given the skills of the package that stand under no law
When their headers are read
Then none declares a law

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.

### SC-AK-1140 — a skill without a law wears neither kind of the ladder

Given the skills of the package that stand under no law
When their headers are read
Then none declares itself a rule or a pattern

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.

### SC-AK-1141 — a command declares what it does and what it takes

Given the commands of the package
When their headers are read
Then each carries the description and the hint about the argument

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.

### SC-AK-1142 — a blank carries places for filling

Given the blanks of the package
When their text is read
Then each carries at least one place in angle brackets

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.

### SC-AK-1143 — a blank of a task folder carries no layout header of its own

Given the blank of a task folder as it lies in the package sources
When its first line is read
Then it is not the header of the layout

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.

### SC-AK-1144 — a declaration of the tree reads as data

Given the declarations of the tree
When they are read
Then each is data the layout and the guards read alike

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.

### SC-AK-1145 — the entry into the specs answers zero for all four kinds

Given every role, skill, command, blank and declaration the package ships
When the entry into the specs is asked by its name
Then the exit code is zero and this spec is named

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.

### SC-AK-1146 — the measure of the uncovered shows zero

Given the whole of what the package ships
When the entry into the specs is called without a name
Then the list is empty

Covered: `projects/agent-kit/tests/roles-kind.test.sh`.
