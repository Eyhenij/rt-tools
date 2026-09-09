# Binding — the reading of its own records by a tree

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A tree reads its own records by its token, and no account is asked of it.** — **Not carried out.** Stage 2 of the task: the mark of the token stands next to `libs/message-bus-api/access/util/src/lib/operation-access.ts:OPERATION_ACCESS`
- **Whose records leave is decided by the operation, not by the request.** — **Not carried out.** Stage 2 of the task: the tree of the request is remembered by `libs/message-bus-api/trees/util/src/lib/tree-context.ts:rememberTree`
- **The answer carries the state of a record, its fix and the version of the release.** — **Not carried out.** Stage 2 of the task
- **The answer carries no records of other trees, and it says nothing about their number.** — **Not carried out.** Stage 2 of the task
- **A refused token answers the way an unknown one does.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate`
- **A tree without records answers with an empty list and a successful code.** — **Not carried out.** Stage 2 of the task

The names of this tree: the header of the token is `x-tree-token`, the intake lives in
`apps/message-bus`, and the records lie in the tables the accepting of the cargo creates.
