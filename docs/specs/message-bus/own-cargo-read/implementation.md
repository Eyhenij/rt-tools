# Binding — the reading of its own records by a tree

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A tree reads its own records by its token, and no account is asked of it.** — `libs/message-bus-api/cargo-state/feature/src/lib/own-cargo-read.controller.ts:TreeOperation`
- **Whose records leave is decided by the operation, not by the request.** — `libs/message-bus-api/cargo-state/feature/src/lib/own-cargo-read.controller.ts:treeOf`
- **The answer carries the state of a record, its fix and the version of the release.** — `libs/message-bus-api/cargo-state/api/src/lib/own-cargo.response.ts:IOwnCargoRow`
- **The answer carries no records of other trees, and it says nothing about their number.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.own.queries.ts:readOwnProposals`
- **A refused token answers the way an unknown one does.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate`
- **A tree without records answers with an empty list and a successful code.** — `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.own.queries.ts:readOwnPostmortems`

The names of this tree: the header of the token is `x-tree-token`, the intake lives in
`apps/message-bus`, and the records lie in the tables the accepting of the cargo creates.
