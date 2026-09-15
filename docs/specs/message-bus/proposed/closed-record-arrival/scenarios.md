# Scenarios — a record closed by the publisher stays closed on a repeated arrival

The numbers continue the numbering of the domain and do not change after the merge.

### SC-MB-323 — a repeated arrival does not bring a record closed by the publisher back into "new"

Given the analysis is closed by the publisher and stands in "fixed"
When the tree sent the same one with another text
Then the text is the one that was sent, and the state is still "fixed"

Covered: `libs/message-bus-api/postmortems/util/src/lib/postmortem-arrival.util.spec.ts`,
`libs/message-bus-api/postmortems/feature/src/lib/postmortems-intake.controller.spec.ts`.

### SC-MB-324 — a pair "sign set, state new" is put back into the closed state by the migration

Given a record carries the sign of the publisher's closing and stands in "new"
When the migration runs
Then the record with a release version stands in "released", the one without it in "fixed"

Не покрыто: a migration has no test harness in this tree; it was run over four trial rows in a
rolled-back transaction on the local database, and the rows answered as promised.
