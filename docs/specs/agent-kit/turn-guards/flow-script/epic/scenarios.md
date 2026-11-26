# Scenarios: the end of an epic

The scenarios of exits 11, 12 and 13 of the engine and of exit 2 outside an epic. They carry the prefix
`SC-AK` of the domain, and the moved ones keep the numbers they had in
`docs/specs/agent-kit/turn-guards/flow-script/`.

### SC-AK-1984 — exit 2 is met outside an epic by the line of the card

Given a card of the branch without an epic and with a line of work outside one, of any words
When exit 2 is measured
Then it is met; without the line, or with an epic named in the card, it is not, whatever was kept

Given a silent hosting
When exit 2 is measured
Then the answer kept for the branch stands, and without one the hosting is named silent

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1985 — exit 2 is met outside an epic by the only draft

Given a branch without a number and one draft that counts one task, by either line
When exit 2 is measured
Then it is met; a count of two, no line, two lines, two drafts or an open epic of the copy do not meet it

Given the row of the copy names a closed epic or a plain task
When the same exit is measured
Then it is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1388 — exit 11 is met by the branch of the next unblocked task

Given the next task with a branch on the server, without one, and an epic with no next task
When exit 11 is measured
Then the first and the last meet it, the second does not

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1793 — a row with the old mark «шаг владельца» is an ordinary row

Given a next task whose row still carries «шаг владельца», and a branch of the task after it
When exit 11 is measured
Then it is not met: the task with the old mark is not passed over

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1390 — a deferred task is passed over

Given a deferred task before a task with a local branch
When exit 11 is measured
Then it is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1741 — exit 11 asks a branch of every task ahead

Given a task ahead with a branch on the server before two tasks without one, and the same tasks all with branches
When exit 11 is measured
Then the first is unmet and the second met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1755 — a task with a merged PR is not ahead for exit 11

Given an unmarked task with a merged PR and no branch left, and the same task with no PR
When exit 11 is measured
Then the first is met and the second unmet

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1391 — exit 12 is met when the merged tasks are marked

Given merged tasks marked merged, and a task neither merged nor marked
When exit 12 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1752 — the task merged last counts by its merged PR, whatever its row

Given the last row merged on the hosting with no mark, and a middle row merged last with no mark while the rows below are marked
When exit 12 is measured
Then it is met in both cases, and when a chain is merged top-down with the last row unmarked
And a row with no mark merged before another task is unmet

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1753 — a mark on a task with an open PR keeps exit 12 unmet

Given a row marked «влито» whose branch has an open PR, or a PR closed unmerged
When exit 12 is measured
Then it is unmet
And a marked row with no PR in view of the hosting counts
And a chain marked ahead by its upper branch and merged in one go meets the exit

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1754 — a fresh branch with no PR is no merge

Given the branch of the last task taken from the epic tip, with no PR of its own, its row left in work or marked «влито»
When exit 12 is measured
Then it is unmet in both cases

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1742 — exit 12 waits for every task not deferred to be merged

Given every merged task marked merged and a task not deferred left unmerged
When exit 12 is measured
Then it is unmet

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1392 — exit 13 measures the commits of a cascade

Given a task whose PR went into the branch of the previous task, with both tips in the epic branch, and with the previous one not yet there
When exit 13 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1393 — exit 13 is met when the PR of the epic is merged

Given every tip in the main branch with the PR of the epic merged, and every tip in the epic branch without a PR of the epic
When exit 13 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1394 — deferred tasks do not count for exit 13

Given a deferred task whose tip lies nowhere next to tasks that landed
When exit 13 is measured
Then it is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1466 — a task branch removed after its merge gives its tip from the PR

Given a task without a local or server branch whose merged PR names its head
When exit 13 is measured
Then the tip comes from the PR and the exit is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.
