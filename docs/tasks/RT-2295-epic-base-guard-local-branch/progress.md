# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — the case and the scenario
- **Done:** the guard asks the tip of the base too, the case and the scenario are written, the
  scenarios of the epic moved into a subdomain of their own
- **Next step:** bring the texts up to date, run the set before the push, open the request
- **Uncommitted:** the folder of task RT-2293
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Read `rt_epic_base` and the two ancestor checks in it
- [x] 1.2 Let the lag refusal stand down when the base named by the command already carries the tip of the main branch
- [x] 2.1 Write the case into the suite: the remote epic branch lags, the base carries the main tip
- [x] 2.2 Add the scenario to the delivery gate scenarios and bind it

## Decisions along the way

- **The fix goes outside the epic of the chat service** — the epic branch of that service is
  exactly what the refusal blocks, and a task of it cannot get a branch at all. Word of the owner:
  «выполняй задачу».
- **The rules about the epic moved into the subdomain `delivery-epic`** — the scenario file of the
  delivery guards stood at the length limit, and a new scenario did not fit. Affected stage of the
  plan: 2.

## Sessions

### 2026-09-21

- Task RT-2295 created, branch taken from `origin/main` at `75185acba`, plan written.
- The guard asks the tip of the base as well: `bash projects/agent-kit/tests/guard-epic-base.test.sh`
  gives 21 ok, 0 провалов; with the clause dropped the new case turns red.
- The subdomain `delivery-epic` created: six scenarios, ten bindings and ten rules moved there.
- `node tools/check-specs.mjs` and `node tools/check-file-size.mjs` exit with zero.
