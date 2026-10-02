# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — pnpm in the runner's own directory
- **Done:** the task, the branch and the folder; the cause is found
- **Next step:** the `dest` line in `ci.yml`
- **Uncommitted:** the folder and the assignment row
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 Give `pnpm/action-setup` in `ci.yml` a `dest` under `runner.tool_cache`, with a comment naming the reason.

## Decisions along the way

- **The install directory goes under the runner's tool directory, not under the job's temporary one.** The temporary directory is emptied before every job, and the store restored from the cache would be lost with it. Affected stage of the plan: 1.

## Sessions

### 2026-10-02

- The cause is found by the store path in the run log and the time `~/setup-pnpm` was recreated.
