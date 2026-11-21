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

### SC-AK-1087 — a walk that met nothing refuses instead of answering zero

Given the settings name a family of libs the tree holds no directory for, and a root that holds not
a single lib
When the check of the lib layout runs
Then it refuses and names the family and the roots walked; a tree with libs gets neither refusal —
a green answer without a lib read is indistinguishable from an honest zero, and the check stands in
the push gate

Covered: `projects/agent-kit/tests/checks-lib-layers.test.sh`.

### SC-AK-1131 — the backend families are walked as a list

Given the settings name the backend families by a list of two, and each family holds a domain
When the check of the lib layout runs
Then both domains are named in its answer, a single name names the domain of its own family alone,
and the empty-walk refusal lists the root of every family of the list

Covered: `projects/agent-kit/tests/checks-lib-layers.test.sh`.

## On saved data

The cases below run on saved data: the cut of the record of 13.11.2026 and the hosting answers
recorded under the machine token. Every expected answer was read on the full record or on the real
host at the same moment.

### SC-AK-1606 — the owner's consent of 13.11 is read as the owner's word

Given the cut of the record of 13.11.2026
When the owner's menu answers and their last word are read
Then six menu answers are read, the answers of 01:46 and 01:51 among them, and the last word is
«Отложить RT-3272»

Covered: `projects/agent-kit/tests/real-record.test.sh`.

### SC-AK-1607 — a foreign answer is no word of the owner

Given the cut of the record of 13.11.2026
When the owner's typed messages and the plan approvals are read
Then no hook message counts as typed by the owner, and neither a menu answer about the cause nor an
approval without the plan name approves a plan; the reminder measure counts 198 typed messages,
a pasted and a queued message included and a wrapper of the harness left out

Covered: `projects/agent-kit/tests/real-record.test.sh`.

### SC-AK-1608 — the calls of the roles are counted as in the record

Given the cut of the record of 13.11.2026
When the calls of product-strategist and goal-critic are counted
Then twelve calls of each are counted

Covered: `projects/agent-kit/tests/real-record.test.sh`.

### SC-AK-1609 — the reminders and refusals are counted as in the record

Given the cut of the record of 13.11.2026
When the reminder measure reads the owner's nudges, the typed messages, the refusals and the dead
ends
Then it counts 5 nudges of 1998 calls, 198 typed messages by the shared rule of the owner's words,
203 refusals with 129 at the exit, and 2 dead ends — the numbers of the full record of the same day

Covered: `projects/agent-kit/tests/real-record.test.sh`.

### SC-AK-1598 — the facts of the hooks at the moments of the consent

Given the cut of the record up to 01:46:30 and up to 01:51:11 on 13.11.2026
When `facts.sh` is asked the window fill, the exam, the entry from a handover and the record paths
Then each fact answers as on the full record at that moment

Covered: `projects/agent-kit/tests/real-record.test.sh`.

### SC-AK-1604 — the session source of the engine reads the record as it is

Given the cut of the record of 13.11.2026
When `session.mjs` reads the refusals, the blocked calls, the menus and the tool calls
Then each count is the one read on the full record

Covered: `projects/agent-kit/tests/real-record.test.sh`.

### SC-AK-1601 — the guards that read the record decide on the cut as on the record

Given the cut of the record up to 05:40 on 13.11.2026
When the rerun, exam, conscience and handoff-entry guards judge a call
Then each decides as on the full record at that moment: the rerun of an unread run and the lifting
of a draft without an exam are refused, the end of the turn and the edit pass

Covered: `projects/agent-kit/tests/real-hooks.test.sh`.

### SC-AK-1602 — the role metrics read the verdict from a real role record

Given the cuts of two goal-critic records of 13.11.2026
When the role metrics read the verdict of each at the end of the role
Then the report «цель достигнута частично» counts as a refusal, and the report opening with a table
counts as passed — the table header word is read as the verdict, a finding of this work

Covered: `projects/agent-kit/tests/real-hooks.test.sh`.

### SC-AK-1599 — the recorded answers answer by the kind of the token

Given the hosting answers recorded under the machine token
When the replay is asked under the machine token and without a token
Then the machine token gets the recorded login and the recorded refusal of the review fields, and a
call without a token gets the refusal

Covered: `projects/agent-kit/tests/checks-board-real.test.sh`.

### SC-AK-1600 — the hosting readers print on the recorded answers what they printed on the host

Given the hosting answers recorded under the machine token
When the work queue audit, the epic table and the last run of the main branch run on them
Then the epic table and the last run print what they printed on the real host, and the audit names
the lag of production by its number, prints its last line and ends with the recorded code, without
a stack

Covered: `projects/agent-kit/tests/checks-board-real.test.sh`.

### SC-AK-1603 — the engine reads the PRs of a branch on the recorded answers

Given the hosting answers recorded with the reads of `host.mjs`
When the engine reads the PRs of a merged branch and the merged PRs
Then it reads what it read on the host, and both reads are recorded unsigned

Covered: `projects/agent-kit/tests/checks-board-real.test.sh`.

### SC-AK-1605 — a reader of real data without a run on saved data is refused

Given a fixture reader of the record and a fixture reader of the hosting no suite runs on saved data
When the hooks-kind suite judges the readers
Then both are named in the refusal, and every reader of the package counts as run

Covered: `projects/agent-kit/tests/hooks-kind.test.sh`.
