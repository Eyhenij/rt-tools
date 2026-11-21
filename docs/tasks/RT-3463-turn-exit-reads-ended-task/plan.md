# Plan

**Task:** RT-3463 · **Branch:** RT-3463-turn-exit-reads-ended-task
**Behaviour:** unchanged — код приложений не меняется. Меняется проверка конца хода: кончившаяся после последнего вызова фоновая задача сессии — это ход «прочитать её вывод», а не меню «отложить / стоп». Слово владельца: «разбирайся что сломано в проверках и хуках и исправляй».

## Points

- **A:** a background task of the session ends after the last call, and the turn-exit guard names
  the owner's menu «отложить / стоп» as the one move. On 21.11 the push set ended red at 01:20:00,
  the guard asked for the menu at 01:20:13, the owner chose «стоп», and the red result stayed
  unread. The engine replayed on the record cut at 01:20:13 gives the same menu.
- **This task reaches:** after a background task ends, the guard names that task and its output file
  as the one move and offers no menu. The owner no longer has to wake the session to learn a check
  is red.
- **Sign:** the suite of the turn-exit guard holds the scenario `SC-AK-1797`: a transcript shaped as
  on 21.11 — a task started, a call, a refusal of another guard, the end of the task — gives the
  read of the output through the hook, not the menu; a refusal with no ended task still gives the
  menu.
- **Milestone G of the epic:** fewer than five refusals per hundred commands and no dead end. A
  menu that ends a turn over an unread red check is a dead end the owner has to break.
- **Metric:** нет: проверка конца хода предлагала «стоп» над непрочитанным итогом фоновой задачи.

## Task footprint

| What  | Where |
| ----- | ----- |
| Laws  | `docs/constitution/work-conduct.md` |
| Rules | `.claude/skills/turn-conduct/`, `.claude/skills/agent-kit-source/`, `.claude/skills/spec-driven/` — читаются |
| Code  | `projects/agent-kit/assets/task-flow/measure/session.mjs`, `projects/agent-kit/assets/task-flow/source/session.mjs` |
| Code  | `projects/agent-kit/assets/task-flow/flow.js` |
| Code  | `projects/agent-kit/assets/checks/flow-verdict.mjs`, `projects/agent-kit/assets/checks/task-flow-script.mjs` |
| Code  | `projects/agent-kit/tests/turn-exit-guard.test.sh` |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/exit/` |
| Code  | `tools/task-flow/`, `tools/flow-verdict.mjs`, `tools/task-flow-script.mjs` — разложенные копии, их пишет раскладка |

## What counts as done

- A background task is unread when its start stands in the record, its end comes from its notice
  (not from a stop the session made itself), and no call after the end names its number or its
  output file. While one is unread, the stop is not idle and no owner's menu is named — neither
  the menu of idleness nor the menu of a step another check forbids.
- A task with a start and no end that is older than the bound of 20 minutes is named the same way:
  the move is to read its output, not the menu.
- The refusal names the unread task by its number and its output file, says the one move is to read
  it and act on it, and that the menu is not offered while it is unread.
- A refusal followed by no call and no unread task still names the menu, as before.
- The old case «задача кончилась — простой, как раньше» and the line «with the task over or past the
  bound the stop is idle as before» are gone; `SC-AK-1797` stands in the description.
- The laid-out copies match the package.

## Stages

### 1. An ended task is read, not offered to stop over

Rules: a new measurer of the session names the unread task. `idle` and `forbidden` give way to it in
the verdict. The start of a task keeps its output file from the result of its call. The suite runs
the package sources, and the package is laid out inside this stage.

- **Steps:**
    1. A task that ended after the last call makes the stop not idle
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1797 — задача кончилась после последнего вызова'` → >= 2
    2. The refusal names the task and its output and offers no menu
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1797 — отказ называет задачу'` → >= 1
    3. Only a call that names the task or its output reads it
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1797 — прочитано'` → >= 2
    4. A task the session stopped itself, or one with no start in the record, is not unread
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1797 — не своя или снятая'` → >= 2
    5. The menu of a forbidden step is not offered over an unread task
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1797 — запрет другой проверки'` → >= 1
    6. A task running past the bound is named, not the menu
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1797 — старше предела'` → >= 1
    7. A transcript shaped as on 21.11 holds the stop through the hook and names the task
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1797 — стенограмма 21.11'` → >= 1
    8. A refusal with no ended task still gives the menu
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1797 — простой без кончившейся задачи'` → >= 1
- **Readiness sign:** the suite ends with 0 failures; the eight lines stand in the progress.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard.test.sh` — exit 0;
  `pnpm run agent-kit:check` — exit 0.

### 2. The description

Rules: `SC-AK-1763` loses the case of an ended task; the new scenario gets its number and its
binding in the companion of the spec.

- **Steps:**
    1. The old case of an ended task is gone from the suite
       Check: `grep -c 'задача кончилась — простой, как раньше' projects/agent-kit/tests/turn-exit-guard.test.sh | cat` → = 0
    2. The old line of an ended task is gone from the description
       Check: `grep -c 'the stop is idle as before' docs/specs/agent-kit/turn-guards/flow-script/exit/scenarios.md | cat` → = 0
    3. The scenario of the unread task stands in the description
       Check: `grep -c '^### SC-AK-1797' docs/specs/agent-kit/turn-guards/flow-script/exit/scenarios.md` → = 1
- **Readiness sign:** the counts hold, and the coverage check is green.
- **Verified by:** `npm run check:spec-coverage` — exit 0; `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- It does not change how the session waits for its own task: the release while a task runs stays.
- It does not read the output for the session: the guard names the move, the session makes it.
- It does not lead the session to the run of the pipeline after a push: a task of its own.
- A refusal of another guard the session cannot carry out still counts toward idleness: a task of
  its own.
- The base of the push set taken from a branch gone from the host (RT-3465) and the node version of
  the light steps in the push guard (RT-3466) are tasks of their own.
