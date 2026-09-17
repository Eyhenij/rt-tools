# Scenarios — the delivery guards and the push gate

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain, and
the numbers were not recounted on the move into the subdomain: the number ties a scenario to a test
title.

### SC-AK-83 — a PR from a diverged branch is refused

Given the main branch went ahead, and it is not in the task branch
When a PR is opened
Then the opening is refused, the number of commits of the divergence is named and the way to lift it

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-84 — a merged main branch lets a PR through

Given the main branch is merged into the task branch
When a PR is opened
Then the guard lets the call through silently

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-112 — a created check stands in the push gate

Given a package check and a set of guard scenarios are laid out in the tree
When the list of what is run before the push is assembled
Then both stand in it on a par with the build, the lint and the specs

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-113 — the gate does not call a check that is not in the tree

Given a package check is not laid out into this tree
When the list of what is run before the push is assembled
Then it is not in the list: a refusal "there is no such file" would read as a breakage of the machine

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-114 — an undeclared pipeline step refuses the push

Given the pipeline file holds a step that has neither a set line nor an exception in the setting of
the tree
When the check of the completeness of the gate set runs
Then it names that step and gives back a non-zero code, and the guard refuses the push

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-115 — a declared exception refuses no push

Given a pipeline step is declared in the setting of the tree as an exception with a reason
When the check of the completeness of the gate set runs
Then the step does not count as a divergence, and the check stays silent about it

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-116 — an exception without a reason stays a divergence

Given a pipeline step is declared an exception, and the reason at it is empty
When the check of the completeness of the gate set runs
Then it demands a reason and gives back a non-zero code: an empty reason is no exception

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-117 — a declared line that is not in the set turns red

Given a pipeline step is declared closed by a line, and `rt_push_checks` does not print that line
When the check of the completeness of the gate set runs
Then it names the step and the missing line: a declaration without execution is the same hole

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-118 — a tree without a pipeline file gets no audit

Given there is no pipeline file in the tree
When the check of the completeness of the gate set runs
Then it stays silent and gives back a zero code: falling where there is no pipeline refuses work

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-198 — the work queue does without the token of the machine record

Given the tree named no token of a machine record
When the column of a task is moved
Then the board is edited by the account the hosting client is signed in under

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-256 — the layout audit stands in the push gate set

Given the layout setting lies in the tree
When the default prints the push gate set
Then the layout audit stands first in it: it refuses within seconds, and before a divergence passed

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-257 — a tree without a layout setting gets no audit

Given there is no layout setting in the tree
When the default prints the push gate set
Then there is no audit in it: without the setting no package is installed and nobody to call

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-258 — a red check of the set refuses the push

Given the gate set holds a check that falls
When a push call goes
Then the guard refuses it and names the fallen line: red from here is checked already on production

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-259 — a push with keys between the command and the subcommand is recognised by the checks guard

Given the push goes with the keys `-c` between `git` and `push` — a credentials helper and a request
header
When the command comes to the checks guard
Then it recognises it by two signs at once and runs the set: such a command is not caught by the
substring "git push", and uncaught it goes into the remote tree without touching a single check

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-366 — the delivery conditions that did not come together are named by one refusal

Given the branch has two conditions failing at once — a PR title without a number and an unmerged
main branch
When a PR is opened
Then the opening is refused by one refusal, and both conditions stand in it, each with its own action

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-370 — creating a branch refuses a base without the tip of main

Given the main branch went ahead, and the working copy stands on the former base
When a branch with a task number is created
Then the creation is refused, the lag is named as a number of commits and what to take a fresh base
with; a branch without a task number is not judged this way

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-371 — a branch from a fresh base is created

Given the tip of the main branch lies in the base of the new branch
When a branch with a task number is created
Then the guard lets the call through silently

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-372 — creating a branch refuses a foreign mail of the commits

Given the tree declared the mail of a machine record, and the working copy signs commits with
another
When a branch with a task number is created
Then the creation is refused, and the refusal holds both mails — the found one and the declared one

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-373 — a matching and an undeclared mail hold up no branch creation

Given the mail of the working copy matched the declared one, or the tree declared no mail at all
When a branch with a task number is created
Then the guard lets the call through silently

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-386 — a branch from a named fresh base is created

Given the tip of the main branch lies in the base named by the command
When a branch with a task number is created — by checkout or by switch
Then the guard lets the call through silently

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-387 — a branch from a lagging base is refused

Given the base named by the command is yesterday's, and the working copy stands on a lagging tip
When a branch with a task number is created
Then the creation is refused and how to take a fresh base is named; an unknown base is not judged

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-388 — a lagging local reference refuses the branch creation

Given the remote tip of the main branch went ahead of the local reference to it
When a branch with a task number is created
Then the creation is refused: both sides of the divergence and how to pull the reference are named

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-389 — silence of the poll holds up no branch creation

Given the remote tip of the main branch could not be asked
When a branch with a task number is created
Then the guard lets the call through silently

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-405 — a branch switch and a push in one command are refused

Given one command holds a move to an existing branch and a push
When the command comes to the push gate guard
Then it is refused whole, and the refusal names the lawful move: first switch, then push by a
separate command — the gate set is run by the former branch, not by the one going to the hosting

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-406 — creating a new branch in the same command refuses no push

Given one command holds the creation of a new branch and a push to it
When the command comes to the push gate guard
Then it passes: for a fresh branch the tree is the same as it was, and the set is run by it

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-407 — a dry push judges no shape of the command

Given one command holds a move to an existing branch and a dry push
When the command comes to the push gate guard
Then it passes: a dry push sends nothing, and there is nothing to judge about which tree it passed by

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-408 — a postponed edit does not count as a push

Given the command puts the edit into the stash of the working copy, and the word of the push stands
in it as a separate one
When the command comes to the delivery guards
Then the gate set is not run and the signature is not asked: such a command sends nothing outward. A
real push standing in the same command next to the stash is recognised as before

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-411 — a restart of a step without a read journal is refused

Given the journal of the fallen step was not read during the turn
When a call to restart that step goes
Then the call is refused, and the refusal names the step and the command the journal is read by

Covered: `projects/agent-kit/tests/rerun-guard.test.sh`.

### SC-AK-412 — a restart after a read journal passes

Given during the same turn the journal of this step was read
When a restart call goes
Then it passes: the guard judges the order, not the cause of the fall

Covered: `projects/agent-kit/tests/rerun-guard.test.sh`.

### SC-AK-413 — the journal of a neighbouring step opens no restart

Given during the turn the journal of another step was read
When a call to restart ours goes
Then it is refused: the jobs stand side by side in the run list, and a foreign journal says nothing

Covered: `projects/agent-kit/tests/rerun-guard.test.sh`.

### SC-AK-414 — a restart without a number of a step is not judged

Given there is no number of a step in the restart command
When the command comes to the guard
Then it passes: a restart of the last fallen one is called without a number too, and a guessed step
refuses at random

Covered: `projects/agent-kit/tests/rerun-guard.test.sh`.

### SC-AK-685 — a body without the section about the remaining step refuses opening a request

Given the tree named the sample of the mandatory section, and the body of the request does not carry
it
When a call to open a request goes
Then the guard refuses it and names what the body is missing and what that section stands there for

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-686 — about a body with the section it stays silent

Given the tree named the sample, and the heading of the section stands in the body
When the same call goes
Then the guard says nothing about the section; a tree that named no sample is not judged at all

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-687 — a body passed as a file is judged on a par with an argument of the command

Given the body of the request lies in a file named by an argument of the call
When the guard judges the opening of the request
Then it reads the file from the disk and demands the section as in a body passed as a string

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-707 — a live task in the reason of an exception passes

Given a pipeline step is declared an exception whose reason names a created task
When the check of the completeness of the push gate set runs
Then it leaves with success

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-708 — a dead number in the reason makes the deferral endless

Given the reason of the exception names a task that is not in the work queue
When the check of the completeness of the push gate set runs
Then it refuses and names the number: a deferral with a term and one without look the same

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-709 — a silent work queue does not take the check down

Given the tree has no work queue or it refused — no network, no access
When the check of the completeness of the push gate set runs
Then it judges as before and stays silent about the liveness of the tasks

Covered: `projects/agent-kit/tests/checks-push-gate.test.sh`.

### SC-AK-763 — the number of the title is taken out by the same shape that sets it

Given the tree overrode the shape of the request title with its own
When the delivery guard checks the number of the title against the number of the branch
Then it takes the number out of the part of the title the shape itself recognised: a second
expression of its own knew only the package shape, gave back an empty number at an overridden one,
and the check was silently not performed at all, looking as if it came together

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-820 — what the gate set is narrower than the pipeline set by

Given the tree has a green set before the push and this is the first push of the session
When the guard runs the set
Then it says that the gate set is not the pipeline set, and names where to see it whole

Given a second push goes in the same session
When the guard runs the set
Then it stays silent about the difference: on every push the line would repeat dozens of times

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-821 — the final set before the push is visible in the state report

Given the tree declared the set by the default of the profile
When the state report is called
Then it prints the set whole, one command per line

Given an override of the tree cut a check out of the default
When the state report is called
Then the cut-out line is named apart — as what the default printed and what did not get into the set

Given there is no profile of the tree at all
When the state report is called
Then the section names the reason instead of staying silent

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-830 — the number of the branch is taken out by the profile, not by the guard

Given the branch is named `feat/88-add-select-button` — a shape lawful by the profile of the tree
When the delivery guard takes apart the creation of this branch
Then it gets the task number from the profile and judges the branch on a par with `RT-88-slug`: an
expression of its own knew one prefix and never fired on such a branch

Given a request is opened from the branch `feat/88-add-select-button`, the title holding 89
When the guard checks the number of the title against the number of the branch
Then it refuses the divergence: before, the block was skipped silently and looked agreed

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-832 — the verb of a command is looked for in its position, not as a substring

Given a commit is called with keys between the command and the verb, and next to it goes a read of
the history with the word `commit` in an argument
When the main branch guard takes the command apart
Then the commit is refused, and the read of the history and the search are let through: a bare
substring search missed both ways

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-835 — the push gate writes an observation line for every outcome of its own

Given the gate set is green, red or not found
When the push goes
Then a line of the kind `push-gate` with the outcome — `green`, `red` or `no-checks` — lands in the
observations, and silence stops meaning both "everything is green" and "there was nothing to check"

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-851 — red through the fault of the check itself has a move of its own

Given the gate set is red
When the guard forbids the push
Then the refusal names three options: fix what is named; fix the check itself — take the refusals
apart by name and show the analysis to the owner; or bring the owner the price of a bypass. The known
list is named as a wrong option at that: it keeps the accepted, not the results of a broken check

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-872 — creating a branch is recognised with a flag between the verb and -b too

Given the branch is created by the line `git checkout -q -b` or `git switch -q -c`
When it is taken apart by the delivery, request conflict, push set and waiting guards and the
watchman of the turn exits
Then each judges it as the shape without the flag: the name and the base are checked, a conflict with
an open request is refused, the push of a new branch passes, the work taken is noticed

Covered: `projects/agent-kit/tests/git-guards.test.sh`,
`projects/agent-kit/tests/git-guard-conflict.test.sh`,
`projects/agent-kit/tests/git-guard-push-tests.test.sh`,
`projects/agent-kit/tests/waiting-turn-guard.test.sh`,
`projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-884 — a branch name with the tail -b in the base argument does not count as a request body

Given the body of the request lies in a file, and the base is named by a branch whose name ends with
`-b`
When the guard judges the opening of the request — with arguments after the name and with the name as
the last word
Then it reads the body from the file and stays silent about the section; a file without it refuses

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

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
