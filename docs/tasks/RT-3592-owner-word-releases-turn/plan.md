# Plan

**Task:** RT-3592 · **Branch:** RT-3592-owner-word-releases-turn
**Behaviour:** unchanged — правится движок задач пакета, код приложений не трогается; слово владельца: «исправляй это ебаное говно сейчас»

## Points

- **A:** кит 0.39 (коммит `7fa326285`, RT-3419) убрал отпуск хода словом владельца. Владелец пишет
  «стоп», а проверка выхода держит ход дальше и требует меню. Отпускает только Esc. Правило
  `turn-conduct`, карта хода и судья хода говорят то же: «No typed word stops the work».
- **This task reaches:** последнее слово владельца со словом остановки снова отпускает ход, как в
  0.38: и случаем отпуска, и удержанием свежего запуска CI. Esc отпускает тоже. «хватит
  останавливаться, продолжай» ход не отпускает. Правило, карта хода и судья хода говорят то же,
  что движок.
- **Sign:** случаи наборов проверки выхода, записанных ходов и языка описания.
- **Milestone G of the epic:** эпик RT-3590 — патч-версия кита с правками эпика в npm, коммит
  `fix(rt:agent-kit): … (RT-3592)`.
- **Metric:** записанные сообщения остановки, после которых ход держится: 15.11 и 22.11 было 7
  из 7, ждём 0. `saysStop` 0.38, прогнанный 24.11 по этим текстам, отпускает все 7. Команда:
  `VERBOSE=1 bash projects/agent-kit/tests/turn-replay.test.sh 2>&1 | grep -cE '^  ok +[a-z-]+: SC-AK-1913'` → 7.

## Task footprint

| What | Where |
| ---- | ----- |
| Code (правится) | `projects/agent-kit/assets/task-flow/flow.js`, `projects/agent-kit/assets/task-flow/flow.md`, `projects/agent-kit/assets/task-flow/measure/owner.mjs`, `projects/agent-kit/assets/task-flow/measure/ci.mjs`, `projects/agent-kit/assets/checks/flow-data.mjs`, `projects/agent-kit/assets/checks/task-flow-script.mjs`, `projects/agent-kit/assets/checks/flow-forecast.mjs`, `projects/agent-kit/assets/checks/check-turn-map.mjs`, `projects/agent-kit/assets/hooks/turn-judge.md` |
| Rules (правится) | `projects/agent-kit/assets/rules/turn-conduct.md`, `projects/agent-kit/assets/defaults/turn-map.md`, `projects/agent-kit/assets/rules/autonomous-work.md`, `projects/agent-kit/assets/commands/night.md`, `projects/agent-kit/assets/pitfalls/task-flow-resume.md` |
| Mission (правится) | `docs/specs/agent-kit/turn-guards/mission/`, `docs/specs/agent-kit/turn-guards/spec.md`, `docs/specs/agent-kit/work-steps/` |
| Tests (правится) | `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/turn-replay.test.sh`, `projects/agent-kit/tests/flow-language.test.sh`, `projects/agent-kit/tests/checks-turn-map.test.sh` |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/exit/`, `docs/specs/agent-kit/turn-guards/flow-script/exit-ci/`, `docs/specs/agent-kit/turn-guards/flow-script/replay/` |
| Layout (правится) | `tools/task-flow/`, `tools/*.mjs` движка, `.claude/hooks/turn-judge.md`, `.claude/skills/turn-conduct/SKILL.md`, `.claude/rt-kit/defaults/turn-map.md` |

## What counts as done

- Случай отпуска `stopWord` стоит в описании сценария рядом с `interrupted`. Мера
  `measure.owner.saidStop`, функция `saysStop` и слова `stop`, `stopExcept`, `holdAfter` — те же,
  что в 0.38. Движок передаёт `saysStop` мерам, прогноз читает меру из записи.
- «Стоп, на сегодня хватит» отпускает; «хватит останавливаться, продолжай» и «Стой, не туда —
  делай RT-12» держат; Esc отпускает по-прежнему.
- Слово остановки снимает удержание свежей вершины без запуска CI; красный запуск держит ход до
  чтения и после слова.
- Семь записанных сообщений остановки (1548-*, 1457, 1458) отпускают ход.
- Ключи `stop`, `stopExcept`, `holdAfter` снова законны в описании сценария: список снятых
  ключей `RETIRED_WORD_KEYS` и его пропуск в `checkWords` убраны.
- Правило `turn-conduct`, карта хода, проверка карты и судья хода называют слово остановки выходом
  хода рядом с Esc; фразы «No typed word stops the work» и «A word of the owner does not stop the
  work» убраны. Судья хода снова отпускает ход по случаю 0.38: «стоп», «хватит», «не сейчас»,
  «потом», «подожди», отказ в ответе на вопрос.
- Статья миссии «Only the owner's Esc ends a turn» с выбором владельца 22.11 «Ожидание и убрать
  «стоп»» заменена статьёй «слово остановки или Esc» с решением владельца 24.11, которым он
  одобряет этот план. Правило спека записанных ходов «releases no turn» для 1457, 1458 и 1548
  обращено. Правило ночи, команда `/night` и ловушки `task-flow-resume` называют слово остановки
  рядом с Esc. Спек шагов работы (статья и SC-AK-1014) и шаг проверки миссии о «стоп», который
  «держит работу», говорят то же.

## Stages

### 1. Слово остановки отпускает ход

- **Steps:**
    1. Случай отпуска по слову остановки в описании сценария
       Check: `grep -c 'stopWord:' projects/agent-kit/assets/task-flow/flow.js | tr -d ' '` → = 1
    2. Случаи набора проверки выхода
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -cE '^  ok +[a-z-]+: SC-AK-1912' | tr -d ' '` → = 7
    3. Записанные ходы остановки отпускаются
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-replay.test.sh 2>&1 | grep -cE '^  ok +[a-z-]+: SC-AK-1913' | tr -d ' '` → = 7
    4. Ключи слов остановки законны в описании
       Check: `grep -c 'RETIRED_WORD_KEYS' projects/agent-kit/assets/checks/flow-data.mjs | tr -d ' '` → = 0
- **Readiness sign:** наборы проверки выхода, записанных ходов и языка описания без провалов.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard.test.sh`,
  `bash projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`,
  `bash projects/agent-kit/tests/turn-replay.test.sh`,
  `bash projects/agent-kit/tests/flow-language.test.sh`,
  `bash projects/agent-kit/tests/task-flow-script.test.sh`,
  `bash projects/agent-kit/tests/task-flow-script-forecast.test.sh` — 0 провалов.

### 2. Правило, карта, судья, спек и раскладка

- **Steps:**
    1. Правило хода называет слово остановки выходом
       Check: `grep -c 'No typed word stops the work' projects/agent-kit/assets/rules/turn-conduct.md | tr -d ' '` → = 0
    2. Проверка карты хода знает выход по слову
       Check: `grep -c 'a stop word of the owner' projects/agent-kit/assets/checks/check-turn-map.mjs | tr -d ' '` → = 1
    3. Карта хода называет выход по слову
       Check: `grep -c 'a stop word of the owner' projects/agent-kit/assets/defaults/turn-map.md | tr -d ' '` → >= 1
    4. Судья хода знает слово остановки
       Check: `grep -c "The owner's latest word says to stop or to wait" projects/agent-kit/assets/hooks/turn-judge.md | tr -d ' '` → = 1
    5. Случаи в спеке выхода
       Check: `grep -c 'SC-AK-1912' docs/specs/agent-kit/turn-guards/flow-script/exit/scenarios.md | tr -d ' '` → = 1
    6. Случаи в спеке записанных ходов
       Check: `grep -c 'SC-AK-1913' docs/specs/agent-kit/turn-guards/flow-script/replay/scenarios.md | tr -d ' '` → = 1
    7. Пакет разложен в дерево
       Check: `grep -c 'stopWord:' tools/task-flow/flow.js | tr -d ' '` → = 1
    8. Миссия называет слово остановки
       Check: `grep -c "Only the owner's Esc ends a turn" docs/specs/agent-kit/turn-guards/mission/spec.md | tr -d ' '` → = 0
    9. Правило записанных ходов обращено
       Check: `grep -c 'releases no turn' docs/specs/agent-kit/turn-guards/flow-script/replay/spec.md | tr -d ' '` → = 0
    10. Правило ночи, команда ночи и ловушки возврата называют слово остановки
       Check: `grep -l 'stop word' projects/agent-kit/assets/rules/autonomous-work.md projects/agent-kit/assets/commands/night.md projects/agent-kit/assets/pitfalls/task-flow-resume.md | wc -l | tr -d ' '` → = 3
    11. Спек шагов работы называет слово остановки
       Check: `grep -c "Only the owner's Esc lifts the refusal" docs/specs/agent-kit/work-steps/spec.md | tr -d ' '` → = 0
- **Readiness sign:** правило, карта, судья, спек и раскладка совпадают с кодом.
- **Verified by:** `bash projects/agent-kit/tests/checks-turn-map.test.sh` — 0 провалов;
  `node tools/check-specs.mjs`, `node tools/check-file-size.mjs` и
  `node dist/agent-kit/bin/agent-kit.js sync --check` — без отказов.

## What this work does not do

- Меню застревания без свободного поля и вариант «стоп» в нём — RT-3593: меню, `flow-verdict.mjs`
  и пункт меню в `ask-judge.md` правятся там одной задачей.
- Ночь без меню — RT-3584.
