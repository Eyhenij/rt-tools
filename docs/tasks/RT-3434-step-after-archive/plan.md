# Plan

**Task:** RT-3434 · **Branch:** RT-3434-step-after-archive
**Behaviour:** unchanged — код приложений не меняется. Меняется движок хода работы пакета правил: команда шага меряет шаг и после разбора папки задачи, перемер перед PR не снимает отметку с первого расхождения, а шаг, который не совпадает стабильно, получает выполнимый ход.

## Points

- **A:** 19.11 на RT-3417 перемер перед PR снял отметки с двух шагов: у 2.2 ответ модели разошёлся
  один раз из шести, у 3.1 счёт живых запусков сбросил коммит второго круга. Папка задачи к этой
  минуте уже разобрана, и `step 2.2` отказал: «the task folder differs from the commit of the
  plan». Движок назвал состояние «этап-идёт» и на каждом конце хода велел добить этап командой,
  которая отказывает, — тупик. Отказ конца хода без папки пишет «`step N.M`» без номера шага.
- **This task reaches:** на ветке с разобранной папкой и снятой отметкой `step N.M` меряет шаг по
  плану из коммита плана и ставит отметку. Перед PR несовпавший шаг меряется ещё раз и теряет
  отметку только на втором расхождении. Шаг, который не совпадает и во второй раз, получает ход,
  который можно сделать: вернуть папку коммитом отмены разбора. Отказ конца хода называет номер
  шага и без папки.
- **Sign:** сценарии набора движка: ветка с разобранной папкой и снятой отметкой, `step N.M` ставит
  отметку; шаг, который не совпадает стабильно, получает ход `git revert <коммит разбора>`, и
  проверки его не отказывают; старт движка во время живого запуска папку не трогает. Видит
  исполнитель, числа в ходе работы.
- **Milestone G of the epic:** за рабочий день отказов меньше пяти на сто вызовов и ни одного
  тупика. Задача снимает тупик «этап-идёт» после разбора папки; её доля в тупиках
  `turn-exit-guard` будет видна в строке тупиков по проверкам, которую добавляет RT-3423.
- **Metric:** нет: ремонт — команда шага отказывала на разобранной папке, и ход вёл в тупик.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/git.mjs` — `removedAt(path)`: коммит, который удалил путь в этой ветке |
| Code (правится) | `projects/agent-kit/assets/checks/flow-step.mjs` — общая функция возврата папки, `prepareStep`, `runBeforePull`, строка шага |
| Code (правится) | `projects/agent-kit/assets/checks/task-flow-script.mjs` — очистка прерванного запуска, ход работы для отказа без папки |
| Code (правится) | `projects/agent-kit/assets/checks/flow-verdict.mjs` — ход для шага, который не совпадает стабильно |
| Code (правится) | `projects/agent-kit/tests/task-flow-script-archive.test.sh` — новый набор, подключён из `task-flow-script.test.sh` |
| Code (правится) | `projects/agent-kit/tests/task-flow-script.test.sh` |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/step-mark/`, `docs/specs/agent-kit/turn-guards/flow-script/exit/` |
| Rules | `.claude/skills/task-flow/`, `.claude/skills/agent-kit-source/` — читаются |

## What counts as done

- Одна функция возвращает разобранную папку из истории на время запуска — файлы у родителя
  коммита, который её удалил. Её зовут команда шага и перемер перед PR. Сам коммит находит
  `removedAt(path)` источника истории — тот же поиск, что сегодня стоит в `runBeforePull`
  (`git log -1 --diff-filter=D HEAD -- <путь>`), и функция отдаёт его sha. RT-3425 правит поиск в
  этом одном месте и переводит на него `lastVersion`.
- Команда шага на разобранной папке меряет шаг с ходом работы той версии, при которой шаг меряли, и
  пишет отметку совпавшего запуска.
- Шаг, который история не отмечает сделанным, на разобранной папке отказан с ходом
  `git revert <коммит разбора>`; проверка шагов этот ход не отказывает.
- Запись о возврате лежит в каталоге git своей копии и несёт номер процесса и корень копии. Старт
  движка убирает папку, только когда процесса нет, папки нет у вершины и текст файлов совпадает с
  возвращённым. Старт во время живого запуска папку не трогает.
- Перед PR несовпавшие шаги идут второй раз по тем же группам версий хода работы, пока остаётся
  бюджет 1500 с от начала перемера; шаг, вышедший за предел, повторно не идёт. Отметку теряет шаг,
  не совпавший дважды.
- Шаг, не совпавший дважды на разобранной папке, получает в отказе ход `git revert <коммит
  разбора>`: вернуть папку, поправить проверку или шаг и разобрать папку снова.
- Строка несовпавшего шага называет команду проверки и три последние строки вывода и, если он не
  пуст, три последние строки потока ошибок.
- Отказ конца хода без папки читает ход работы из истории и называет номер шага без отметки
  «совпало».
- Описания держат сценарии; разложенные копии сходятся с пакетом.

## Stages

### 1. The step command measures a step after the folder is taken apart

Rules: one function puts a taken-apart folder back for the run; the command of a step writes the
mark; a step the history does not mark done gets a move that can be made; a broken run is cleaned
only when its process is gone.

- **Steps:**
    1. The step command on a taken-apart folder puts it back, measures the step and writes the mark
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c 'ok .*SC-AK-1822'` → >= 1
    2. A step the history does not mark done is refused with a move the step guard lets through
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c 'ok .*SC-AK-1823'` → >= 2
    3. A start of the engine cleans a folder of a dead run and leaves the folder of a live one
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c 'ok .*SC-AK-1824'` → >= 2
- **Readiness sign:** the three scenarios ok, the suite ends with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — exit 0.

### 2. The rerun before a PR keeps a mark on one mismatch

Rules: a step that did not match is run once more by its group within the budget and loses its mark
on the second mismatch; a step that fails twice gets a move that can be made; the line of an
unmatched step names its command and the last lines of its output and errors.

- **Steps:**
    1. A step that did not match before a PR is run again and loses its mark only on the second mismatch
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c 'ok .*SC-AK-1825'` → >= 2
    2. The line of an unmatched step names the command and the last lines of its output and errors
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c 'ok .*SC-AK-1826'` → >= 1
    3. A step that fails twice on a taken-apart folder gets the revert move, and the exit refusal names its number
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c 'ok .*SC-AK-1833'` → >= 2
- **Readiness sign:** the three scenarios ok; the state measured after both marks are back is not
  «этап-идёт».
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — exit 0.

### 3. The description

Rules: the scenarios stand in the descriptions of the step mark and of the exit guard, bound to the
code.

- **Steps:**
    1. The scenarios stand in the descriptions
       Check: `cat docs/specs/agent-kit/turn-guards/flow-script/step-mark/scenarios.md docs/specs/agent-kit/turn-guards/flow-script/exit/scenarios.md | grep -c -E '^### SC-AK-18(2[2-6]|33)'` → = 6
- **Readiness sign:** `node tools/check-specs.mjs` and `npm run -s check:spec-coverage` exit 0.
- **Verified by:** `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- Не учит план предупреждать о шагах с моделью или живым счётом: шаг, который не совпадает
  дважды, получает выполнимый ход.
- Не меняет предел времени шага (540 с) и хука перемера (1800 с).
- Не меняет поиск коммита, который удалил папку: функция `removedAt` переносит сегодняшний поиск
  как есть, его правит RT-3425. До слияния RT-3425 отказ «шаг, который история не отмечает
  сделанным» после влитой базы со старой папкой читает старый ход работы — это тупик RT-3425.
