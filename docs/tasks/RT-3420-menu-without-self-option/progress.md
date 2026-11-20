# Ход работы

## Где мы

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — The texts and the layout, все тринадцать шагов зелёные
- **Done:** три этапа: движок и проверка шагов, сценарии, тексты и раскладка; семь наборов зелёные (63, 516, 105, 96, 129, 196 ok и 1012 строк таблицы решений)
- **Next step:** живая проверка, два круга ревью, разбор папки, набор перед отправкой, PR
- **Uncommitted:** этапы 1–3 ждут коммита
- **PR:** not open yet

## Шаги

- [x] 1.1 The words of the menu carry two options
- [x] 1.2 The guard refuses the mark of the owner's step with no window
- [x] 1.3 A row of the plan carries no owner's quote
- [x] 1.4 The text of a refusal names no step of the owner
- [x] 1.5 The decision table answers the mark with a refusal
- [x] 2.1 The suites and the checks carry no option
- [x] 2.2 The scenario of the option is gone
- [x] 2.3 The mark of the owner's step is refused
- [x] 3.1 The texts of the package name two options
- [x] 3.2 The description of the check names two options
- [x] 3.3 No text counts three options
- [x] 3.4 No text speaks of the owner's window of a row
- [x] 3.5 The laid-out copies carry no option

## Решения по ходу

- **Ночью готовятся разбор и черновик плана, кода нет.** Движок не даёт начать этап без одобрения плана владельцем.
- **Находки ролей по плану после одобрения идут в работу этапов, план не правится.** Критик цели: в текстах остаётся основание меню «шаг принадлежит владельцу»; правило «помеченная строка читается как обычная» без сценария. Стратег: строка описания эпика «exit 11 only passes such a row over» и ветка хука по словам «is the owner's decision» не пойманы проверками шагов. Все четыре места лежат в файлах следа задачи. Affected stage of the plan: 1, 2, 3.
- **Проверка шага 1.1 заменена:** `grep -c 'сделаю сам' projects/agent-kit/assets/task-flow/flow.js | cat` → = 0
- **Проверка шага 1.2 заменена:** `grep -c 'SELF_OPTION' projects/agent-kit/assets/checks/flow-guard.mjs | cat` → = 0
- **Проверка шага 1.4 заменена:** `grep -c 'сделаю сам' projects/agent-kit/assets/checks/flow-verdict.mjs | cat` → = 0
- **Проверка шага 1.5 заменена:** `grep -c 'waits for your step' projects/agent-kit/assets/checks/decision-table.json | cat` → = 0
- **Проверка шага 2.2 заменена:** `VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1469' | cat` → = 0
- **Четыре проверки плана заменены по одной причине.** `grep -c` при нуле совпадений кончается кодом 1, и движок не засчитывает ответ «0». Замена добавляет `| cat`: счёт тот же, код выхода 0. Affected stage of the plan: 1.
- **Проверка описания движка зелёная до первой правки.** `node projects/agent-kit/assets/checks/flow-sync.mjs --check` → «5 views match». Строка разбора о красной проверке устарела после RT-3418. Affected stage of the plan: 1.
