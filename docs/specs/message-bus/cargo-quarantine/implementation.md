# The quarantine of a disputable record — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The quarantine is a state of a record, not a directory on a disk.** — `libs/message-bus-common/src/lib/cargo-state.ts:ECargoState`
- **A record goes into the quarantine from "new" alone.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`
- **From the quarantine a record goes back into "new" alone.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`
- **The move into the quarantine carries the reason, and without it the row is refused.** — `libs/message-bus-common/src/lib/cargo-quarantine-note.ts:cargoQuarantineNoteFault`
- **The reason is accepted only with a row moving into the quarantine.** — `libs/message-bus-common/src/lib/cargo-quarantine-note.ts:cargoQuarantineNoteFault`
- **The reason travels by the same road as the text of the fix — a field of a row of the edit.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:QUARANTINE_NOTE_FIELD` — the sending side is `tools/cargo-mark.mjs:QUARANTINE_FLAG`
- **The publisher of an edition does not put the quarantine.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoCloseMove`
- **The list of the quarantine is read by the same read the cargo is taken by, filtered by the state.** — `tools/cargo-pull.mjs:query`

The names of this tree: the reason lies in the column `quarantineNote` of both tables of the cargo,
the migration that added it is `prisma/migrations/20260909120000_cargo_quarantine/migration.sql`,
the word of the state for a person is `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts`,
and the reading command is `npm run cargo:pull`.

The refusal of a row the tree reads by its name: the reason of the refusal is assembled by
`libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.lines.ts:cargoLinesAsked`, and the
names themselves stand in
`libs/message-bus-api/cargo-state/api/src/lib/cargo-state.response.ts:ECargoStateDenial`.
