# The contract of the entry module — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec.

The functions are published by the package entry, and their caller is the application that
installs it. The anchor audit follows a barrel only by an import without the `.js` ending, while an
ESM package needs that ending. So a binding to a published function reads to it as called by tests
alone. Those lines are written as not checked by a machine, each with its scenario.

- **A right is two non-empty parts of lowercase letters, digits and dashes joined by one colon.** — `projects/auth-contract/src/lib/permission.ts:PERMISSION`
- **The caller gets only the rights of the client named by the reader.** — Not checked by a machine: `callerFromClaims` is published, and the audit does not reach it. This is held by the scenario SC-AUTH-7.
- **A role of another shape is not a right and is dropped while the caller is read.** — Not checked by a machine: the filter stands in the published `callerFromClaims`. This is held by the scenario SC-AUTH-8.
- **The catalog lists every right of an admin once, and the rights are built from it.** — Not checked by a machine: `definePermissions` is published, and the audit does not reach it. This is held by the scenario SC-AUTH-9.
- **A check of several rights says whether all or any are needed.** — Not checked by a machine: `hasEveryPermission` and `hasSomePermission` are published, and the audit does not reach them. This is held by the scenario SC-AUTH-10.
