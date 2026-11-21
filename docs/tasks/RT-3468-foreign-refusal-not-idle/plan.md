# Plan

**Task:** RT-3468 · **Branch:** RT-3468-foreign-refusal-not-idle
**Behaviour:** unchanged — код приложений не меняется. Меняются движок хода работы пакета правил и проверка черновика этого дерева: отказ чужой проверки не зовёт меню владельца, а черновик ветки, взятой в другой копии, не держит ход.

## Points

- **A:** 20.11 в 16:23:51 и 16:36:49 и 21.11 в 01:20:13 одна сессия трижды поставила владельца
  перед меню «отложить / стоп». Каждый раз перед ним стоял отказ `git-guard-draft-ready`: снять
  черновик #3453, который вела соседняя сессия. Мера простоя считает простоем любой последний
  отказ остановки, от какой бы проверки он ни пришёл. Второй ярус проверки черновика судит все
  черновики машинной учётной записи и отказывает на каждом новом ходе: 17 отказов за 20–21.11 и
  тупик 20.11 с 15:36 до 15:49. Случай 21.11 01:20 уже снят RT-3463 (фоновый набор).
- **This task reaches:** остановка после отказа другой проверки остановки не даёт меню: движок
  называет ход состояния и одной строкой — чей был отказ. Простой — когда среди отказов остановки
  после последнего вызова есть отказ самого движка. Отказ модельной проверки без имени — отказ
  модельной проверки, не движка. Второй ярус проверки черновика не судит черновик, чья ветка взята
  в другой рабочей копии.
- **Sign:** сценарии наборов движка и проверки черновика; после выкладки по записям — ноль меню
  простоя, перед которыми стоит отказ чужой проверки с именем. Видит исполнитель, числа в ходе
  работы.
- **Milestone G of the epic:** за рабочий день отказов меньше пяти на сто вызовов и ни одного
  тупика. Задача снимает отказы проверки черновика о черновиках других копий и меню, которое
  ставит владельца перед выбором из-за чужой проверки.
- **Metric:** меню простоя после отказа чужой проверки остановки по записям — 3 за 20–21.11, вниз
  до 0; отказы `git-guard-draft-ready` — 17 за 20–21.11, вниз.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/session.mjs` — имя проверки в событии отказа, отказ модельной проверки без имени |
| Code (правится) | `projects/agent-kit/assets/task-flow/measure/session.mjs` — `idle` по всем отказам остановки после последнего вызова |
| Code (правится) | `projects/agent-kit/assets/checks/flow-verdict.mjs` — строка о чужом отказе |
| Code (правится) | `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh` — новый набор, подключён из `turn-exit-guard.test.sh` |
| Code (правится) | `projects/agent-kit/tests/turn-exit-guard.test.sh` |
| Code (правится) | `.claude/hooks/git-guard-draft-ready.sh` — второй ярус |
| Code (правится) | `tools/tests/git-guard-draft-ready.test.sh` — новый набор дерева |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/exit/`          |
| Rules | `.claude/skills/turn-conduct/` — читается                     |

## What counts as done

- Событие отказа остановки несёт имя проверки из «BLOCKED by <имя>» в любом месте первой строки,
  и после префикса «Agent hook condition was not met:» тоже. Отказ с этим префиксом без имени
  несёт имя модельной проверки остановки; отказ без всякого имени несёт null.
- Мера простоя судит все отказы остановки после последнего вызова или меню: простой, когда среди
  них есть отказ проверки конца хода или отказ с null. Отказ движка и отказ модельной проверки в
  одну остановку, затем остановка без вызова — меню.
- Остановка без вызова после отказа только другой проверки остановки (проверки черновика,
  модельной проверки хода) не даёт меню: движок называет ход состояния и строку «отказ <имя> не о
  твоей работе — назови его и делай ход состояния».
- Серия отказов самого движка по-прежнему ведёт к меню.
- Второй ярус проверки черновика пропускает черновик, чья ветка взята в другой рабочей копии
  (`git worktree list --porcelain`). Черновик ветки, которую не держит ни одна копия, по-прежнему
  отказан.
- Правило описания о меню после остановки без вызова говорит об отказе самого движка.
- Описание держит сценарии; разложенные копии сходятся с пакетом.

## Stages

### 1. A stop after a refusal of another check is no idle one

Rules: a refusal event names the hook that refused, the model check without a name included; the
idle measure judges every refusal of a stop after the last call; the verdict names whose refusal it
was.

- **Steps:**
    1. A refusal of a stop names the hook that refused, the model check with no name included
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1830'` → >= 3
    2. A stop after a refusal of the draft check about a foreign PR, with no background task, gives the move of the state and a line about the foreign refusal
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1831'` → >= 2
    3. A stop after a refusal of the engine itself is still idle
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1832'` → >= 1
    4. A refusal of the engine and of the model check in one stop, then a stop with no call, give the menu
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1836'` → >= 1
    5. A refusal of the model check with no name is no idle one
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1837'` → >= 1
- **Readiness sign:** the five scenarios ok, the suite ends with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard.test.sh` — exit 0.

### 2. The draft check does not judge a draft of another copy

Rules: the second tier lets a draft through when its branch is checked out in another working copy;
a draft whose branch no copy holds is refused as before.

- **Steps:**
    1. A draft of a branch checked out in another copy passes, a draft of a branch no copy holds is refused
       Check: `VERBOSE=1 bash tools/tests/git-guard-draft-ready.test.sh 2>&1 | grep -c 'ok .*draft-ready'` → >= 3
- **Readiness sign:** the suite ends with 0 failures.
- **Verified by:** `bash tools/tests/git-guard-draft-ready.test.sh` — exit 0.

### 3. The description

Rules: the scenarios stand in the description of the exit guard, bound to the code; the rule of the
menu after a stop with no call names the engine's own refusal.

- **Steps:**
    1. The scenarios stand in the description
       Check: `grep -c -E '^### SC-AK-18(3[0-2]|3[67])' docs/specs/agent-kit/turn-guards/flow-script/exit/scenarios.md` → = 5
    2. The rule of the menu names the engine's own refusal
       Check: `grep -c 'stopped again with no call after a refusal of the engine itself' docs/specs/agent-kit/turn-guards/flow-script/exit/spec.md` → = 1
- **Readiness sign:** `node tools/check-specs.mjs` and `npm run -s check:spec-coverage` exit 0.
- **Verified by:** `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- Не меняет меню при двух одинаковых отказах вызовов другой проверкой (`forbidden`): отказ на
  переходе в чужую ветку остаётся. Эта часть карточки не закрыта и названа в PR; находка рядом с
  планом эпика.
- Не меняет предел фонового набора 20 минут, после которого он не держит меню: находка рядом с
  планом эпика.
- Не учит второй ярус таблице назначений копий: признак — ветка, взятая в другой рабочей копии.
