# Plan

**Task:** RT-3469 · **Branch:** RT-3469-push-ahead-exit-code
**Behaviour:** unchanged — код приложений не меняется. Меняются проверки пакета правил: запуск набора перед отправкой, чей код не виден нигде, отказан с готовой формой; тексты отказов называют готовую форму. Слово владельца: «обязан сам следить за проверками и ci».

## Points

- **A:** фоновый запуск набора перед отправкой при красном итоге приходит уведомлением «exit code
  0»: уведомление несёт код последней команды вызова. По записям 383 разных вызова запускают набор,
  у 340 после набора стоит другая команда. 317 из них печатают `$?` набора в вывод, и сессия видит
  код там; у 15 код не виден нигде — конвейер `| tail` без `$?`. Случаев, где красный прочитан как
  зелёный, разбор стратега не нашёл. 21.11 сессия RT-3467 получила «exit code 0» над строкой
  «push ahead: red — node tools/check-glossary.mjs» и прочла красный по журналу.
- **This task reaches:** вызов, где код набора не виден ни в уведомлении, ни в выводе, отказан с
  готовой формой запуска. Тексты отказов, которые посылают к набору, и шаблон цикла называют
  готовую форму: журнал вне рабочей копии, итог — строка `push ahead:` журнала.
- **Sign:** проверка на 383 разных вызовах из записей отказывает тем 15, где код не виден, и
  пропускает остальные; текст в heredoc, в кавычках и в `printf` в файл проходит. Видит исполнитель
  в живой проверке, числа в ходе работы.
- **Milestone G of the epic:** за рабочий день отказов меньше пяти на сто вызовов и ни одного
  тупика. Задача добавляет около 0,02 отказа на сто: отказ только там, где код не виден нигде, и
  сразу с готовой формой.
- **Metric:** вызовы набора, у которых код не виден ни в уведомлении, ни в выводе: 15 из 383 по
  записям 14–21.11, вниз до 0; новые отказы проверки — не больше 0,05 на сто вызовов в день.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/hooks/push-ahead-call-guard.sh` — новая проверка |
| Code (правится) | `projects/agent-kit/assets/checks/decision-table.json`        |
| Code (правится) | `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh` — два своих текста |
| Code (правится) | `projects/agent-kit/tests/push-ahead-call-guard.test.sh` — новый набор |
| Code (правится) | `projects/agent-kit/tests/real-hooks.test.sh`, `.claude/rt-kit/push-inputs.json` — если сверки требуют строку новой проверки |
| Specs | `docs/specs/agent-kit/push-gate-ahead/`, `docs/specs/agent-kit/decision-table/spec.md` |
| Rules | `.claude/skills/task-delivery-loop-run/SKILL.md` — готовая форма запуска |
| Rules | `.claude/skills/testing/implementation.md` — строка новой проверки, если сверка её требует |

## What counts as done

- Проверка вызова судит весь хвост после `git-guard-push-ahead.sh`. Отказ, когда код набора не
  виден нигде:
  - после набора стоят `;`, перенос строки или `||`, и следующая команда не печатает `$?`;
  - после набора стоит конвейер без `PIPESTATUS` и без `set -o pipefail`;
  - набор уходит в фон через `&` или стоит под `!`;
  - цепочка `&&` после набора кончается `;` или переносом строки, за которыми нет `$?`.
- Запуск набора без хвоста, с перенаправлением его вывода, с `&&` до конца вызова или с `$?`
  сразу после набора проходит. Префиксы `VAR= `, `nohup`, `time` и подоболочка узнаются.
- Текст, который только называет скрипт, проходит: поиск, чтение файла, heredoc, `printf` в файл,
  сообщение коммита в кавычках, `bash -n`. Запуск внутри `bash -c '…'` судится по тексту внутри.
- Отказ называет готовую форму: `bash .claude/hooks/git-guard-push-ahead.sh > <журнал вне дерева>
  2>&1` в фоне, без команд после него. Журнал вне рабочей копии: файл в дереве делает копию грязной,
  и набор не начинается. Итог — код в уведомлении и `grep '^push ahead:' <журнал>`.
- Проверка стоит на тех же инструментах, что `rerun-guard.sh`. FAIL-OPEN без `jq`, при сломанном
  вводе и не на вызове команды; цена названа в шапке.
- Отказ — строка таблицы решений; сверки таблицы и описаний держат её.
- 11 текстов таблицы с `{ahead_cmd}` и два текста `git-guard-delivery-epic.sh` называют готовую
  форму; их `says` сходятся с текстами.
- Шаблон `task-delivery-loop-run` даёт готовую форму с журналом вне дерева и чтением `push ahead:`.
- Описание запуска набора говорит, каким кодом выходит красный набор, как код делает скрипт.
- Красный набор в готовой форме кончается ненулевым кодом.

## Stages

### 1. The guard refuses a run ahead whose code is visible nowhere

Rules: a call whose tail after the run ahead hides its code and prints no `$?` is refused with the
ready form; a run whose code shows passes; a text that only names the script passes.

- **Steps:**
    1. A run ahead whose tail hides its code and prints no `$?` is refused with the ready form
       Check: `VERBOSE=1 bash projects/agent-kit/tests/push-ahead-call-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1814'` → >= 7
    2. A run ahead alone, redirected, chained by `&&` to the end or followed by `$?` passes
       Check: `VERBOSE=1 bash projects/agent-kit/tests/push-ahead-call-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1815'` → >= 5
    3. A text that only names the script passes, a run inside `bash -c` is judged by its inner text
       Check: `VERBOSE=1 bash projects/agent-kit/tests/push-ahead-call-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1816'` → >= 6
    4. A red set in the ready form ends with a nonzero code
       Check: `VERBOSE=1 bash projects/agent-kit/tests/push-ahead-call-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1821'` → >= 1
    5. The refusal is a row of the decision table
       Check: `grep -c '"hook": "push-ahead-call-guard.sh"' projects/agent-kit/assets/checks/decision-table.json` → >= 1
- **Readiness sign:** the four scenarios ok, the suite ends with 0 failures, the row stands.
- **Verified by:** `bash projects/agent-kit/tests/push-ahead-call-guard.test.sh` — exit 0.

### 2. The ready form is named where the run ahead is named

Rules: the refusals that send to the run ahead name the ready form; the pattern of the delivery
loop gives it with a log outside the tree and the read of the line `push ahead:`.

- **Steps:**
    1. The refusals of the table that name the run ahead name the ready form
       Check: `grep -c 'run_in_background, nothing after it' projects/agent-kit/assets/checks/decision-table.json` → >= 11
    2. The two texts of the epic delivery guard name the ready form
       Check: `grep -c 'nothing after it' projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh` → >= 2
    3. The pattern of the delivery loop gives the ready form of the run ahead
       Check: `grep -c 'git-guard-push-ahead.sh > ' .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
- **Readiness sign:** thirteen texts and the pattern name the ready form.
- **Verified by:** `pnpm run -s agent-kit:check` — the laid-out copies match the package.

### 3. The description

Rules: the scenarios of the guard stand in the description of the run ahead, bound to the code; the
description says the exit code of a red set as the script makes it.

- **Steps:**
    1. The scenarios stand in the description of the run ahead
       Check: `grep -c -E '^### SC-AK-18(1[4-6]|21)' docs/specs/agent-kit/push-gate-ahead/scenarios.md` → = 4
- **Readiness sign:** `node tools/check-specs.mjs` and `npm run -s check:spec-coverage` exit 0.
- **Verified by:** `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- Не меняет сам скрипт набора и его коды выхода: код красного набора — число красных проверок, и
  код 3 «не начат» совпадает с тремя красными. Разделение кодов — отдельная правка, находка лежит
  в `docs/plans/checks-rework-4-findings.md`.
- Не учит движок хода отличать законченную задачу с ненулевым кодом: он и так держит непрочитанной
  любую законченную задачу.
- Не судит другие проверки, запущенные в фоне с хвостом (`git commit … | tail`, наборы тестов).
- Не судит запуск набора из терминала владельца: проверка видит только вызовы сессии.
