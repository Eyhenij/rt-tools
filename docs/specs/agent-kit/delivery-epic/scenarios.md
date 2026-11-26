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

Given the same branch is created from the branch of the epic, or from the tip of the working copy
standing on it with a redirect after the branch name
When the guard judges it
Then it lets it through: a redirect is no base

Given the state of the task names no epic
When the guard judges the creation of a branch from the main one
Then the base is judged against the main branch, as before

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`.

### SC-AK-1164 — a base carrying the main tip lifts the refusal about the lag of the epic

Given the remote copy of the epic branch lags behind the main branch
When the guard judges the creation of a branch from that remote copy
Then it refuses, names the lag and the task branch as the place of the repairs the merge needs

Given the local epic branch has the main branch merged in, and the remote copy still lags
When the guard judges the creation of a branch from the local one
Then it lets it through: the merge is done, and the task branch carries the main tip

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`.

### SC-AK-1936 — the draft of the epic plan goes to the host from a temporary clone

Given the working copy stands on the branch of other work with edits of its own
When the command of creating is called with the argument about an epic
Then the branch of the epic is taken from the tip of the main branch in a temporary clone, committed
with the draft and pushed through the hooks of the tree; the working copy keeps its branch, edits and
settings, the clone is gone, and the printed line takes the ready branch

Given a plan written before the card, which history does not hold
When the same call goes
Then it goes to the host word for word and leaves the working copy

Given the host refuses the push
When the same call goes
Then the draft lies in the working copy, the reason is named, and the printed line takes the branch
from the main one

Covered: `projects/agent-kit/tests/task-new-epic.test.sh`.

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

### SC-AK-1226 — a merged epic is not demanded as the base of a task branch

Given a task of an epic whose branch is not in the remote, and the remote main branch has no merge
commit naming the epic
When the guard judges the creation of the task branch
Then it refuses with the former line: no branch of that epic is in the remote

Given the remote main branch carries a merge commit that names the key and the number of the epic
When the guard judges the creation of the task branch
Then it does not refuse over the missing epic branch; a merge naming another epic that shares the
first digits of the number does not count

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`.

### SC-AK-1203 — a chain base of the same epic is lawful

Given a task of an epic, and the base named is the branch of the task below, whose history carries
the epic branch
When the guard judges the opening of the request, and the audit reads the open request
Then neither refuses over the base

Given the base named carries no epic branch in its history, or belongs to a task outside the epic
When the guard judges the opening, and the audit reads the open request
Then the guard refuses and names the epic branch, and the audit names the request

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`, `projects/agent-kit/tests/checks-board-epic-base.test.sh`.

### SC-AK-1937 — five misses of the call are refused for a task of an epic too

Given a task of an epic and a task outside one, each with every condition of delivery met
When a request opens with no number in its title, with a foreign number, with its author as the
reviewer or without the demanded section of the body
Then every one of them is refused with its reason, and a request without a miss passes

Given the same task of the epic
When a draft opens into a base the pipeline does not wake for, or the branch of the epic has moved
ahead and the title carries no number
Then the draft is refused, and one refusal names both the branch of the epic and the title

Covered: `projects/agent-kit/tests/delivery-epic-classes.test.sh`.

### SC-AK-1256 — a draft on a base the pipeline does not wake for is refused

Given the pipeline file narrows its `pull_request` trigger to a list of branches
When a request opens with `--draft` or `-d` into a base outside the list, a branch of its `push`
section included
Then the guard refuses and names the base, the file, its branches and the way out

Covered: `projects/agent-kit/tests/git-guards-draft-base.test.sh`.

### SC-AK-1257 — a draft where a run comes, and a request that is no draft, are not judged

Given the same pipeline file
When a draft opens into a listed branch, into a branch its pattern covers or with no base named, or
a request opens without a draft, with `--draft=false` or with the word in its title
Then the draft condition stays silent

Covered: `projects/agent-kit/tests/git-guards-draft-base.test.sh`.

### SC-AK-1258 — the list is read from the tree, and what cannot be read is not judged

Given the inline form of the branch list
When a draft opens into a base outside and inside it
Then the first is refused and the second is not. A trigger without a branch filter, a
`pull_request_target` trigger, a missing pipeline file and a tree without the setting are not judged

Covered: `projects/agent-kit/tests/git-guards-draft-base.test.sh`.

### SC-AK-1986 — the line of work outside an epic is read on its own place

Given an open task whose body holds the words of work outside an epic inside a sentence
When the work queue audit runs
Then the task is named as naming no epic, with `--single` among the ways; the same words as a line of
their own keep the audit silent

Given the line in a fence, in a comment, with a placeholder, with no words, or broken by a newline
When the line is read
Then there is none

Covered: `projects/agent-kit/tests/checks-board-epic-base.test.sh`, `projects/agent-kit/tests/single-task.test.sh`.

### SC-AK-1988 — `--single` is refused before the card, in one order

Given a neighbour flag, no slug, no draft, an unanswered grill, no line of the count, a count that is
not a number, two lines, a count of two, a body naming an epic, an open epic of the copy
When `task:new --single` is called
Then each is refused by its own words before the card, and at a count of two the refusal names `--epic`
even where the body and the copy name an epic

Given the words of `--single` as the reason of `--outside-epic`, with another letter case, with a tail on
the next line, or as a line of the body
When the command is called
Then no card is created; neither is it by `--single` over a body that stands outside an epic by another word

Covered: `projects/agent-kit/tests/single-task.test.sh`.

### SC-AK-1989 — the only task of a grill is created from the main branch

Given a draft that counts one task, by the Russian line or by the English one
When `task:new --single` is called
Then the body carries the line of work outside an epic, the printed branch grows from the main branch
and the draft becomes the folder of the branch

Given the row of the copy names a closed epic or a plain task
When the same call goes
Then the task is created

Covered: `projects/agent-kit/tests/single-task.test.sh`.

### SC-AK-1990 — a card that already stands gets the line

Given a card outside an epic whose folder, or whose draft, counts one task
When `task-new-single` is called with its number
Then the line is added after its body and the branch is printed from the main one; the row of the copy
naming this very task does not hold the call

Given the draft, and after it a second card with the same slug
When the same call goes
Then the draft becomes the folder of the first branch, and the second card is refused: there is no grill

Given a card under an epic, the card of an epic, a closed card, a count of two, a card that already stands
outside one
When the same call goes
Then the body stays as it was

Covered: `projects/agent-kit/tests/single-task.test.sh`.

### SC-AK-1991 — the branch of the only task of a grill grows from the main branch

Given a card whose line is written by `--single`
When its branch is created from the main branch, from a named branch of another task, from the tip of
the working copy, from a hash of that tip, from a quoted name and from another branch of the same task
Then the first and the last pass, the rest are refused with the ready call from the main branch and with
the epic for a task that needs those commits

Given work outside an epic by the owner's word
When its branch is created from a branch of another task
Then it is judged as before

Covered: `projects/agent-kit/tests/guard-epic-base.test.sh`.
