# Plan

**Task:** RT-3425 · **Branch:** RT-3425-flow-reads-branch-line
**Behaviour:** unchanged — код приложений не меняется. Меняется источник истории движка хода работы: влитая база не откатывает разобранную задачу.

## Points

- **A:** 19.11 на RT-3276 после слияния ветки эпика в ветку задачи движок откатил задачу из
  «папка-разобрана» в «этап-идёт», хотя папка разобрана и PR открыт. В ветке эпика лежала старая
  копия папки, где шаг 3.4 ещё не сделан, а `lastVersion` берёт файл у самого нового коммита, где
  он есть, — у коммита влитой ветки. Проверка конца хода держала ход на шаге, сделанном давно.
  Слияние ветки эпика в ветки задач по правилу `git-workflow` идёт регулярно.
- **This task reaches:** после слияния базы со старой папкой и после перемотки ветки на базу
  состояние задачи не ниже «папка-разобрана»: последняя версия файла, которого нет у вершины,
  читается у родителя коммита, который его удалил в этой ветке.
- **Sign:** сценарии движка на настоящих репозиториях: обычное слияние базы со старой папкой,
  перемотка на базу, удаление старой копии в самой базе — во всех трёх состояние не ниже
  «папка-разобрана», выходы соглашения, следа, разбора и плана выполнены. Видит исполнитель, числа
  в ходе работы.
- **Milestone G of the epic:** за рабочий день отказов меньше пяти на сто вызовов и ни одного
  тупика. Долю отказов задача не двигает: по записям 14–19.11 такое слияние было одно (19.11,
  RT-3276), и после него на ветке не было ни одного отказа конца хода. Задача снимает будущий
  тупик: в цепочке веток эпика база вливается в каждую ветку задачи, и отказ шага RT-3434 после
  такого слияния читает старый ход работы.
- **Metric:** нет: ремонт — движок читал ход работы из влитой базы и откатывал разобранную задачу.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/git.mjs` — `removedAt` из RT-3434, `lastVersion`, `everExisted` |
| Code (правится) | `projects/agent-kit/assets/checks/flow-step.mjs` — `prepareStep` и `runBeforePull` зовут `removedAt` |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/implementation.md` — строка об истории ветки |
| Code (правится) | `projects/agent-kit/tests/task-flow-script-merge.test.sh` — новый набор, подключён из `task-flow-script.test.sh` |
| Code (правится) | `projects/agent-kit/tests/task-flow-script.test.sh` |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/`                |
| Rules | `.claude/skills/task-flow/`, `.claude/skills/git-workflow/` — читаются |

## What counts as done

- `removedAt(path)` ищет коммит, который удалил файл, так: `git log -1 --diff-filter=D HEAD
  --not origin/main -- <путь>` с упрощением истории по умолчанию, а если ответ пуст — то же с
  `--full-history`. Обход списка коммитов по дате не используется: он берёт удаление старой копии в
  базе. Поиск не выходит за историю ветки, как и остальное чтение движка.
- Последняя версия файла, которого нет у вершины, читается у родителя найденного коммита; файл у
  вершины читается как прежде.
- `everExisted` отвечает тем же поиском: путь, который жил только в ветке задачи, найден и после
  перемотки.
- Команда шага и перемер перед PR зовут `removedAt`: правило стоит в одном месте. `step N.M` на
  разобранной папке после влитой базы со старой папкой меряет шаг по своему ходу работы.
- Строка описания об истории ветки называет этот поиск.
- После обычного слияния базы со старой копией папки, после перемотки ветки на базу и после
  удаления старой копии в самой базе состояние разобранной задачи не ниже «папка-разобрана».
- Выходы соглашения, следа, разбора и плана после слияния и после перемотки остаются выполненными.
- Описание держит сценарии; разложенные копии сходятся с пакетом.

## Stages

### 1. The last version of a removed file is read before its removal

Rules: the commit that removed a file is found by the path search of `git log` from the head with
the default history simplification, and by the full history when that is empty, inside the history
of the branch; the last version is read at its parent; the history readers and the folder restore
call the same search.

- **Steps:**
    1. The last version of a file the head does not hold is read at the parent of the commit that removed it
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c 'ok .*SC-AK-1827'` → >= 3
    2. A merged base, a fast-forward and a removal in the base do not roll the state below «папка-разобрана»
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c 'ok .*SC-AK-1828'` → >= 3
    3. The step command on a taken-apart folder after a merged base measures the step by the branch's own progress
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1 | grep -c 'ok .*SC-AK-1829'` → >= 2
- **Readiness sign:** the three scenarios ok on real repositories, the suite ends with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — exit 0.

### 2. The description

Rules: the scenarios stand in the description of the flow script, bound to the code.

- **Steps:**
    1. The scenarios stand in the description
       Check: `grep -c -E '^### SC-AK-182[7-9]' docs/specs/agent-kit/turn-guards/flow-script/scenarios.md` → = 3
- **Readiness sign:** `node tools/check-specs.mjs` and `npm run -s check:spec-coverage` exit 0.
- **Verified by:** `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- Не меняет список коммитов, который читают другие измерители: меняется только поиск последней
  версии удалённого файла.
- Не судит конфликт «изменено в базе / удалено в ветке», разрешённый сохранением старой папки:
  папка тогда снова лежит у вершины, и движок читает её как живую.
- Не учит двойник истории слияниям: сценарии идут на настоящих репозиториях.
- Не чинит ложный проход выходов следа и хода работы после влитой базы: `measure/footprint.mjs`
  считает изменёнными и коммиты, пришедшие с базой. Это находка рядом с планом эпика.
