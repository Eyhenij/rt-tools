# Scenarios — the dispatcher of the agent's events

The prefix is shared with the domain: `SC-AK`. The numbers run through the whole domain and are never
issued twice.

### SC-AK-522 — the dispatcher calls only the branches of its own event

Given the guard directory holds branches of two events
When the dispatcher is called with the name of one of them
Then only its branches are called

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-523 — the call sample is checked by the dispatcher, not by the agent

Given a branch declared a call sample in its header
When a call of another tool arrives
Then the branch is not called; the sample is checked against the name whole, not against a piece, and
a branch without a sample is called on any call

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-524 — the refusal of a branch reaches the agent by code and output

Given one of the branches of the event refuses
When the dispatcher called it
Then its code and output are given to the agent as they are, and the branches after it are not called

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-525 — a broken dispatcher does not jam the work

Given the event is not named by an argument, the input is empty or does not parse
When the dispatcher is called
Then it leaves with zero

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-577 — all the event declarations of a file are read

Given a branch declared two events by lines of its own — a tool call and the end of a turn
When the dispatcher is called with each of them
Then the branch is called on both, and on its own event once

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-578 — a refusal in the output of a branch stops the walk

Given two branches of the event print a refusal decision and leave with zero
When the dispatcher walks them
Then the first refusal reaches the agent as a whole object, and the branches after it are not called

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-05 — a laid-out guard reaches the setting of the agent

Given a clean tree after `init` and `sync`
When it is checked whether anybody will call the laid-out guards
Then a record about them is in the setting of the agent, or the package says what is missing and what
to insert

### SC-AK-682 — an event that is not in the setting stands there as a record to the dispatcher

Given a tree whose agent setting calls the dispatcher on not one event of the taken guards
When the layout runs
Then for every such event a record appears in the setting calling the dispatcher by its name

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-683 — a foreign record stays in place: one's own is appended next to it

Given the setting holds a record of the tree on the same event and sections the package knows nothing
about
When the layout appends its own declaration
Then the foreign record and the foreign sections stand as they stood, and the record to the dispatcher
stands right after them

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-684 — the layout does not edit a setting that cannot be parsed

Given the setting holds what JSON does not read — the comments of the tree, for instance
When the layout runs
Then the file stays byte for byte the same, and the package says it made no record

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-700 — the refusal of a real watchman reaches the output of the dispatcher

Given a record of a turn on which the watchman of the exits refuses the closing
When the dispatcher is called on the closing event
Then the refusal decision arrives parsable, the argument in it is from the watchman, and the exit code
is zero

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-701 — a turn with work gets no refusal from the dispatcher

Given a record of a turn in which a file was edited
When the dispatcher is called on the closing event
Then there is no refusal decision in the output

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-833 — a branch that left with a non-zero code and silently is named by name

Given a branch of the event leaves with a non-zero code and prints nothing
When the dispatcher calls it
Then it prints the name of its file and the exit code and gives that code back as it is: it mutes the
error output of the branches, and without the name nothing speaks about a broken branch

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-856 — an event without a tool name checks the kind of the start

Given a branch declared the event of entering a session and a sample of kinds of the start
When an entry with a kind of the start from that sample arrives
Then the branch is called; with a kind that is not in the sample it is not called, and on a tool call
the subject of the check stays the tool name

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-860 — a refusal said into the error stream reaches the executor

Given a branch forbade the call and said the reason into the error stream, printing nothing by its
output
When the dispatcher gives its refusal to the agent
Then the reason is given in words, and the name of the branch is named only where both streams are
empty; on a successful move the error stream does not go outward

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-881 — a ban of a call at a zero code is recognised on a par with a block

Given a branch answers with a decision to ban the call and leaves with zero, and one more branch
stands after it
When the dispatcher walks the branches of the event
Then it stops at the ban and gives it back whole: glued with the output of the neighbouring branch,
such an answer does not parse at all, and the refusal vanishes

Covered: `projects/agent-kit/tests/dispatch.test.sh`.
