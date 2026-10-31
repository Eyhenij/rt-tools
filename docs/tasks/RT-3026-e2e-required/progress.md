# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Guard
- **Done:** the law is committed; the guard and its 11 scenarios are written and green
- **Next step:** commit the guard
- **Uncommitted:** the guard, its scenarios, this progress
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Append the section to the law override and lay it out
- [x] 1.2 Commit the law
- [x] 2.1 Write the guard on opening a PR
- [x] 2.2 Write the guard scenarios
- [>] 2.3 Commit the guard

## Decisions along the way

- **The scenarios lie in `tools/tests/`, not under the hooks directory.** The tree's own sets live
  there and run by `bash tools/tests/run.sh`; a hooks test directory does not exist. Affected stage
  of the plan: 2 — its command is `bash tools/tests/e2e-coverage-guard.test.sh`.

## Sessions

### 2026-10-31

- The law section appended and laid out by `pnpm run agent-kit:sync`: one file laid out.
