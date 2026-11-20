# Ход работы

## Где мы

- **State:** `замысел-записан`
- **Stage:** 1 of 3 — The engine and the guard
- **Done:** план одобрен владельцем 20.11 ответом «Одобряю plan.md RT-3420», отметка записана
- **Next step:** шаг 1.1 — слова меню в `flow.js`
- **Uncommitted:** nothing
- **PR:** not open yet

## Шаги

- [>] 1.1 The words of the menu carry two options
- [ ] 1.2 The guard refuses the mark of the owner's step with no window
- [ ] 1.3 A row of the plan carries no owner's quote
- [ ] 1.4 The text of a refusal names no step of the owner
- [ ] 1.5 The decision table answers the mark with a refusal
- [ ] 2.1 The suites and the checks carry no option
- [ ] 2.2 The scenario of the option is gone
- [ ] 2.3 The mark of the owner's step is refused
- [ ] 3.1 The texts of the package name two options
- [ ] 3.2 The description of the check names two options
- [ ] 3.3 No text counts three options
- [ ] 3.4 No text speaks of the owner's window of a row
- [ ] 3.5 The laid-out copies carry no option

## Решения по ходу

- **Ночью готовятся разбор и черновик плана, кода нет.** Движок не даёт начать этап без одобрения плана владельцем.
- **Находки ролей по плану после одобрения идут в работу этапов, план не правится.** Критик цели: в текстах остаётся основание меню «шаг принадлежит владельцу»; правило «помеченная строка читается как обычная» без сценария. Стратег: строка описания эпика «exit 11 only passes such a row over» и ветка хука по словам «is the owner's decision» не пойманы проверками шагов. Все четыре места лежат в файлах следа задачи. Affected stage of the plan: 1, 2, 3.
- **Проверка описания движка зелёная до первой правки.** `node projects/agent-kit/assets/checks/flow-sync.mjs --check` → «5 views match». Строка разбора о красной проверке устарела после RT-3418. Affected stage of the plan: 1.
