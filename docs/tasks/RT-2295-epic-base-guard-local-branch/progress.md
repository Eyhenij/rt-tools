# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 2 — the guard reads the base, not only the remote copy of the epic branch
- **Done:** the task is created, the branch is taken from the main one, the plan is written
- **Next step:** let the lag refusal stand down when the base carries the tip of the main branch
- **Uncommitted:** the folder of this task and the folder of task RT-2293
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 Read `rt_epic_base` and the two ancestor checks in it
- [ ] 1.2 Let the lag refusal stand down when the base named by the command already carries the tip of the main branch
- [ ] 2.1 Write the case into the suite: the remote epic branch lags, the base carries the main tip
- [ ] 2.2 Add the scenario to the delivery gate scenarios and bind it

## Decisions along the way

- **The fix goes outside the epic of the chat service** — the epic branch of that service is
  exactly what the refusal blocks, and a task of it cannot get a branch at all. Word of the owner:
  «выполняй задачу».

## Sessions

### 2026-09-21

- Task RT-2295 created, branch taken from `origin/main` at `75185acba`, plan written.
