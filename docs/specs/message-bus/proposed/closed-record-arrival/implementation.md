# The binding — a record closed by the publisher stays closed on a repeated arrival

- **A repeated arrival does not bring a record closed by the publisher back into "new".** — `libs/message-bus-api/postmortems/util/src/lib/postmortem-arrival.util.ts:postmortemArrivalUpdate`
- **A record found with the sign set and the state "new" is put back into the closed state by a migration.** — `prisma/migrations/20260915120000_closed_record_state_repair/migration.sql:closedByPublisher`

- **Scenario** — Test
- **`SC-MB-323`** — `libs/message-bus-api/postmortems/util/src/lib/postmortem-arrival.util.spec.ts`, `libs/message-bus-api/postmortems/feature/src/lib/postmortems-intake.controller.spec.ts`
- **`SC-MB-324`** — not covered: a migration has no test harness in this tree
