# Scenarios — the handover of a session and the entry into a new one

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain, and the numbers were not recounted at the move into the subdomain: the number ties the
scenario to the test title.

### SC-AK-643 — the states written as a list the check reads

Given the map of the turn lists the states by rows of a list, not by rows of a table
When the check of the map compares it with the rule
Then the states are read: a list is a third cheaper than a table, and it is a lawful shape

Covered: `projects/agent-kit/tests/checks-turn-map.test.sh`.

### SC-AK-644 — the former shape as a table is read as before

Given the map of the turn lists the states as a table
When the check of the map compares it with the rule
Then the states are read: a tree that did not rewrite its map works as before

Covered: `projects/agent-kit/tests/checks-turn-map.test.sh`.

### SC-AK-645 — a state forgotten in the map is named by name

Given the rule declares a state that is not in the map
When the check of the map compares them both ways
Then the divergence names this state by name

Covered: `projects/agent-kit/tests/checks-turn-map.test.sh`.

### SC-AK-646 — the list of the patterns of the rule does not count as a state

Given the rule calls its patterns by rows of the same shape as the states of the map
When the check of the map reads the states of the rule
Then the patterns do not get into the states: a list is parsed only in the map

Covered: `projects/agent-kit/tests/checks-turn-map.test.sh`.

### SC-AK-436 — the handover of the past session arrives in the context after a squeeze

Given a handover written by the hook before the squeeze lies at the current branch
When the squeeze has ended and the session is launched anew
Then the text of the handover stands in the context of the session whole, and there is no need to
put it by hand

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-437 — the handover is taken by the name of the current branch

Given records at three branches lie in the directory of handovers, and the current branch is one of
them
When the session is launched
Then the record of the current branch arrives in the context, and the two foreign ones do not arrive
at all

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-438 — there is no handover, and the entry stays silent about it

Given no handover lies at the current branch
When the session is launched
Then there is not a line about the handover in the context, and the launch goes as before

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-803 — the handover is taken from the progress of the work, and a file outside the tree is the fallback way

Given the branch has a task folder, and the section "The handover of the session" stands in its
progress of the work
When the session is launched
Then the section arrives in the context whole, the entry names its place, and the file outside the
tree is not read at all

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-439 — the map of the turn arrives by the same launch as the handover

Given the resource of the map is laid out in the tree
When the session is launched after a squeeze
Then both parts of the entry stand in the context — the handover and the map — not one of them

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-440 — the map names the mandatory action of every state

Given eleven states are declared in the rule of the conduct of work
When the map has arrived in the context
Then at every state its mandatory action is named, and not a single row is empty

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-441 — the map names the four exits of a turn

Given the map has arrived in the context
When the session looks in it for what a turn ends with
Then it sees all four exits and what each of them is confirmed by

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-442 — the map is taken from the resource, not from the markup of the rule

Given the markup of the table of the states is rewritten in the laid-out rule of the conduct of work
When the session is launched
Then the map arrives as it was and whole: its text is taken from a resource of its own

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-443 — the map is shorter than the declared limit

Given a limit of the size of the map is declared
When the map has arrived in the context
Then its size is less than the limit, and the check of the tree names both numbers

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-444 — the entry is served at all four launches

Given the resource of the map is laid out and the handover at the branch lies there
When the session is launched by the first launch, by a resumption, after a squeeze and after a
clearing
Then both parts of the entry arrive in the context at each of the four, not only after a squeeze

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-445 — an unreadable handover does not refuse the launch

Given the file of the handover at the current branch is not read
When the session is launched
Then the launch passes, the map is in the context, and there is not a line about the handover

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-446 — a missing resource of the map does not refuse the launch

Given the resource of the map is not laid out in the tree
When the session is launched
Then the launch passes, the handover is in the context, and there is not a line about the map

Covered: `projects/agent-kit/tests/turn-entry-load.test.sh`.

### SC-AK-469 — the threshold of the squeeze is lower than the threshold of the stop by the margin and more

Given the tree declared both thresholds, and the declared margin stands between them
When the check of the thresholds is run
Then it passes and prints both shares as numbers

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-470 — thresholds that coincided are refused

Given the threshold of the stop and the threshold of the squeeze are declared by one and the same
number
When the check of the thresholds is run
Then it refuses and names both sides by numbers

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-471 — a threshold of the squeeze above the threshold of the stop is refused

Given the threshold of the squeeze is declared above the threshold of the stop
When the check of the thresholds is run
Then it refuses and says that the guard will fire before the squeeze

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-472 — a margin smaller than the declared one is not enough

Given the thresholds are separated, but the distance between them is smaller than the declared margin
When the check of the thresholds is run
Then it refuses and names both the distance and the demanded margin

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-473 — a tree without a declared squeeze gets no refusal

Given the threshold of the squeeze is not declared by the tree
When the check of the thresholds is run
Then it passes and stays silent about the margin

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-474 — a tree without a declared window is not judged at all

Given the size of the window of the session is not declared by the tree
When the check of the thresholds is run
Then the section stays silent whole instead of turning red at the absence

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-478 — the law names a filled window the end of a turn only without a squeeze

Given the exits of a turn are listed in the law of the conduct of work
When the article about a filled window is read
Then it says that the window ends a turn where there is no squeeze, and where one is declared the
turn goes on

Not covered: an article of a law is checked by reading — a machine has nothing to tell it from a
neighbouring one by.

### SC-AK-479 — the session passes the threshold of the window and does not drop the work

Given the session took a task and reached the threshold of the squeeze
When the threshold is passed
Then the context is squeezed, the handover is served as the entry, and the work is continued by the
same session without a remark of the owner

Not covered: it is confirmed by a live measurement of a session, not by a run — there is nothing to
run a session by.

### SC-AK-905 — the exits of a turn are read under both names

Given the map of the turn names the four exits by English names, and the rule declares the same
states
When the check of the map of the turn goes
Then it comes out even the same as at a map with Russian names of the exits

Covered: `projects/agent-kit/tests/checks-turn-map.test.sh`.
