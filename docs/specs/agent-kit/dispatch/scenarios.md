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

### SC-AK-1205 — the record of the dispatcher carries the declared time limit

Given a guard of an event declares a time limit in its header, and the setting has no record of
that event
When the layout runs
Then the new record of the dispatcher carries that limit

Given a standing record of the dispatcher carries a smaller limit, or none
When the layout runs
Then the record stays byte for byte the same, and the layout names it with both limits

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-700 — the refusal of a real watchman reaches the output of the dispatcher

Given a record of a turn that edited a file on a branch whose scenario is not over
When the dispatcher is called on the closing event
Then the refusal decision arrives parsable, the argument in it is from the watchman, and the exit code
is zero

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-701 — a turn without a write gets no refusal from the dispatcher

Given a record of a turn that only read, with a prompt that does not push the work on
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

### SC-AK-1223 — a refusal at code 2 goes to the error stream too

Given a branch refuses a call with the code 2, by either of its streams
When the dispatcher gives the refusal to the agent
Then the text goes to the error stream as well as the output stream: at code 2 the agent is given
only the error stream, and a refusal printed only to the output stream arrives empty; a successful
branch writes nothing to the error stream

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-881 — a ban of a call at a zero code is recognised on a par with a block

Given a branch answers with a decision to ban the call and leaves with zero, and one more branch
stands after it
When the dispatcher walks the branches of the event
Then it stops at the ban and gives it back whole: glued with the output of the neighbouring branch,
such an answer does not parse at all, and the refusal vanishes

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-1080 — an entry is written only for the dispatcher that lies on disk

Given the tree did not take the dispatcher, and it is not on disk
When the layout runs
Then no entry is written into the setting: a setting calling a file that is not there looks working
from the outside, and an entry removed by hand used to come back on the very next layout

Given the dispatcher lies on disk
When the layout runs
Then the entry is written as before

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-1268 — the answers of several branches are one object

Given two branches answer one event: one prints an object with a context, the other a plain text
When the dispatcher gives the answers out
Then the agent gets one object whose context holds both texts, the plain text after the context, and
whose event name is the event

Given two branches answer one event, each with a system message
When the dispatcher gives the answers out
Then the system message holds both texts joined by an empty line

Given one branch answers, with no trailing line break or with two
When the dispatcher gives the answer out
Then it arrives byte for byte with one trailing line break

Given two branches answer the end of a turn
When the dispatcher gives the answers out
Then both texts go into the system message, and there is no context field

Covered: `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-1766 — a layout into an empty tree leaves both records of the model checks

Given a tree with no settings and the real catalogue of the package
When `init` and `sync` run
Then the settings hold two records of the kind `agent`, one of the event `Stop` and one of `PreToolUse`
And the check of the layout right after ends with code 0

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-1767 — a standing record is neither doubled nor rewritten

Given a record that calls the file of a model check, with other words than the declared ones
When the layout runs
Then the settings stay byte for byte as they were and no second record is added

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-1768 — a record that differs from the declaration is named

Given a record with other words, another pattern and a limit below the declared one
When the layout is checked
Then each difference is named with both sides, and the check refuses
And a record that differs only by the model or by a higher limit is named and not refused

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-1769 — a file with no record refuses the check and names the way out

Given the file of a model check on disk and settings without a record that calls it
When the layout is checked
Then the check refuses, names the file and the `skip` id of the resource

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-1770 — a tree without the dispatcher gets both records

Given a tree that did not take the dispatcher and holds the files of both model checks
When the records are written
Then both records stand in the settings and the dispatcher is still not on disk

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-1771 — settings that do not parse are not edited

Given settings with a comment that JSON does not read
When the layout runs
Then the settings are unchanged
And the layout names that no record of the model checks was written and prints the ready records

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-1772 — a check in the skip list gets no record

Given the config puts the check of the menu into `skip`
When the layout runs
Then the check of the turn end gets its record and the check of the menu does not

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-1773 — the records built from the real declarations equal the records of this tree

Given the declarations of the two real files of the package
When the records are built from them
Then each equals the record of this tree in the words, the model, the limit and the pattern

Covered: `projects/agent-kit/src/lib/hooks-map.spec.ts`.

### SC-AK-1774 — a moved directory of hooks is named in the record

Given a tree whose directory of hooks is moved by the layout of the config
When the layout runs
Then the record names the file of the check at the moved path
And the layout names that the script guards are not connected: the dispatcher is not on disk

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.
