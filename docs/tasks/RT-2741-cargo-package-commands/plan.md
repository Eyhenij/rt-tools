# Plan

**Task:** RT-2741 · **Branch:** RT-2741-cargo-package-commands
**Spec:** `docs/specs/agent-kit/observations/cargo/` (отправка), `docs/specs/agent-kit/cargo-mark/` (метка), `docs/specs/agent-kit/work/queue-check/` (заведение), `docs/specs/agent-kit/board/` (выкатка)
**Behaviour:** changes

После записи этот файл не правится. Пересмотр этапа идёт в `progress.md` как решение по ходу.

## Task footprint

| What  | Where                                                                                                                                                                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/cargo-mark/`, `docs/specs/agent-kit/observations/cargo/`, `docs/specs/agent-kit/work/queue-check/`, `docs/specs/agent-kit/board/`                                                                                                    |
| Laws  | нет                                                                                                                                                                                                                                                        |
| Rules | `.claude/skills/deploy-flow/implementation.md` (пункт о ложном отставании снимается)                                                                                                                                                                       |
| Code  | `projects/agent-kit/src/lib/proposals.ts`, `projects/agent-kit/src/lib/shipment.ts`, `projects/agent-kit/assets/checks/board-runs.github.mjs`, `projects/agent-kit/assets/checks/board.github.mjs`, `projects/agent-kit/assets/checks/task-new.github.mjs` |

## What counts as done

- Метка «отбито» с той же причиной в блок второй раз не пишется; блок, отбитый повторно по той же причине, остаётся с одной меткой.
- Наблюдения уходят по одному дню на запрос; отказ одного дня не останавливает предложения и разборы.
- Последняя успешная выкатка берётся из двадцати последних прогонов без фильтра по статусу.
- Заведение задачи читает карточку прямым запросом `projectItems` по задаче; «NO» печатается только после окна около 30 секунд, и строка называет число секунд.
- Каждое поведение имеет сценарий с новым номером и тест с этим номером в названии; наборы `pnpm run check:all` зелёные.

## Stages

### 1. Метка «отбито» не повторяется

- **Steps:**
    1. Тест: блок, отбитый дважды по одной причине, несёт одну метку
    2. Правка `markSent`: такая же метка в блоке не добавляется
    3. Сценарий в описании метки и привязка
- **Readiness sign:** набор `proposals.spec.ts` зелёный, повторный вызов оставляет одну метку
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit --testFile=projects/agent-kit/src/lib/proposals.spec.ts` — все тесты файла прошли

### 2. Наблюдения уходят по дню

- **Steps:**
    1. Тест: груз из трёх дней даёт три отправки наблюдений, пустой груз — ни одной
    2. Правка `shipmentsOf`: отправка на каждый день
    3. Тест: отказ одного дня не останавливает остальные отправки
    4. Сценарий в описании груза и привязка
- **Readiness sign:** набор `shipment.spec.ts` зелёный
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit --testFile=projects/agent-kit/src/lib/shipment.spec.ts` — все тесты файла прошли

### 3. Выкатка читается без фильтра

- **Steps:**
    1. Тест: подмена `gh` отдаёт на запрос с фильтром месячный прогон, без фильтра — свежий; отставание считается по свежему
    2. Правка `deployLag`: двадцать последних прогонов, первый успешный
    3. Сценарий в описании доски и привязка, пункт о ложном отставании в сопровождении правила выкатки снят
- **Readiness sign:** набор долгой работы доски зелёный
- **Verified by:** `bash projects/agent-kit/tests/checks-board-long-work.test.sh` — ноль провалов

### 4. Заведение читает карточку прямо

- **Steps:**
    1. Тест: прямое чтение называет столбец карточки и не читает весь список
    2. Правка `board.github.mjs`: чтение карточки через `projectItems`
    3. Тест: «NO» не печатается внутри окна, после окна печатается со строкой о секундах
    4. Правка `task-new.github.mjs`: окно с нарастающей паузой, около 30 секунд
    5. Сценарий в описании проверки очереди и привязка
- **Readiness sign:** тесты заведения зелёные, внутри окна карточка, появившаяся на второй попытке, считается найденной
- **Verified by:** `bash projects/agent-kit/tests/task-new-epic.test.sh` — ноль провалов

### 5. Закрытие

- **Steps:**
    1. Раскладка и проверки дерева
    2. Отметка четырёх записей в приёме
- **Readiness sign:** раскладка сходится, проверки дерева без новых замечаний
- **Verified by:** `pnpm run agent-kit:check` — «разложенное сходится с пакетом»

## What this work does not do

- Выпуск новой версии пакета: решает владелец отдельным запуском.
- Правка других проверок очереди: читает их та же команда, но записи о них не приходили.
