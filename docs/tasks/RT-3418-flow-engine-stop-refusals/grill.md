# Grill

**Описание фичи:** не нужно — правка движка хода работы и его описания; код приложений не меняется.

## The owner request

> я ухожу спать, переключайся в ночной автономный режим, доведи все задачи эпика до завершения и сам эпик до пр в main

The owner's word of 19.11.2026 for the night; the task is row 17 of the plan of the epic RT-3302.
The card (issue #3418) was filed by the measurement of RT-3276. The exit check of the work flow
engine gave 190 of the 195 refusals at turn ends over 14–19.11 and three dead ends — runs of ten
or more refusals on one step. The card asks to find which refusals are false and to lift them. The
same pass looks at the 17 refusals of the menu judge and the three of the turn judge.

## What the tree already has

- **The exit check.** The hook `turn-exit-guard.sh` calls the engine `tools/task-flow-script.mjs`.
  The engine reads the description `tools/task-flow/flow.md`: the states, the release cases and the
  measurers. The package sources lie under `projects/agent-kit/assets/task-flow/` and
  `projects/agent-kit/assets/checks/`.
- **The release cases.** Six: the end of the scenario, a stop word of the owner, no write to the
  tree, a role session, a silent host, a menu that did not reach the owner. None says «a background
  task of this session is still running».
- **What the engine sees of a session.** `source/session.mjs` gives four kinds of events: a refusal
  at a turn end, a menu, a call of a tool, a call refused by a hook. A background command, an agent
  in the background and the notice of their end are not among them.
- **The idle measure.** `measure/session.mjs:idle` holds when the last event is a refusal of a stop.
  A turn that waits for a background run and calls nothing gets the owner's menu «отложить / сделаю
  сам / стоп» on the next stop, although the step is the executor's own.
- **The live day of 19.11.** 67 refusals of the exit check at turn ends. By state: `этап-идёт` 35,
  `разбор-кончился` 12, `папка-разобрана` 7, `задача-взята` 7, `просьба-не-разобрана` 4,
  `работа-отдана` 2. Runs in a row: 18 on step 3.1 of RT-3417, 10 on `этап-идёт` with no step
  named, 8 on `разбор-кончился`.
- **The classes seen live on 19.11.**
    - A background run or the live count was awaited, and nothing could be done that minute.
    - The named move could not be made: `step N.M` refuses on a folder taken apart (RT-3434).
    - The push set ran in the background, and the tree must not be touched while it runs.
    - The copy stood on the epic branch between two tasks, and the state read as
      `просьба-не-разобрана`.
- **The record is read whole.** `source/session.mjs` reads the session record as one string. The
  record of this session is 278 MB; past the string limit of the runtime the read throws.

## What the rules already say

- The rule `turn-conduct` and the law of work conduct: a turn does not end while work is left that
  the executor can do. Waiting for one part of a stage is never a stop of the stage (rule
  `task-flow-plan`).
- The pattern `task-delivery-loop-run` and the push guard: heavy steps run in the background, and
  the tree is not touched between the green run and the push.
- The epic plan sets the bound: fewer than five refusals per hundred commands and no dead end.

## Questions and answers

None. The owner left for the night and said to bring the tasks to the end; the card names the
count, the dead ends and the condition.

## Decisions

- **A stop that waits for a background task of the session is let through.** The session record
  holds the start of a background command or agent and the notice of its end; a task with a start
  and no end is a fact the engine can measure. The host wakes the session by the notice, so the
  work goes on by itself. Спросить было некого: заход автономный. Цена ошибки: один случай отпуска
  и один измеритель в описании движка; владелец снимает их одной правкой описания. Rejected: a
  longer silence before the menu — it only moves the dead end further.
- **The wait is bounded.** A background task older than its bound releases nothing: a hung command
  must not let the session stand still for a night. The bound is taken from the longest honest
  wait of the tree, the push set. Цена ошибки: одно число в описании.
- **The classification of the refusals of 14–19.11 comes first, the edit second.** The edit lifts
  the classes the count shows as the biggest; a class with a few cases goes to «what this work
  does not do» with its number.
- **The move that cannot be made is RT-3434, the wrong base of the push set is RT-3426.** They are
  counted here and fixed there.

## What is left unclear

- Whether the host writes the notice of the end for every kind of background task — a command, an
  agent, a monitor. The classification of the records answers it before the plan.
- What the hook does when the engine throws on a record too long to read: lets the turn end or
  holds it. A run with a record past the limit shows it.
