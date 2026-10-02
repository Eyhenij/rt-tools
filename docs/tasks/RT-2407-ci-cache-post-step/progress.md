# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — pnpm in the runner's own directory
- **Done:** `pnpm/action-setup` in `ci.yml` installs into `runner.tool_cache`
- **Next step:** the folder is taken apart, the PR opens, its run confirms the store path
- **Uncommitted:** the `ci.yml` edit and this file
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Give `pnpm/action-setup` in `ci.yml` a `dest` under `runner.tool_cache`, with a comment naming the reason.

## Decisions along the way

- **The install directory goes under the runner's tool directory, not under the job's temporary one.** The temporary directory is emptied before every job, and the store restored from the cache would be lost with it. Affected stage of the plan: 1.

## Sessions

### 2026-10-02

- The cause is found by the store path in the run log and the time `~/setup-pnpm` was recreated.
- Stage 1: `pnpm exec prettier --check .github/workflows/ci.yml` — «All matched files use Prettier code style!»
