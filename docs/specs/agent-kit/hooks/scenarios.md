# Scenarios — the guards and the checks the package ships

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1036 — every guard declares its event in the header

Given the guards of the package
When their headers are read
Then each carries the line naming the event, and the tools where the event takes them

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.

### SC-AK-1037 — a helper declares no event and says so

Given a file of the guards directory without the event line
When its first lines are read
Then they say it is not a guard and who calls it

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.

### SC-AK-1038 — a guard fails in favour of the work

Given the guards of the package
When their text is read
Then each names the failing in favour of the work

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.

### SC-AK-1039 — a refusal names the lawful moves

Given a guard that refuses
When the refusal text is read
Then it names the two lawful moves

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.

### SC-AK-1040 — a refusal names what exactly is wrong

Given a guard that refuses
When the refusal text is read
Then it names the miss, not only the ban

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.

### SC-AK-1041 — a guard reads the input from the agent

Given the guards of the package
When their text is read
Then each takes the input by the shared reading, not from the process

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.

### SC-AK-1042 — a check answers with an exit code

Given the checks of the package
When their text is read
Then each leaves by a named exit code

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.

### SC-AK-1043 — a check with nothing to read says so

Given a check whose subject the tree does not have
When it is run
Then it answers zero and names why

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.

### SC-AK-1044 — every guard and every check has a suite

Given the guards and the checks of the package
When the suites naming each of them are looked for
Then none is left without one

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.

### SC-AK-1045 — the signs a check judges by lie apart from it

Given the sets of signs of the package
When they are read
Then each is data, and the check reads it rather than holding it

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.

### SC-AK-1046 — the entry into the specs answers zero for both kinds

Given every guard and every check the package ships
When the entry into the specs is asked by its name
Then the exit code is zero and this spec is named

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.
