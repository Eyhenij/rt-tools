# The edit of a state by a tree — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The state is edited by the tree with its token, not by a person who entered.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`
- **The edit is closed by the token of a tree on a par with the intake of the cargo.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`
- **A tree edits only its own records.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`
- **A record of another tree answers the same way as one that was not found.** — `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates`
- **Both kinds of records of the cargo are edited — an incident analysis and a proposal.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`
- **The edit of a state touches no other fields of a record.** — `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates`
- **The edit does not change the recognising of a record.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:moveProposalStates`
- **The sign of a proposal is counted by one way on both sides.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:moveProposalStates`
- **The states come as an enumeration, not as a string in the body of the request.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`
- **A step goes forward to the neighbouring one: new, in progress, ready, released.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`
- **Backwards goes one return — from "in progress" into "new".** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`
- **An edit into the same state does not count as a transition and does not refuse the row.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`
- **The transition is judged by what lies in the storage.** — `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates`
- **The edit arrives as a bundle: one operation for several rows.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`
- **The records of both kinds go by one bundle.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`
- **A row of the bundle is refused on its own, it does not carry the bundle away whole.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`
- **The answer names how many records were moved, how many already stood in the named state and which rows were refused.** — `libs/message-bus-api/cargo-state/api/src/lib/cargo-state.response.ts:ICargoStateResponse`
- **A refused row is named by its place in the bundle, by the key and by the reason.** — `libs/message-bus-api/cargo-state/api/src/lib/cargo-state.response.ts:ICargoStateResponse`
- **A bundle without rows is refused by the form.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`
- **A refused row is written into the journal of the intake on a par with a refusal of an operation.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`
- **A row of the journal carries the kind of the record, the sign of the tree and the reason.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`
- **The text of the fix arrives as a field of a row of the edit of the state, not by an operation of its own.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:ICargoStateLine`
- **A transition into "fixed and not released" without a text of the fix is refused row by row.** — `libs/message-bus-common/src/lib/cargo-fix-note.ts:cargoFixNoteFault`
- **The text of the fix is accepted only with a row moving into "fixed and not released".** — `libs/message-bus-common/src/lib/cargo-fix-note.ts:cargoFixNoteFault`
- **A row with a text lands also when the state is not changed by it.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateWrites`
- **An empty text does not count as a text.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`
- **The way of the fix is created for both kinds of records of the cargo.** — `prisma/schema.prisma:Postmortem`
- **A refused row writes neither the state nor the text.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`
- **A second arrival of the text of the fix overwrites the former one.** — `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates`
- **The text of the fix has no length limit of its own.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`
- **A refusal by a missing text lands as a row of the journal on a par with the former reasons.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`
- **The version of the release arrives as a field of a row of the edit of the state, not by an operation of its own.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:ICargoStateLine`
- **A transition into "released" without a version of the release is refused row by row.** — `libs/message-bus-common/src/lib/cargo-release-version.ts:cargoReleaseVersionFault`
- **The version of the release is accepted only with a row moving into "released".** — `libs/message-bus-common/src/lib/cargo-release-version.ts:cargoReleaseVersionFault`
- **A row with a version lands also when the state is not changed by it.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateWrites`
- **An empty version does not count as a version.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`
- **The intake does not take the form of the version apart.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`
- **The version of the release has a length limit of its own, and it is short.** — `libs/message-bus-common/src/lib/cargo-release-version.ts:CARGO_RELEASE_VERSION_LIMIT`
- **The version of the release is created for both kinds of records of the cargo.** — `prisma/schema.prisma:Postmortem`
- **A refused row writes neither the state nor the version.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`
- **A second arrival of the version overwrites the former one.** — `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates`
- **A row carrying the text of the fix and the version of the release at once is refused.** — `libs/message-bus-common/src/lib/cargo-release-version.ts:cargoReleaseVersionFault`
- **A refusal by a missing version lands as a row of the journal on a par with the former reasons.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController`

The operation lives in a home of its own for both kinds — `libs/message-bus-api/cargo-state/`: the
bundle carries both kinds at once, and the domain of one of them does not see the libs of the other.
The order of the transitions stands next to the enumeration of the states, in
`libs/message-bus-common/src/lib/`. The refusal by the form is put together by
`libs/message-bus-common/src/lib/cargo-fault.ts`, the mark of the access is carried by
`libs/message-bus-api/access/util/src/lib/operation-access.ts`, the tree is got out of the token by
`libs/message-bus-api/trees/util`, the row of the journal is written by
`libs/message-bus-api/observability`. The command of the launch line a tree calls the edit by lies in
`projects/agent-kit`: it is a part of the rules layer, not of the intake, and the agreement about it is
in the spec of that domain.

The way of the fix lies in the same place: the fourth field of a row is taken apart by the taking apart
of the bundle, and the fitness of the text at a transition is judged by a decision of its own —
`libs/message-bus-common/src/lib/cargo-fix-note.ts` — standing next to the decision about the transition
and called before the walk to the storage. Nine of its scenarios — from `SC-MB-181` to `SC-MB-188` and
`SC-MB-192` — are closed by the spec of the operation, by the spec of the taking apart of the bundle and
by the spec of the decision itself: `libs/message-bus-common/src/lib/cargo-fix-note.spec.ts`. The tenth,
`SC-MB-191`, lives in the package of the rules next to the command of the mark:
`projects/agent-kit/tests/cargo-mark.test.sh`.

Seven scenarios out of the nine former ones are closed by the spec of the operation —
`libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.spec.ts` — and by the spec of
the taking apart of the bundle next to it:
`libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.spec.ts`.

Two are closed partially. `SC-MB-174`: the return from "in progress" into "new" is checked by a call of
the decision about the transition in `libs/message-bus-common/src/lib/cargo-state-move.spec.ts`, and by
the way of a request it does not pass. `SC-MB-178`: the declaration of the operation is checked — it is
closed by a token of a tree — and the refusal itself without a token is passed by the spec of the guard
of the entry.

The version of the release lies where everything else does: the fifth field of a row is taken apart by
the taking apart of the bundle, and the limit of its length and its fitness at a transition are judged by
a decision of its own in the common lib — next to the decision about the transition. Thirteen of its
scenarios — from `SC-MB-193` to `SC-MB-204` and `SC-MB-207` — are closed by the spec of the decision, by
the spec of the taking apart of the bundle and by a spec of the operation of its own about the version of
the release; the last of the thirteen lives in the package of the rules, next to the command of the mark.
