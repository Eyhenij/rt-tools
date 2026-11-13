# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — the receiver reads all trees without a tree
- **Done:** the cause found on message-bus.dev, the agreement and the plan written
- **Next step:** the usage queries take an optional tree
- **Uncommitted:** the task folder, the agreement, the assignment row
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 The usage queries take an optional tree and filter by it only when named
- [ ] 1.2 The controller passes no tree for an empty sign and refuses an unknown one
- [ ] 1.3 The controller spec covers SC-MB-428 and SC-MB-429
- [ ] 2.1 The digest store reads with an empty tree
- [ ] 2.2 The end-to-end spec opens the section without a tree and sees rows (SC-MB-430)
- [ ] 3.1 The agreement merges into the usage spec
- [ ] 3.2 The task folder is taken apart into the archive
- [ ] 3.3 The PR opens

## Decisions along the way

## Sessions

### 2026-11-13

- On message-bus.dev `/api/usage` without `tree` answered `404 treeUnknown`, with `tree` — 200.
