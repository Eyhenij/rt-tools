# Scenarios — the epic in the delivery guards

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain, and
the numbers were not recounted on the move into the subdomain: the number ties a scenario to a test
title.

### SC-AK-991 — the epic of a task is declared by one shape, and it is read in one place

Given a task body naming its epic — by the number with a hash or with the task key, in either case
of the word about the task
When the declaration is read
Then the number of the epic comes back

Given the body only mentions a number — in reasoning, in a quoted refusal, in the list of what the
work does not do
When the same reading goes
Then no epic comes back: a mention is not a declaration

Given the same words inside a sentence — «в работу взяты семь задач эпика #1870» — and, apart, a
declaration as an item of a list — `- Вторая задача эпика #7, идёт после первой`
When the same reading goes
Then the first gives no epic and the second gives its number: a declaration opens its line, and a
list marker or an ordinal before it is allowed

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`.

### SC-AK-992 — the state of a task carries the number of its epic

Given a task whose body declares an epic
When the work queue helper is asked for the state of the task
Then the state carries the number of the epic as a field of its own

Given a task outside an epic
When the same asking goes
Then the field is empty, and that is not a refusal

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`.

### SC-AK-993 — the branch of a task is taken from the branch of its epic

Given a task whose state names an epic, and the branch of that epic is in the remote
When the guard judges the creation of a branch from the main one
Then it refuses and names the branch of the epic

Given the same branch is created from the branch of the epic
When the guard judges it
Then it lets it through

Given the state of the task names no epic
When the guard judges the creation of a branch from the main one
Then the base is judged against the main branch, as before

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`.

### SC-AK-1164 — a base carrying the main tip lifts the refusal about the lag of the epic

Given the remote copy of the epic branch lags behind the main branch
When the guard judges the creation of a branch from that remote copy
Then it refuses and names the lag

Given the local epic branch has the main branch merged in, and the remote copy still lags
When the guard judges the creation of a branch from the local one
Then it lets it through: the merge is done, and the task branch carries the main tip

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`.

### SC-AK-994 — the request of a task of an epic goes into the branch of the epic

Given a task whose state names an epic, and the branch of that epic is in the remote
When the guard judges the opening of a request with the main branch as its base
Then it refuses and names the branch of the epic

Given the base named is the branch of the epic
When the guard judges the same opening
Then it does not refuse over the base

Given the state of the task names no epic
When the guard judges the opening with the main branch as its base
Then the base is not judged at all

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`.

### SC-AK-995 — the request of an epic waits for the folders of its tasks to be taken apart

Given the branch of a card carrying the label of an epic, and a folder of a task is committed into
that branch
When the guard judges the opening of a request into the main branch
Then it refuses and names the folder

Given the folder is taken apart by a commit of the branch
When the guard judges the same opening
Then it does not refuse over the folders

Given the card carries no label of an epic
When the guard judges the same opening with a folder in the branch
Then this condition is not judged at all

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`.
