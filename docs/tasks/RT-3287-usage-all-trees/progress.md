# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — closing
- **Done:** the receiver reads all trees without a tree; the digest is drawn without a tree; the
  agreement merged into the usage spec
- **Next step:** take the task folder apart into the archive
- **Uncommitted:** none after the code commit
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The usage queries take an optional tree and filter by it only when named
- [x] 1.2 The controller passes no tree for an empty sign and refuses an unknown one
- [x] 1.3 The controller spec covers SC-MB-428 and SC-MB-429
- [x] 2.1 The digest store reads with an empty tree
- [x] 2.2 The end-to-end spec opens the section without a tree and sees rows (SC-MB-430)
- [x] 3.1 The agreement merges into the usage spec
- [>] 3.2 The task folder is taken apart into the archive
- [ ] 3.3 The PR opens

## Decisions along the way

- **The template condition on the tree is removed too.** The first run of SC-MB-430 showed the
  table and no digest: besides the store, the list template drew the digest only with a tree named.
  Affected stage of the plan: 2.
- **The stand ran on its own ports.** The default database port of the stand was taken by a
  neighbouring copy; the run went on `E2E_DB_PORT=55464` and ports 3390, 4390, 4391.

## Sessions

### 2026-11-13

- On message-bus.dev `/api/usage` without `tree` answered `404 treeUnknown`, with `tree` — 200.
