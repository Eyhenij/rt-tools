# Plan

**Task:** RT-3467 · **Branch:** RT-3467-ci-watch-after-push
**Behaviour:** unchanged — код приложений не меняется. Меняется движок хода работы пакета правил: конец хода читает запуски CI открытых PR, чью вершину сессия отправила. Слово владельца: «обязан сам следить за проверками и ci».

## Points

- **A:** после отправки ветки проверка конца хода не читает CI. PR #3460 (RT-3399) в main: запуск
  44810853234 кончился красным 20.11 в 20:43, ни одна запись сессий не называет этот номер, а
  следующая отправка в ветку пришла через 12 часов. Сегодня CI читали только по привычке: запуск
  44897325872 на PR эпика #3472 вызвала отправка в ветку эпика, без `gh pr create`.
- **This task reaches:** сессия не заканчивает ход, пока запуск CI отправленной ею вершины открытого
  PR идёт без фонового слежения, кончился красным и не прочитан или ещё не появился. Это верно и в
  конце сценария, и после перехода на другую ветку. Отказ называет номер запуска и готовую команду.
- **Sign:** проверка конца хода на настоящей записи этой сессии, пока запуск CI её PR в main идёт
  без слежения, даёт отказ с номером запуска; со слежением отказ снят. Видит исполнитель в живой
  проверке, числа в ходе работы.
- **Milestone G of the epic:** три рабочих дня подряд от 1500 вызовов — меньше пяти отказов на сто
  и ни одного тупика. Задача добавляет отказ и держит его без тупика: ход к выходу всегда открыт —
  слежение или чтение, и вторая остановка без вызова называет тот же запуск, а не
  меню.
- **Metric:** нет. После выпуска владелец сверяет по `gh run list`: красный запуск открытого PR в
  main прочитан сессией раньше его следующего сообщения.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/host.mjs`         |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/session.mjs`      |
| Code (правится) | `projects/agent-kit/assets/task-flow/measure/`                |
| Code (правится) | `projects/agent-kit/assets/task-flow/flow.js`, `flow.md`      |
| Code (правится) | `projects/agent-kit/assets/checks/flow-verdict.mjs`, `task-flow-script.mjs` |
| Code (правится) | `projects/agent-kit/assets/checks/flow-syntax.mjs`, `flow-forecast.mjs` |
| Code (правится) | `projects/agent-kit/tests/turn-exit-guard.test.sh`, `task-flow-script.test.sh`, `flow-doubles.mjs` |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/exit/`          |
| Rules | `.claude/skills/turn-conduct/`, `.claude/skills/agent-kit-source/` — читаются |

## What counts as done

- Адаптер хостинга одним вызовом отдаёт открытые PR с базой и временем создания, а по sha вершины —
  запуски файла PR-конвейера из настройки дерева: номер, попытку, ход, итог, время конца, признак
  вытеснения. Запуски других файлов не судятся.
- Событие вызова несёт время и ветку своей записи; событие фоновой задачи несёт команду своего вызова.
- Судятся открытые PR с базой из веток `pull_request` конвейера, чья ветка — текущая, ветка эпика
  текущей работы или ветка, которую сессия отправила в этой записи (`git push`, `--head` вызова
  `gh pr create`). Слияние задачи в ветку эпика в браузере двигает вершину PR эпика без `git push`.
  Вершина PR для удержания читается мимо кэша адаптера.
- Удержание по CI читается до условий отпуска хода и до причины меню. «Сценарий кончен» его не
  снимает; снимает слово владельца «стоп». Прочие пути отпуска мимо движка — порог окна, роль, сбой
  или предел времени движка — названы в описании, сбой при открытом PR пишется в журнал с его номером.
  «Стоп» снимает удержание по идущему запуску и свежей вершине, но не по красной попытке, кончившейся
  после этого слова: её снимает один вызов чтения (слово владельца 21.11 в меню).
- Идущий запуск без слежения — отказ с номером и командой `gh run watch <id> --exit-status` в фоне.
  Слежение — неотказанная фоновая задача, чья команда называет номер запуска или PR целым словом и
  которая не кончилась. Слежение только снимает удержание, ход дальше решают условия сценария.
- Запуска на вершине нет, а отправка вершины моложе двух минут — отказ с командой слежения за PR.
- Красный запуск — отказ с номером и командой `gh run view <id> --log-failed`. Прочитан он
  неотказанным вызовом с его номером после конца этой попытки или чтением вывода слежения за ним.
  Отменённый, вытесненный, `timed_out` и `startup_failure` судятся как красный; `skipped` и запуски
  других файлов ход не держат.
- Три остановки на одном красном запуске дают не больше одного отказа, если после первого отказа
  был вызов чтения.
- Вторая остановка без вызова после отказа по CI называет тот же запуск, а не меню владельца.
- Зелёный запуск ход не держит; молчащий хостинг отпускает ход с записью в журнал.
- Описание держит сценарии; разложенные копии сходятся с пакетом.

## Stages

### 1. The host and the session give the facts

Rules: the host adapter reads the open PRs in one call and the runs of the tree's PR pipeline file
on a head sha; a call event carries its time and the branch of its record entry; the background
event carries the command of its call.

- **Steps:**
    1. The host adapter gives the open PRs and the pipeline runs of a head sha
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c 'ok .*SC-AK-1799'` → >= 1
    2. The session events carry the time and branch of a call and the command of a background task
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1800'` → >= 1
- **Readiness sign:** both scenarios ok, the suites end with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — exit 0;
  `bash projects/agent-kit/tests/turn-exit-guard.test.sh` — exit 0.

### 2. The engine holds the stop by CI

Rules: the CI hold is read before the release cases and before the menu cause; only the owner's
stop word passes a running run, not a red attempt ended after it. A running run without a watch, a
fresh head without a run and an unread red run hold the stop; a watch, a read, a green run or a
silent host lift it.

- **Steps:**
    1. A running run without a watch holds the stop with its number
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1801'` → >= 1
    2. A background watch lifts the hold, and the scenario decides the stop
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1802'` → >= 1
    3. An unread red run holds the stop with its number
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1803'` → >= 1
    4. A red run read after its end lifts the hold
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1804'` → >= 1
    5. A watch call before the end of the run is no read
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1805'` → >= 1
    6. A green run and a run of another workflow do not hold the stop
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1806'` → >= 1
    7. A silent host releases the stop
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1807'` → >= 1
    8. The end of the epic does not release a running run of its PR
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1808'` → >= 1
    9. A head moved by a push or an epic merge holds the stop after a branch switch
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1809'` → >= 1
    10. A fresh head without a run holds the stop only for a pipeline base
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1810'` → >= 1
    11. Three stops on one red run give one refusal when a read follows it
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1811'` → >= 1
    12. A second stop without a call names the run, not the menu
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1812'` → >= 1
    13. The stop word passes a running run, not a red attempt ended after it
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1813'` → >= 1
- **Readiness sign:** the thirteen scenarios ok; with the hold removed SC-AK-1801, 1803, 1808 and
  1809 fail.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard.test.sh` — exit 0;
  `node tools/flow-sync.mjs --check` — exit 0; `pnpm run agent-kit:check` — exit 0.

### 3. The description

Rules: every scenario gets its block and its binding in the spec of the turn exit, and the spec
names the paths that release a stop past the engine.

- **Steps:**
    1. The scenarios stand in the description
       Check: `grep -c -E '^### SC-AK-(1799|18(0[0-9]|1[0-3]))' docs/specs/agent-kit/turn-guards/flow-script/exit/scenarios.md` → = 15
- **Readiness sign:** the count holds, and the coverage check is green.
- **Verified by:** `npm run check:spec-coverage` — exit 0; `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- It does not judge workflows other than the tree's PR pipeline file on the head sha.
- It does not hold the stop by local checks and the push set: that is RT-3469.
- It does not demand the fix of a red run: the hold asks for the read, the scenario asks for the fix.
- It does not change the push guard or the push set.
- It does not name the tree's own path of the host client in the refusal: the command says `gh`.
