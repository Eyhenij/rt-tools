# The contract of the entry module — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec.

- **A right is two non-empty parts of lowercase letters, digits and dashes joined by one colon.** — `projects/auth-contract/src/lib/permission.ts:PERMISSION`
- **The caller gets only the rights of the client named by the reader.** — `projects/auth-contract/src/lib/caller.ts:callerFromClaims`
- **A role of another shape is not a right and is dropped while the caller is read.** — `projects/auth-contract/src/lib/caller.ts:callerFromClaims`
- **The catalog lists every right of an admin once, and the rights are built from it.** — `projects/auth-contract/src/lib/permission.ts:definePermissions`
- **A check of several rights says whether all or any are needed.** — `projects/auth-contract/src/lib/caller.ts:hasEveryPermission`
