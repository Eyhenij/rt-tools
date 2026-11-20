# Plan

**Task:** RT-3420 · **Branch:** RT-3420-menu-without-self-option
**Behaviour:** unchanged — код приложений не меняется. Меняется поведение проверок хода работы: меню отказа теряет вариант, строка плана эпика «шаг владельца» больше не ставится и задачу не блокирует; правила идут в описание проверки той же правкой. Слово владельца: «доведи все задачи эпика до завершения».

## Points

- **A:** the engine hands a step of the work to the owner two ways. The menu of a refusal carries
  the option «сделаю сам». A row of the epic plan marked «шаг владельца» blocks its task: the next
  task of the epic passes it over, and the end of the epic still waits for it. The owner's order of
  19.11 says the agent does all the work. The option stands in 32 files:
  `grep -rl 'сделаю сам' projects/agent-kit docs/specs/agent-kit tools .claude/hooks .claude/rt-kit/defaults .claude/skills | wc -l`.
- **This task reaches:** a refusal that goes to the owner asks two things only — to put the task
  off or to stop. A row of the epic plan cannot be marked as the owner's step, and a row so marked
  blocks nothing.
- **Sign:** the count above gives 0; the scenarios of the menu hold two options; the scenario of
  the row edit ends with a refusal; the five suites named below end with 0 failures.
- **Milestone G of the epic:** fewer than five refusals per hundred commands and no dead end. A
  task marked as the owner's step is a dead end today: no one takes it, and the epic cannot end.
- **Metric:** нет: правка слов меню и одного состояния строки, счёт отказов она не двигает.

## Task footprint

| What  | Where |
| ----- | ----- |
| Laws  | `docs/constitution/work-conduct.md` |
| Rules | `.claude/skills/turn-conduct/`, `.claude/skills/task-flow-owner/`, `.claude/skills/agent-kit-source/`, `.claude/skills/spec-driven/` |
| Code (правится) | `projects/agent-kit/assets/task-flow/flow.js` |
| Code (правится) | `projects/agent-kit/assets/task-flow/flow.md` |
| Code (правится) | `projects/agent-kit/assets/task-flow/measure/epic.mjs` |
| Code (правится) | `projects/agent-kit/assets/task-flow/measure/epic-text.mjs` |
| Code (правится) | `projects/agent-kit/assets/checks/flow-guard.mjs` |
| Code (правится) | `projects/agent-kit/assets/checks/flow-verdict.mjs` |
| Code (правится) | `projects/agent-kit/assets/checks/decision-table.json` |
| Code (правится) | `projects/agent-kit/assets/hooks/ask-judge.md` |
| Code (правится) | `projects/agent-kit/assets/hooks/flow-step-guard.sh` |
| Code (правится) | `projects/agent-kit/assets/rules/turn-conduct.md` |
| Code (правится) | `projects/agent-kit/assets/defaults/turn-map.md` |
| Code (правится) | `projects/agent-kit/tests/` |
| Code (правится) | `docs/specs/agent-kit/turn-guards/` |

## What counts as done

- The words of the menu are «отложить RT-N» and «стоп»; the generated description carries the
  same two.
- The text of a refusal tells what a deferral and a stop do, and nothing about a step of the owner.
- An edit that marks a row of the epic plan «шаг владельца» is refused with no window. The refusal
  says the step is the executor's, and the owner's word puts the task off.
- A row that carries «шаг владельца» is read as an ordinary row: the next task of the epic does
  not pass it over. An edit that takes the mark off a row passes as before, so an old row can be
  cleaned.
- The hook of the step guard knows the new refusal by its words, and the row of the decision table
  answers it with a refusal, not with the owner's window.
- The scenarios `SC-AK-1469`, `SC-AK-1389` and `SC-AK-1744` are gone with their tests, and their
  numbers stay empty. `SC-AK-1445` holds two options, `SC-AK-1443` checks the text of two answers,
  `SC-AK-1746` ends with the refusal.
- The rule of the turn, its diagram, the map of the turn, the text of the menu judge and the
  description of the check name two options and no owner's step of a row.
- The laid-out copies match the package.

## Stages

### 1. The engine and the guard

Rules: the words of the menu lose the option; the description `flow.md` is generated from
`flow.js`, and `node projects/agent-kit/assets/checks/flow-sync.mjs --check` is green before the
first edit. The guard loses the constant of the option and the
window of the row; it refuses the mark outright. The measure of the epic plan loses the owner's
quote of a row. The text of a refusal names two answers. The hook of the step guard tells the
refusal of the mark by its words; the pattern follows the new text, and the row of the decision
table turns from the owner's window into a refusal.

- **Steps:**
    1. The words of the menu carry two options
       Check: `grep -c 'сделаю сам' projects/agent-kit/assets/task-flow/flow.js` → = 0
    2. The guard refuses the mark of the owner's step with no window
       Check: `grep -c 'SELF_OPTION' projects/agent-kit/assets/checks/flow-guard.mjs` → = 0
    3. A row of the plan carries no owner's quote
       Check: `grep -c 'ownerQuote' projects/agent-kit/assets/task-flow/measure/epic.mjs projects/agent-kit/assets/task-flow/measure/epic-text.mjs | awk -F: '{s += $2} END {print s}'` → = 0
    4. The text of a refusal names no step of the owner
       Check: `grep -c 'сделаю сам' projects/agent-kit/assets/checks/flow-verdict.mjs` → = 0
    5. The decision table answers the mark with a refusal
       Check: `grep -c 'waits for your step' projects/agent-kit/assets/checks/decision-table.json` → = 0
- **Readiness sign:** the five counts are 0.
- **Verified by:** `node projects/agent-kit/assets/checks/flow-sync.mjs --check` — exit 0.

### 2. The scenarios

Rules: `SC-AK-1445` checks two options; `SC-AK-1443` checks the text of a deferral and a stop.
`SC-AK-1469`, `SC-AK-1389` and `SC-AK-1744` are deleted from the suites and from the description.
`SC-AK-1746` expects the refusal of the mark, and the row of the decision table follows it. The
replay fixtures and the replay library carry a menu of two options.

- **Steps:**
    1. The suites and the checks carry no option
       Check: `grep -rl 'сделаю сам' projects/agent-kit/tests projects/agent-kit/assets/checks | wc -l | tr -d ' '` → = 0
    2. The scenario of the option is gone
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1469'` → = 0
    3. The mark of the owner's step is refused
       Check: `VERBOSE=1 bash projects/agent-kit/tests/flow-step-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1746 — .* deny$'` → >= 1
- **Readiness sign:** the suites end with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard.test.sh`,
  `bash projects/agent-kit/tests/turn-replay.test.sh`,
  `bash projects/agent-kit/tests/flow-language.test.sh`,
  `bash projects/agent-kit/tests/flow-step-guard.test.sh`,
  `bash projects/agent-kit/tests/task-flow-script.test.sh`,
  `bash projects/agent-kit/tests/decision-table.test.sh`,
  `bash projects/agent-kit/tests/decide.test.sh` — exit 0 each. The suite of the decision table
  checks the chains of refusals, so the new refusal is shown to end in a move.

### 3. The texts and the layout

Rules: the rule of the turn with its diagram, the map of the turn and the text of the menu judge
name two options. The description of the check — the mission, the flow script with its exit, epic
and replay parts — says the same. The rule «a row names the owner's step only through the owner's
window» is replaced by the rule of the refusal. The package is built and laid out.

- **Steps:**
    1. The texts of the package name two options
       Check: `grep -rl 'сделаю сам' projects/agent-kit/assets | wc -l | tr -d ' '` → = 0
    2. The description of the check names two options
       Check: `grep -rl 'сделаю сам' docs/specs/agent-kit | wc -l | tr -d ' '` → = 0
    3. No text counts three options
       Check: `grep -rn -i 'exactly three\|the three options\|ровно три' projects/agent-kit/assets/hooks projects/agent-kit/tests docs/specs/agent-kit/turn-guards | wc -l | tr -d ' '` → = 0
    4. No text speaks of the owner's window of a row
       Check: `grep -rn "through the owner's window on\|waits for your step\|waiting for the owner's step" projects/agent-kit/assets/task-flow projects/agent-kit/assets/checks/decision-table.json docs/specs/agent-kit/turn-guards | wc -l | tr -d ' '` → = 0
    5. The laid-out copies carry no option
       Check: `grep -rl 'сделаю сам' tools .claude/hooks .claude/rt-kit/defaults .claude/skills | wc -l | tr -d ' '` → = 0
- **Readiness sign:** the count of the point A is 0.
- **Verified by:** `pnpm run agent-kit:check` — exit 0; `npm run check:spec-coverage` — exit 0.

## What this work does not do

- The records of past sessions and the archive keep the old menu: history is not rewritten.
- The name of row 19 in the plan of the epic keeps the words of the card.
- The count of refusals at turn ends is the subject of RT-3418.
