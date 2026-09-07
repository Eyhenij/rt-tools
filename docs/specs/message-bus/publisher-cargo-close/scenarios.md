# Scenarios — the closing of a record of the cargo by the publisher of an edition

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason.

### SC-MB-269 — the publisher closes a record of a foreign tree

Given a record of a proposal from a neighbour tree lies in the intake in the state "new"
When the publisher who entered the intake calls the closing with a transition into "fixed and not
released" and with a way of the fix
Then the record moves, the way of the fix is kept at it, and the answer names it as moved

Covered: `libs/message-bus-api/cargo-state/feature/src/lib/cargo-close.controller.spec.ts`,
`libs/message-bus-common/src/lib/cargo-close-move.spec.ts`.

### SC-MB-270 — a token of a tree does not open the closing

Given the call of the closing is signed by a token of a tree, not by the entry of a person
When it comes to the intake
Then the operation refuses with the code "an entry is needed": the closing has one way of introducing
oneself — the entry

Covered: `libs/message-bus-api/cargo-state/feature/src/lib/cargo-close.controller.spec.ts`.

### SC-MB-271 — the closing goes only over the two last steps

Given the record of the neighbour lies in the state "new"
When the publisher calls the closing with a transition into "in progress"
Then the row is refused: "in progress" means work taken by the tree and is put only by it

Covered: `libs/message-bus-api/cargo-state/feature/src/lib/cargo-close.controller.spec.ts`,
`libs/message-bus-common/src/lib/cargo-close-move.spec.ts`.

### SC-MB-272 — a transition into the release without a version is refused row by row

Given the publisher calls the closing with a transition into "released" and without a version of the
edition
When the bundle is taken apart
Then the row is refused with the reason "there is no version of the release", and the neighbouring rows
of the bundle are moved

Covered: `libs/message-bus-api/cargo-state/feature/src/lib/cargo-close.controller.spec.ts`.

### SC-MB-273 — a record closed by the publisher is visible as closed by the publisher

Given the publisher closed a record of a foreign tree
When the list is read by the same reading the tree takes its cargo by
Then the sign of the closing by a publisher is visible at the record: the sender otherwise reads the
state as their own mark

Covered: `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.spec.ts`,
`libs/message-bus-api/cargo-state/feature/src/lib/cargo-close.controller.spec.ts`.

### SC-MB-274 — the right of a tree to its own record is not cancelled by the closing

Given the publisher closed a record of the tree into "fixed and not released"
When the tree itself calls the edit of its record into "released" by its token
Then the edit passes: the second way is created next to the first, not instead of it

Covered: `libs/message-bus-api/cargo-state/feature/src/lib/cargo-close.controller.spec.ts`.

### SC-MB-275 — the closing names in the journal who closed and whose trees these are

Given the publisher closed a record of a foreign tree
When the journal of the intake is read
Then the row names whoever entered, the number of the moved ones and the signs of the trees — without
the keys and the texts of the records

Covered: `libs/message-bus-api/cargo-state/feature/src/lib/cargo-close.controller.spec.ts`.

### SC-MB-276 — a state outside the two last steps is refused by the command before the network

Given the publisher calls the command of the closing with the state "in progress"
When the command takes the arguments apart
Then it refuses, names what the closing is done by, and does not go to the intake at all

Covered: `projects/agent-kit/tests/cargo-close.test.sh`.

### SC-MB-277 — a call without records is refused by the command before the network

Given the publisher calls the command of the closing having named not a single record
When the command takes the arguments apart
Then it refuses and names by which argument a record is named and where its sign is taken from

Covered: `projects/agent-kit/tests/cargo-close.test.sh`.

### SC-MB-278 — a dry run shows the gathered bundle and knocks nowhere

Given the publisher calls the closing with the argument of a dry run
When the command gathers the bundle
Then it prints what would have gone away, declares the dry run by the first line and does not enter the
intake

Covered: `projects/agent-kit/tests/cargo-close.test.sh`.

### SC-MB-279 — without a pair of an account of the service the command refuses before the network

Given the pair of an account of the service is neither in a file nor in the environment
When the publisher calls the closing
Then the command refuses and says that the pair lies outside the tree

Covered: `projects/agent-kit/tests/cargo-close.test.sh`.

### SC-MB-280 — a row refused by the intake is printed and gives a non-zero code

Given the intake answered with a count with one refused row
When the command takes the answer apart
Then it prints the sign of the record and the reason in words, and the exit code is non-zero

Covered: `projects/agent-kit/tests/cargo-close.test.sh`.
