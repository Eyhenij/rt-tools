# Scenarios — the quarantine of a disputable record

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-MB-309 — a record goes into the quarantine from "new" and carries the reason

Given a record of a tree stands in "new" and the row of the edit names the quarantine and the reason
When the edit goes
Then the record is moved, and the reason lies at it

Covered: `libs/message-bus-common/src/lib/cargo-quarantine-note.spec.ts`.

### SC-MB-310 — a move into the quarantine without a reason is refused row by row

Given the row names the quarantine and carries no reason
When the edit goes
Then the row is refused with the reason of the refusal named, and the record stays in its state

Covered: `libs/message-bus-common/src/lib/cargo-quarantine-note.spec.ts`.

### SC-MB-311 — a reason with a move that is not into the quarantine is refused

Given the row names another state and carries a reason
When the edit goes
Then the row is refused: a reason at a record outside the quarantine reads as one of it

Covered: `libs/message-bus-common/src/lib/cargo-quarantine-note.spec.ts`.

### SC-MB-312 — forward out of the quarantine the record does not go

Given a record stands in the quarantine and the row names "fixed" or "released"
When the transition is judged
Then it is refused by the order: forward would mean fixing what was decided not to fix

Covered: `libs/message-bus-common/src/lib/cargo-state-move.spec.ts`.

### SC-MB-313 — from the quarantine a record goes back into "new"

Given a record stands in the quarantine and the row names "new"
When the transition is judged
Then it is allowed: by the return the record becomes work again

Covered: `libs/message-bus-common/src/lib/cargo-state-move.spec.ts`.

### SC-MB-314 — into the quarantine a record goes from "new" alone

Given a record stands in "in work", in "fixed" or in "released" and the row names the quarantine
When the transition is judged
Then it is refused: from "in work" the return into "new" stands for that, and the rest would
rewrite the past

Covered: `libs/message-bus-common/src/lib/cargo-state-move.spec.ts`.

### SC-MB-315 — the publisher of an edition does not put the quarantine

Given the publisher closes a record of a neighbouring tree and names the quarantine
When the transition is judged
Then it is refused: the quarantine speaks of work a tree conducts

Covered: `libs/message-bus-common/src/lib/cargo-close-move.spec.ts`.

### SC-MB-316 — the word of the state is shown in the language of the person

Given a record of the quarantine stands in the list
When the row is drawn
Then the state column carries the word of the language of the person, not the machine string

Covered: `libs/message-bus-admin/common/core/util/src/lib/cargo-state.logic.spec.ts`.
