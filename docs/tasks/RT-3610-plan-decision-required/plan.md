# План

**Task:** RT-3610 · **Branch:** RT-3610-plan-decision-required
**Behaviour:** unchanged — работа правит слой правил, код приложений `apps/` и `libs/` не трогает.

## Points

- **A:** раздел «Решение» в плане держит память исполнителя. План без него, с паттерном без места и с данными без
  набора записывается и доходит до владельца.
- **This task reaches:** план ветки без полного раздела «Решение» не записывается и не получает одобрения, отказ называет
  всё недостающее одним сообщением. Правка без новых символов обходится одной строкой с причиной.
- **Sign:** шаги 1.1, 1.2 и 2.1.
- **Milestone G of the epic:** у 20 задач после выпуска новых циклов и обходов ноль, медиана строк первого
  круга ревью меньше, чем у 20 задач до.
- **Metric:** строки первого круга ревью: вниз; медиана 275,5 у последних 20 задач на `d51cada26`.

## Решение

| Часть | Что выбрано |
| --- | --- |
| Модули | `checks/flow-decision.mjs:decisionRows` — читает раздел «Решение» из текста плана: строки и прочитанное в каждой — символы с пометкой отброшенных, числа бюджета, наборы, номера сценариев. `checks/flow-decision.mjs:decisionProblems` — называет, чего в них нет. `checks/flow-plan.mjs:writtenPlanProblem`, `checks/flow-plan.mjs:planProblems` и `checks/flow-plan.mjs:runPlanRed` — спрашивают её. `hooks/flow-step-guard.sh:action` — узнаёт отказ о решении для таблицы решений |
| Зависимости | `flow-plan.mjs` подключает `flow-decision.mjs`; тот — только `coupling-plan.mjs` ради формы чисел. Файлов и репозитория разбор не читает. `coupling-plan.mjs` ни о ком из них не знает |
| Зацепление | `projects/agent-kit/assets/checks/flow-plan.mjs` исходящие 5 → 6; `projects/agent-kit/assets/checks/flow-decision.mjs` исходящие 0 → 1; `projects/agent-kit/tests/flow-decision.test.sh` исходящие 0 → 2. Циклов и обходов нет |
| Паттерны | Open–Closed таблицей строк — `checks/flow-decision.mjs:ROWS`: имя, оба языка, что обязано быть в ячейке; новая строка ветвлений не правит. Отброшено: девять условий подряд и вторая читалка раздела у RT-3611 |
| Термины | решение — раздел плана; строка решения — ряд его таблицы; место — путь и символ через двоеточие. Все три — в словаре дерева |
| Данные: раздел | из текста плана: раздела нет; заголовок «Решение»; «Decision»; раздел пуст; таблица без строк; «Решения нет: причина»; она же без причины; она же в скобках шаблона; второй раздел с тем же именем; таблица в блоке кода — не считается. SC-AK-1971, `flow-decision.test.sh` |
| Данные: строка | каждой из девяти строк нет; ячейка пуста; одно слово; ячейка целиком в скобках шаблона; `<<<` внутри ячейки — проход; `\|` внутри ячейки; имя с хвостом после двоеточия; имя в единственном числе; имя по-английски; две строки данных, у одной нет набора; незнакомая строка — проход. SC-AK-1972, `flow-decision.test.sh` |
| Данные: место и числа | модуль без символа; символ-число; паттерн с местом; без места; два паттерна, у второго места нет; предложение без тире и предложение, которое начато словом «отброшено», — не пункты; символ до слова «отброшено» — обычный, после него до конца предложения — с пометкой; «удаляется» в одной части между «;» из двух; «паттерна нет» с причиной и без неё; зацепление словами; «кода нет: причина»; бюджет без пути, без числа новых файлов, без зависимостей; набор `*.test.sh`, `*.spec.ts`, e2e; номера сценария нет; «номера нет: причина» с набором. SC-AK-1972, `flow-decision.test.sh` |
| Данные: вызов | запись плана ветки; правка; правка, пока стоят имена шагов в скобках, — проход; шаблон пакета без правки — отказ; план чужой ветки; с меткой одобрения; план эпика; другой файл; сломанный ввод — проход; `plan-check`; `plan-red` без метки, с меткой, на плане, в дереве которого ещё нет `flow-decision.mjs`, — проход, и на плане после него — отказ, отправлен он или нет; движок вне дерева — раздел спрашивается. SC-AK-1973, `flow-decision.test.sh` |
| Границы | формы проверок шага и `coupling-plan.mjs` не правятся. Одобренный план не переспрашивается. Движок, который не отвечает, пропускает действие. План, начатый до обновления и ещё не одобренный, дописывает раздел: отказ называет строки и готовую «Решения нет: причина». План, написанный до обновления, `plan-red` пропускает, написанный после — нет: смотрится, есть ли в дереве коммита плана файл разбора рядом с движком. Движок лежит вне дерева или вне истории — раздел спрашивается всегда. Строка об этом — в журнале выпуска |
| Приоритет | простота: судится наличие, символ и число, а не качество; качество судят роли. Запись плана — без новых запусков `node` |
| Бюджет | `projects/agent-kit/assets/checks/flow-decision.mjs` до 150 строк; `projects/agent-kit/tests/flow-decision.test.sh` до 160; `projects/agent-kit/assets/checks/flow-plan.mjs` плюс 15; `projects/agent-kit/assets/samples/tasks/_template/plan.md` плюс 25; новых файлов кода: 2; новых зависимостей: 0 |

## Task footprint

| What             | Where                            |
| ---------------- | -------------------------------- |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/guard/spec.md`, `docs/specs/agent-kit/turn-guards/flow-script/guard/scenarios.md`, `docs/specs/agent-kit/turn-guards/flow-script/guard/implementation.md`, `docs/GLOSSARY.md` |
| Rules (правится) | `projects/agent-kit/assets/rules/task-flow-plan.md`, `projects/agent-kit/assets/pitfalls/task-flow.2.md`, `projects/agent-kit/assets/patterns/code-design-choose.md` |
| Code (правится)  | `projects/agent-kit/assets/checks/flow-decision.mjs`, `projects/agent-kit/assets/checks/flow-plan.mjs`, `projects/agent-kit/assets/hooks/flow-step-guard.sh`, `projects/agent-kit/assets/checks/decision-table.json`, `projects/agent-kit/assets/samples/tasks/_template/plan.md`, `projects/agent-kit/tests/flow-decision.test.sh`, `projects/agent-kit/tests/flow-plan-forms.test.sh`, `projects/agent-kit/tests/task-flow-script-steps.test.sh` |

## What counts as done

- План ветки без раздела, без любой из девяти строк, с паттерном без места, с данными без набора и с бюджетом без числа
  не записывается; отказ называет всё сразу.
- Полный план и план с одной строкой причины записываются; одобренный план не судится; план без решения одобрения не
  получает.
- Шаблон несёт раздел; шаблон, записанный без правки, отказан; правка его по частям проходит.

## Stages

### 1. Разбор раздела

- **Steps:**
    1. Раздел, которого нет, пустой и без причины назван; одна строка с причиной проходит
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-decision.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1971'` → >= 10
    2. Каждая недостающая строка, место, число и набор названы
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-decision.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1972'` → >= 41
    3. Модуль отдаёт разбор и суд, подключает одну форму чисел
       Check: `test -f projects/agent-kit/assets/checks/flow-decision.mjs && test "$(grep -cE '^export ' projects/agent-kit/assets/checks/flow-decision.mjs)" -eq 2 && test "$(grep -cE '^import ' projects/agent-kit/assets/checks/flow-decision.mjs)" -eq 1` → exit 0
- **Readiness sign:** план RT-3610 проходит; план RT-3615 из его первого коммита назван за четыре строки данных и бюджет.
- **Verified by:** `bash projects/agent-kit/tests/flow-decision.test.sh` — без провалов.

### 2. Запись плана

- **Steps:**
    1. Неполный план отказан одним сообщением при записи, правке, `plan-check` и `plan-red`; прочие файлы проходят
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/flow-decision.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1973'` → >= 16
    2. Прежние случаи форм и шагов зелёные, в заготовках одна строка «No decision: probe fixture»
       Check: `test -f projects/agent-kit/assets/checks/flow-decision.mjs && bash projects/agent-kit/tests/flow-plan-forms.test.sh > /dev/null 2>&1 && bash projects/agent-kit/tests/task-flow-script-steps.test.sh > /dev/null 2>&1` → exit 0
    3. Шаблон плана несёт раздел со всеми строками
       Check: `test "$(grep -cE '^\| (Modules|Dependencies|Coupling|Patterns|Terms|Input|Bounds|Priority|Budget) ' projects/agent-kit/assets/samples/tasks/_template/plan.md)" -eq 9` → exit 0
    4. Таблица решений знает отказ о решении, и ход у него — правка текста
       Check: `test "$(grep -c '"write_plan_decision"' projects/agent-kit/assets/checks/decision-table.json)" -ge 2 && bash projects/agent-kit/tests/decision-table.test.sh > /dev/null 2>&1` → exit 0
    5. Описание, сценарии и привязки сходятся
       Check: `node tools/check-specs.mjs > /dev/null && grep -cE '^### SC-AK-197[1-3] ' docs/specs/agent-kit/turn-guards/flow-script/guard/scenarios.md` → = 3
- **Readiness sign:** наборы движка зелёные.
- **Verified by:** набор перед отправкой, шаг `test-hooks`.

### 3. Проверка вживую

- **Steps:**
    1. Установленная копия называет план без раздела
       Check: `node -e 'import("./tools/flow-decision.mjs").then(m => console.log(m.decisionProblems("# Plan\n").length > 0 ? "названо" : "молчит"))'` → `названо`
- **Readiness sign:** запись копии плана без одной строки через установленный хук отказана, отказ вставлен в `progress.md`.
- **Verified by:** вызов установленного `flow-step-guard.sh` во временном репозитории с записью плана.

## What this work does not do

- Не сверяет символ, набор, бюджет и условие «без новых символов» с кодом: это RT-3611, после написания кода. Её план
  называет новый файл кода и новую функцию, класс или экспорт в прежнем файле.
- Не узнаёт случай каждой формы входа: строка данных называет номер сценария и набор. Точка B эпика говорит «формой
  входа без случая теста». Это сужение, и одобрение плана меняет точку на «строкой данных без номера сценария и набора».
- Не судит качество решения, зависимости и границы: их читает роль RT-3612.
- Не судит план эпика: раздел «Решение» в нём свой.
- Не правит маски `*` в следе: это RT-3611.
