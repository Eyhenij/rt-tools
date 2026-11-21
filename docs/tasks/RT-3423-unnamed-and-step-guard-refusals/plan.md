# Plan

**Task:** RT-3423 · **Branch:** RT-3423-unnamed-and-step-guard-refusals
**Behaviour:** unchanged — код приложений не меняется. Меняются проверки пакета правил, их отчёт и описания: отказ без имени получает имя проверки, отчёт делит тупики по проверкам и судит веху эпика, ложные отказы проверки шагов и модельных проверок снимаются.

## Points

- **A:** веха эпика RT-3471 не достигнута ни в один день 15–21.11: отчёт
  `tools/work-result.mjs --until 2026-11-21 --days 7` даёт 4,86–22,82 отказа на сто вызовов и 4–11
  тупиков в день, 48 за неделю. Тупики отчёт не делит по проверкам, а веху «три рабочих дня подряд
  от 1500 вызовов» не судит никто. Из 555 отказов без имени в записях 199 — сломанный диспетчер
  хуков 20.11 (маркеры конфликта в `.claude/hooks/dispatch.sh`), 229 — модельная проверка, которая
  не нашла или не прочла свой файл. Проверка шагов дала 39 ложных отказов из 79 прочитанных за
  15–19.11, все на командах оболочки, которые не пишут в охраняемый файл.
- **This task reaches:** отчёт печатает тупики по проверкам и суждение о вехе: три дня подряд от
  1500 вызовов, в каждом меньше пяти отказов на сто и ни одного тупика. Отказ без имени получает
  имя проверки по тексту. Модельная проверка без своего файла пропускает вызов. Проверка шагов
  отказывает команде оболочки, только когда команда пишет в охраняемый файл.
- **Sign:** отчёт за 15–21.11 печатает строку тупиков по проверкам и строку вехи «не достигнута»;
  сценарии наборов на ложных и верных командах из записей дают пропуск и отказ слово в слово. Видит
  исполнитель, числа в ходе работы.
- **Milestone G of the epic:** за рабочий день отказов меньше пяти на сто вызовов и ни одного
  тупика, три дня подряд от 1500 вызовов. Задача делает веху измеримой и снимает две причины
  отказов. Пропуск модельной проверки без файла снимает до 1,5 отказа на сто в дни её сбоя (16.11,
  20.11); сужение проверки шагов — около 0,2–0,6 на сто в день. Имя отказа долю не меняет.
- **Metric:** отказы на сто вызовов и тупики за день по отчёту, вниз; база 15–21.11 — 4,86–22,82
  на сто и 4–11 тупиков. Ложные отказы проверки шагов на командах из записей: 39, вниз до 0.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/checks/record-count.mjs` — таблица имён |
| Code (правится) | `projects/agent-kit/assets/checks/work-result.mjs` — тупики по проверкам, суждение о вехе, срок по умолчанию |
| Code (правится) | `projects/agent-kit/assets/checks/flow-guard.mjs` — признаки записи |
| Code (правится) | `projects/agent-kit/src/lib/agent-checks.ts` — слова вызова модельных проверок |
| Code (правится) | `projects/agent-kit/tests/record-count.test.sh`, `flow-step-guard.test.sh`, `real-record.test.sh` |
| Code (правится) | `projects/agent-kit/src/lib/hooks-map.spec.ts` |
| Specs | `docs/specs/agent-kit/rule-gate-delivery/`, `docs/specs/agent-kit/turn-guards/flow-script/guard/`, `docs/specs/agent-kit/work-result/`, `docs/specs/agent-kit/dispatch/` |
| Rules | `.claude/skills/turn-conduct/`, `.claude/skills/agent-kit-source/` — читаются |

## What counts as done

- Отчёт печатает за каждый день строку тупиков по проверкам: имя проверки и число серий.
- Отчёт печатает суждение о вехе: достигнута, когда три дня подряд в каждом не меньше 1500
  вызовов, меньше пяти отказов на сто и ни одного тупика; иначе — какой день и чем её не держит.
- Отчёт без `--until` берёт сегодняшний день.
- Таблица счётчика называет проверку по тексту отказа для каждого вида текста из записей: отказ
  проверки доставки и отправки без имени, проверки браузера, git, назначения дерева и документов,
  отказ модельной проверки без файла (`turn-judge`, `ask-judge`) и сбой диспетчера хуков
  (`dispatch-broken`). Имена действуют на днях после выкладки: наблюдения прошлых дней хранят
  только имя, и отчёт их не переименовывает.
- Слова вызова модельной проверки велят искать сам её файл `.claude/hooks/<имя>.md` вверх от
  каталога сессии; нет файла или чтение отказано — вызов проходит, ничего другого проверка не
  судит. Запись в настройках, которую раскладка не переписывает, удаляется и раскладывается заново.
- Проверка шагов отказывает команде оболочки, только когда она пишет в охраняемый файл. Чтение,
  запуск движка, импорт файла движка для чтения, `grep -ln`, `git restore --staged` и имя файла в
  тексте сообщения проходят. Сценарий интерпретатора отказан, когда в нём есть вызов записи и он
  называет охраняемый файл; сценарий без вызова записи проходит.
- Запись, чья цель — не путь буквой (путь, собранный в сценарии, копия в каталог), по-прежнему
  отказана, когда команда называет охраняемый файл.
- Описания держат сценарии; разложенные копии сходятся с пакетом.

## Stages

### 1. The report makes the milestone measurable

Rules: the report splits the dead ends by check and judges the milestone by three days in a row;
with no `--until` it takes today.

- **Steps:**
    1. The report prints the dead ends of a day by check
       Check: `VERBOSE=1 bash projects/agent-kit/tests/real-record.test.sh 2>&1 | grep -c 'ok .*SC-AK-1834'` → >= 1
    2. The report judges the milestone by three days in a row of at least 1500 calls
       Check: `VERBOSE=1 bash projects/agent-kit/tests/real-record.test.sh 2>&1 | grep -c 'ok .*SC-AK-1835'` → >= 2
    3. The report with no `--until` takes today
       Check: `VERBOSE=1 bash projects/agent-kit/tests/real-record.test.sh 2>&1 | grep -c 'ok .*SC-AK-1818'` → >= 1
- **Readiness sign:** the three scenarios ok, the suite ends with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/real-record.test.sh` — exit 0.

### 2. The counter names the check of every refusal text

Rules: a refusal text that names no check is named by its kind, the failure of a model check with
no file and the broken dispatcher included.

- **Steps:**
    1. The counter names the check of a refusal text with no name by its kind
       Check: `VERBOSE=1 bash projects/agent-kit/tests/record-count.test.sh 2>&1 | grep -c 'ok .*SC-AK-1817'` → >= 3
- **Readiness sign:** the scenario ok, the suite ends with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/record-count.test.sh` — exit 0.

### 3. The step guard refuses only a write

Rules: a shell command is refused only when it writes to the guarded file; a write whose target is
not a literal path is refused when the command names the guarded file.

- **Steps:**
    1. A read, a run of the engine and a file name inside another text pass the step guard
       Check: `VERBOSE=1 bash projects/agent-kit/tests/flow-step-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1819'` → >= 5
    2. A write to a guarded file by a built path, a copy into its directory or a writing script is refused
       Check: `VERBOSE=1 bash projects/agent-kit/tests/flow-step-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1820'` → >= 3
- **Readiness sign:** both scenarios ok on the false and true commands of the records.
- **Verified by:** `bash projects/agent-kit/tests/flow-step-guard.test.sh` — exit 0.

### 4. A model check with no file lets the call through

Rules: the words of the call of a model check name its own file to look for and what a missing file
or a refused read means.

- **Steps:**
    1. The words of a model check let the call through when its file is missing or unread
       Check: `grep -c 'no file or no read' projects/agent-kit/src/lib/agent-checks.ts` → >= 1
    2. The settings laid out from the package carry those words
       Check: `grep -c 'no file or no read' .claude/settings.json` → >= 2
- **Readiness sign:** both words stand; `pnpm run -s agent-kit:check` matches.
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit --testFile=hooks-map.spec.ts` — exit 0.

### 5. The description

Rules: the scenarios stand in their specs, bound to the code.

- **Steps:**
    1. The scenarios stand in the descriptions
       Check: `cat docs/specs/agent-kit/work-result/scenarios.md docs/specs/agent-kit/turn-guards/flow-script/guard/scenarios.md | grep -c -E '^### SC-AK-18(1[7-9]|20|3[45])'` → = 6
- **Readiness sign:** `node tools/check-specs.mjs` and `npm run -s check:spec-coverage` exit 0.
- **Verified by:** `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- Не переименовывает отказы прошлых дней: наблюдения хранят только имя. Пересчёт с заменой строк
  хука — отдельная правка `record-recount.mjs`.
- Не чинит диспетчер хуков при маркерах конфликта: имя `dispatch-broken` делает сбой видимым;
  обёртка, которая пропускает вызов при синтаксической ошибке, — находка рядом с планом эпика.
- Не пишет заметку в наблюдения, когда модельная проверка пропустила вызов без файла: модель
  наблюдений не пишет.
- Не разбирает 17 отказов проверки шагов на правках «state … ahead of the measured one» 20–21.11 и
  двойной счёт одной сессии 20.11 под двумя номерами: находки рядом с планом эпика.
- Не сводит признаки записи `flow-guard.mjs` с `hooks/write-targets.sh`: проверка шагов судит
  сценарии интерпретатора, которых оболочечный разбор не видит.
- Не обещает признак карточки «веха достигнута хотя бы в один день»: решение о закрытии без него —
  первая строка PR.
