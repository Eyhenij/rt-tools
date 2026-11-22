# Plan

**Task:** RT-3419 · **Branch:** RT-3419-stop-word-releases-task
**Behaviour:** unchanged — код приложений не меняется. Меняются проверки хода работы: слово «стоп» больше не отпускает ход, агента останавливает Esc, ожидание своей фоновой задачи держится до 90 минут, меню застревания предлагает «отложить RT-N» и «подскажу путь».

## Points

- **A:** «стоп» владельца отпускает каждый ход до следующего слова владельца, даже ход, который
  будит уведомление фоновой задачи. 20.11 после «стоп» в 16:37 сессию будили 7 раз, она сделала 44
  вызова. Владелец 22.11 сказал, что команда, которая даёт право ничего не делать, не нужна. Нужно
  право дождаться CI или долгого процесса и продолжить текущий шаг. Сейчас ожидание своей фоновой
  задачи держится 20 минут. С 14.11 дольше шли 57 задач из 810, набор перед push — до 55 минут.
  Слежение за CI ожиданием не считается. Модельная проверка `turn-judge` отказывает ходу «жду
  итога»: таких отказов не меньше 6 из 70.
- **This task reaches:** «стоп» ход не отпускает и из меню ушёл; после Esc уведомление не будит
  работу до следующего слова владельца. Агент ждёт свою фоновую задачу до 90 минут, включая слежение
  за CI. Ход ожидания не отказывает ни движок, ни `turn-judge`. По уведомлению агент читает итог и
  продолжает шаг. Зависшую задачу удержание называет. В меню застревания — «отложить RT-N» и
  «подскажу путь».
- **Sign:** сценарии набора:
  - «стоп» на ветке в `этап-идёт` с несделанным шагом держит ход через хук;
  - после Esc ход отпускается;
  - фоновая задача 58 минут отпускает остановку, 91 минута — нет, и удержание называет задачу;
  - уведомление, прочитанное вызовом, без шага держит остановку и называет шаг;
  - слежение за CI отпускает остановку как ожидание;
  - меню называет два новых варианта.

  Слов остановки в движке, правилах и описаниях пакета — 0. Видит исполнитель, числа в ходе работы.
- **Milestone G of the epic:** за рабочий день отказов меньше пяти на сто вызовов и ни одного
  тупика. По прогнозу задача снимает 17 удержанных остановок за 14–22.11, около 0,07 на сто. Ещё она
  снимает отказы `turn-judge` на ожидании. Удаление слова — решение владельца, на долю отказов
  оно не влияет.
- **Metric:** удержанные остановки прогноза за 14–22.11: 169 → 152
  (`node tools/task-flow-script.mjs forecast --days 8 --until 2026-11-22`).

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/task-flow/flow.js` — случаи `stopWord` и `interrupted`, слова `stop`, `stopExcept`, `holdAfter`, `menu` |
| Code (правится) | `projects/agent-kit/assets/task-flow/flow.md` |
| Code (правится) | `projects/agent-kit/assets/task-flow/measure/session.mjs` — `BACKGROUND_BOUND`, исключение CI, серверы, зависшая задача |
| Code (правится) | `projects/agent-kit/assets/task-flow/measure/owner.mjs` — `saidStop` уходит, `interrupted` приходит |
| Code (правится) | `projects/agent-kit/assets/task-flow/measure/ci.mjs` — свежая голова после слова остановки |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/owner.mjs` |
| Code (правится) | `projects/agent-kit/assets/checks/flow-data.mjs` — `saysStop`, `WORD_KEYS` |
| Code (правится) | `projects/agent-kit/assets/checks/task-flow-script.mjs`, `projects/agent-kit/assets/checks/flow-forecast.mjs`, `projects/agent-kit/assets/checks/check-turn-map.mjs` |
| Code (правится) | `projects/agent-kit/assets/checks/flow-verdict.mjs` — меню, строка зависшей задачи |
| Code (правится) | `projects/agent-kit/assets/hooks/turn-exit-guard.sh`, `projects/agent-kit/assets/hooks/turn-judge.md`, `projects/agent-kit/assets/hooks/ask-judge.md` |
| Code (правится) | `projects/agent-kit/tests/` — наборы выхода из хода, чужого отказа, шагов, языка описания, записанных сценариев, прогноза, карты хода, входа в ход; `turn-replay-lib.mjs` и записи `fixtures/turn-replay/` |
| Rules | `projects/agent-kit/assets/rules/turn-conduct.md`, `projects/agent-kit/assets/rules/autonomous-work.md`, `projects/agent-kit/assets/defaults/turn-map.md`, `projects/agent-kit/assets/commands/night.md`, `projects/agent-kit/assets/pitfalls/`, `projects/agent-kit/assets/docs/GLOSSARY.md`; `.claude/skills/{turn-conduct,autonomous-work,task-flow-owner}/implementation.md` |
| Specs | `docs/specs/agent-kit/turn-guards/` — `flow-script/{exit,exit-ci,language,replay,metric}/`, `flow-script/scenarios.md`, `mission/`, `scenarios.md`; `docs/specs/agent-kit/work-steps/implementation.md` |
| Plan of the epic | `docs/plans/checks-rework-4.md` — строка 7 и точка B |

## What counts as done

- Ожидание своей фоновой задачи держится 90 минут. Задача старше — зависшая: остановка держится, и
  удержание называет задачу и её возраст. Слежение за CI — ожидание. Сервер (`serve:*`,
  `storybook`) — не ожидание.
- После прочитанного уведомления остановка без шага держится и называет текущий шаг.
- Случая `stopWord`, меры `measure.owner.saidStop`, `saysStop` и слов `stop`, `stopExcept`,
  `holdAfter` нет. Удержание CI не читает слово владельца.
- Случай `interrupted` отпускает ход, когда последнее слово владельца — отметка прерывания Esc.
- «стоп» в `этап-идёт` с несделанным шагом через хук держит ход и называет следующий шаг.
- Меню застревания и простоя — «отложить RT-N», «подскажу путь». Удержание просит путь в свободном
  поле того же меню. `ask-judge` пропускает ровно эти два варианта и один вопрос со свободным полем
  после «подскажу путь» без текста.
- `turn-judge` отпускает ход, пока идёт фоновая задача этого хода, а ответ называет её и шаг; списка
  слов остановки в нём нет.
- Правила, команда ночи, словарь и описания называют Esc вместо «стоп»; разложенные копии сходятся
  с пакетом.

## Stages

### 1. The wait holds to the bound of a hung task

Rules: a background task of the session, a CI watch included, releases the stop up to 90 minutes;
an older one is hung and named; a server is no wait; a read notice with no step holds the stop.

- **Steps:**
    1. The bound of the wait is 90 minutes, and the hold names a hung task
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1838'` → >= 3
    2. A CI watch is a wait, a server is none
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1840'` → >= 2
    3. A read notice with no step holds the stop and names the step
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1841'` → >= 2
- **Readiness sign:** the scenarios ok; SC-AK-1762 names 90 minutes; the suite ends with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard.test.sh` — exit 0.

### 2. The stop word releases nothing, Esc does

Rules: no release case and no check reads a stop word; «стоп» in a stage with undone steps holds
the turn; the interrupt mark of Esc releases the turns until the owner's next word.

- **Steps:**
    1. The hook on a branch in `этап-идёт` holds the turn after «стоп» and releases it after Esc
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1839'` → >= 4
    2. The engine and its tests hold no stop word
       Check: `grep -rlE 'saidStop|saysStop|stopWord|stopExcept|holdAfter|a stop word of the owner' projects/agent-kit docs/specs .claude/skills/*/implementation.md --exclude-dir=fixtures --exclude-dir=node_modules | wc -l` → = 0
- **Readiness sign:** the scenarios ok; the suites of the exit guard, the steps, the language, the
  replay and the forecast end with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/turn-replay.test.sh` — exit 0.

### 3. The stuck menu and the model checks

Rules: the menu offers «отложить RT-N» and «подскажу путь», and the way goes into its free field;
`turn-judge` lets a wait end a turn and knows no stop word.

- **Steps:**
    1. The hold names the new menu and the free field
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard-foreign.test.sh 2>&1 | grep -c 'ok .*SC-AK-1842'` → >= 2
    2. The model checks name the new menu and no stop word
       Check: `grep -l -E '«стоп»|«хватит»|«не сейчас»|«потом»|«подожди»' projects/agent-kit/assets/hooks/ask-judge.md projects/agent-kit/assets/hooks/turn-judge.md | wc -l` → = 0
    3. `turn-judge` lets a turn end on a wait for its own background task
       Check: `grep -c -i 'background task' projects/agent-kit/assets/hooks/turn-judge.md` → >= 1
- **Readiness sign:** the scenario ok, no stop word in the two model checks, the wait named.
- **Verified by:** `bash projects/agent-kit/tests/turn-replay.test.sh` — exit 0.

### 4. The texts

Rules: the rules, the night command and the glossary name Esc and the bound of 90 minutes; the
descriptions hold the new scenarios and no removed one.

- **Steps:**
    1. The rules and the texts of the package name no stop word and no bound of twenty minutes
       Check: `grep -rlE 'stop word|«стоп»|twenty minutes|20 minutes' projects/agent-kit/assets/rules projects/agent-kit/assets/defaults projects/agent-kit/assets/commands projects/agent-kit/assets/pitfalls projects/agent-kit/assets/docs | wc -l` → = 0
    2. The descriptions hold no removed scenario
       Check: `grep -rlE 'SC-AK-(1429|1505|1516|1813)\b' docs/specs projects/agent-kit/tests | wc -l` → = 0
- **Readiness sign:** `node tools/check-specs.mjs`, `npm run -s check:spec-coverage` and
  `pnpm run -s agent-kit:check` exit 0.
- **Verified by:** `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- Не трогает слова толчка `words.nudge`: «продолжай», «почему стоишь» — не слово остановки.
- Не правит `conscience-guard`, `cargo-mark-guard` и проверку черновика: слово владельца они не
  читают.
- Не меняет порядок удержания CI и случаев отпуска.
- Не сохраняет мягкую остановку «на логической точке»: Esc её не умеет, она уходит вместе со словом.
