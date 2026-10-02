# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — the wait goes over TCP
- **Done:** the task, the branch and the folder; the race is seen in the Postgres log
- **Next step:** the two `pg_isready` lines
- **Uncommitted:** the folder and the assignment row
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-2406-shot-browser-shared-name

## Steps

- [>] 1.1 `ci.yml`: `pg_isready -h 127.0.0.1` in the migrations step, with a comment naming the reason.
- [ ] 1.2 `deploy/dump.sh`: the same in the probe wait.

## Decisions along the way

- **The branch stands on RT-2406.** Both edit the assignment row. Affected stage of the plan: none.

## Sessions

### 2026-10-02

- The race is seen in the image log: the socket is ready about 400 ms before TCP listens.
