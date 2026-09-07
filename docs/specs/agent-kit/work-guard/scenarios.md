# Scenarios — the guards of the progress of the work

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain, and the numbers were not recounted at the move into the subdomain: the number ties the
scenario to the test title.

### SC-AK-288 — the state is not declared, and an artefact lifts no refusal

Given a task folder with a plan, and there is no line of the state in the progress of the work
When application code is edited
Then the guard refuses the edit: what is judged is the declared transition, not the presence of files

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-289 — a state before a stage is refused with the mandatory action

Given the state `замысел-записан` is declared in the progress of the work
When application code is edited
Then the guard refuses the edit and names the mandatory action of this state

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-290 — in the state of a stage in progress the edit passes

Given the state `этап-идёт` is declared in the progress of the work
When application code is edited
Then the guard lets it through

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-291 — an edit by the remarks in handed-in work passes

Given the state `работа-отдана` is declared in the progress of the work
When application code is edited
Then the guard lets it through: a run is sometimes red and a review carries remarks, and the fix goes
into the same branch

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-292 — the state of closed work is refused

Given the state `влито` is declared in the progress of the work
When application code is edited
Then the guard refuses the edit: the work has ended, and an edit of code begins with a new task

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-293 — a name outside the list does not count as a state

Given a word that is not in the list of the states is declared in the progress of the work
When application code is edited
Then the guard refuses the edit: a word outside the list says nothing about the entry, the exit or
the mandatory action

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-294 — the bypass of the agreement lifts no requirement about the state

Given the line about unchanged behaviour stands in the plan, and the state declared is one before
the transition
When application code is edited
Then the guard refuses the edit: the bypass lifts the requirement of the agreement, not the
requirement to reach the editing of code

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-295 — a folder without a progress of the work lets no edit through

Given a task folder with a plan, and there is no progress of the work in it at all
When application code is edited
Then the guard refuses the edit and names the file the state is declared in

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-742 — a plan without an agreement is not judged by the guard of the progress of the work

Given the plan lies there and names no agreement about the product
When application code is edited
Then the guard of the progress of the work lets the edit through: the agreement is the requirement of
a neighbouring guard, and the tree has the right to remove one of the two without losing the second

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-908 — the keys of the task folder are read under the English name on a par with the Russian

Given the progress of the work names the state by the line "- **State:** `этап-идёт`", and the plan
names the agreement by the line "**Draft:**" or the unchanged behaviour by the line "**Behaviour:**
unchanged — the reason" When application code is edited Then both guards judge the folder the same as
a folder with Russian keys: a state outside the editing of code is refused, an English agreement is
accepted

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`,
`projects/agent-kit/tests/task-flow-draft-guard.test.sh`.

### SC-AK-743 — the guard of the agreement stays silent where there is no plan

Given there is no task folder with a plan in the branch
When application code is edited
Then the guard of the agreement lets the edit through: the refusal about the plan is printed by the
guard whose requirement it is, and a second refusal about the same would call to fix one thing twice

Covered: `projects/agent-kit/tests/task-flow-draft-guard.test.sh`.

### SC-AK-744 — the agreement is asked of a shell command too

Given the plan names no agreement, and the code is written by a shell command
When the guard of the agreement takes the call apart
Then the edit is refused: both doors are closed the same, otherwise the requirement is lifted by
changing the way of writing

Covered: `projects/agent-kit/tests/task-flow-draft-guard.test.sh`.

### SC-AK-529 — an edit after the folder is taken apart passes

Given the task folder is removed by a commit of this branch, and there is no plan on the disk any
more
When application code is edited
Then the guard lets it through: the tidying stands before the opening of the request, and an edit
after it is an edit by the remarks of the review; demanding a plan for it would mean locking the
branch by its own order

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-530 — removing the folder without a commit does not mean handed-in work

Given the task folder is removed in the working tree, but the removal is not committed
When application code is edited
Then the guard refuses: the sign is taken from the history of the branch, not from the disk

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-665 — a task folder only in the working tree lets no edit through

Given a full task folder lies in the branch — the plan and the declared state — but it was never put
into the history of the branch
When application code is edited
Then the guard refuses: the sign of handed-in work is taken from the history, and with an
uncommitted folder the refusal would come at the opening of the request, when there is nothing left
to fix

### SC-AK-666 — the refusal names the command it is lifted by

Given the same branch with an uncommitted task folder
When the guard refuses
Then the command of putting the folder into the history stands in the refusal, not a mere pointing at
the miss

### SC-AK-667 — a folder put into the history lets the edit through

Given the same task folder, committed into the branch
When application code is edited
Then the guard stays silent: the requirement is lifted by that very commit

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.
