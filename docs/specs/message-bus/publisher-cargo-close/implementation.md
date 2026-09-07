# The closing of a record of the cargo by a publisher — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The closing of a record is closed by the entry of a person, not by the token of a tree.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-close.controller.ts:CargoCloseController` — the mark `@SessionOperation()`; the choice of the way of introducing oneself is held by `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard`
- **The publisher closes a record of any tree, including their own.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:closeProposals` — there is no filter by tree in the query; at the analyses the same is in `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:closePostmortems`
- **The closing goes only forward and only over the two last steps.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoCloseMove`
- **The way of the fix is mandatory at the transition into "fixed and not released", the version at the transition into "released".** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.lines.ts:cargoLinesValueDenials` — the decision is shared with the edit by a tree
- **The closing names who made it.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoCloseData` — the sign lands in the record; the column is declared in `prisma/schema.prisma:closedByPublisher`
- **The right of a tree of its own is not cancelled by the closing.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.module.ts:CargoStateModule` — both operations are declared next to each other; the edit by a tree is not touched
- **The closing arrives as a bundle.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody` — the taking apart of the list of the rows is shared with the edit by a tree
- **A row of the closing names the record by the sign from the reading, not by the key of the sender.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:closeProposals` — the record is looked for by the field `id`; the sign is printed by `tools/cargo-pull.mjs:listLine`
- **A row of the bundle is refused on its own.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.lines.ts:cargoLinesTally`
- **The answer names the number of the moved ones, the number of the ones that already stood there and the refused rows.** — `libs/message-bus-api/cargo-state/api/src/lib/cargo-close.response.ts:ICargoCloseResponse`

## What else is worth knowing when reading the code

- The taking apart of the bundle, the decision about the attached values and the count by rows are
  shared between the closing and the edit by a tree —
  `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.lines.ts`. Exactly three things differ:
  what the operation is closed by, by which order the transition is judged and by which sign the record
  is looked for.
- The command of the launch line is `tools/cargo-close.mjs`, it is called by `npm run cargo:close`. It
  takes the entry by the same pair of an account of the service as the reading of the cargo: one person
  reads and closes.
- The screen of the list shows the sign as an addition to the state, not as a column of its own:
  `libs/message-bus-admin/proposals/feature/list/src/lib/admin-proposals-list.component.html`.
