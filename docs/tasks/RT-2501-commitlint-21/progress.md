# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — the upgrade, done
- **Done:** 21.2.3 installed; `commitlint` verdicts match the ones before the upgrade
- **Next step:** take the folder apart and open the PR
- **Uncommitted:** nothing after the stage commit
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-2439-chat-typing

## Steps

- [x] 1.1 Raise the three packages to 21.2.3 and rebuild the lock.
- [x] 1.2 Check the commit-msg check on a valid and an invalid header.

## Decisions along the way

- **The branch stands on RT-2439.** Both edit the assignment row. Affected stage of the plan: none.

## Sessions

### 2026-10-03

- The task, the branch and the folder are created.
- Stage 1 done: before and after — `feat(rt:ui-kit-v2): …` and `docs: …` exit 0, `fix(ci): …` and an English subject exit 1.
