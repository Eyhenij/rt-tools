# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — Publish without the archive
- **Done:** `npm pack` removed from the six scripts; the dry run lists 1012 files, none of them `.tgz`
- **Next step:** take the folder apart and open the PR
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Remove `npm pack` from the six `packagr:*` scripts
- [>] 1.2 Check the packed file list of the built second kit

## Sessions

### 2026-10-10

- Task RT-2753, branch from the main branch.
- `grep -c 'npm pack' package.json` prints `0`; `npm publish --dry-run` in the built second kit
  lists no `.tgz`.
