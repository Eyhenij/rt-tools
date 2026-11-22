# Ход работы

## Где мы

- **State:** `этап-идёт`
- **Stage:** 2 — The draft check does not judge a draft of another copy
- **Done:** этап 1: событие отказа остановки несёт имя проверки, мера простоя судит все отказы после последнего вызова, удержание называет чужой отказ без меню; набор выхода из хода — 201 ok
- **Next step:** шаг 2.1
- **Uncommitted:** nothing
- **PR:** not open yet

## Шаги

- [x] 1.1 A refusal of a stop names the hook that refused, the model check with no name included
- [x] 1.2 A stop after a refusal of the draft check about a foreign PR, with no background task, gives the move of the state and a line about the foreign refusal
- [x] 1.3 A stop after a refusal of the engine itself is still idle
- [x] 1.4 A refusal of the engine and of the model check in one stop, then a stop with no call, give the menu
- [x] 1.5 A refusal of the model check with no name is no idle one
- [>] 2.1 A draft of a branch checked out in another copy passes, a draft of a branch no copy holds is refused
- [ ] 3.1 The scenarios stand in the description
- [ ] 3.2 The rule of the menu names the engine's own refusal

## Решения по ходу

- **Ветка в цепочке от RT-3425.** Ночная цепочка: RT-3469 → RT-3423 → RT-3434 → RT-3425 → RT-3468.
- **Номера сценариев SC-AK-1830…1832, 1836, 1837.** Меньшие номера взяты планами задач ниже по
  цепочке; 22.11 они всё ещё свободны.
- **Роли на первом плане 21.11 показали, что он не ведёт ни к точке B, ни к вехе G.** В план
  вошли мера простоя по всем отказам остановки, отказ модельной проверки без имени, строка о чужом
  отказе и второй ярус проверки черновика (этап 2).
- **22.11 ветка вобрала RT-3425.** Конфликт в файле находок эпика: обе ветки дописали свои разделы,
  оставлены оба. Строка ночных находок с диапазоном коммитов в обратных кавычках переписана
  словами — проверка путей принимала её за путь.
- **Чужой отказ идёт к удержанию через `menuCause` как `{ foreign }`.** Мера простоя отвечает
  `true` для отказа движка или отказа без имени и `{ foreign: <проверка> }`, когда все отказы
  чужие. Так строка доходит до `holdReason` без правки `task-flow-script.mjs` и
  `flow-forecast.mjs`: их нет в следе плана. Прогноз считает такую причину названным меню, как
  считал и до правки. Находка рядом с планом эпика.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3468-foreign-refusal-not-idle

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 — A stop after a refusal of another check is no idle one
- **Next step:** шаг 1.1
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3468-foreign-refusal-not-idle/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3468-foreign-refusal-not-idle/progress.md
```

### Commits over the main branch

```
fc75f30c2 docs(rt:agent-kit): находки разбора правил после RT-3425 — в файл находок эпика (RT-3468)
414f47d57 docs(rt:agent-kit): ход работы RT-3468 — план одобрен, шаги плана в ходе работы (RT-3468)
83bfee9d4 docs(rt:agent-kit): находка о выходе следа без диапазона коммитов в адресе (RT-3468)
e6611cd02 Merge branch 'RT-3425-flow-reads-branch-line' into RT-3468-foreign-refusal-not-idle
ba46f1f06 docs(rt:agent-kit): папка задачи о чтении удалённого файла после влитой базы разобрана в архив (RT-3425)
26d8d3a60 fix(rt:agent-kit): собственный разбор ветки первым — правки после второго круга ревью (RT-3425)
43d7630ca docs(rt:agent-kit): ход работы RT-3425 — живая проверка после первого круга (RT-3425)
4c170622f fix(rt:agent-kit): выбор удаления среди всех кандидатов — правки после первого круга ревью (RT-3425)
c3262e6e7 docs(rt:agent-kit): задачи RT-3467, RT-3469, RT-3423 и RT-3434 влиты в ветку эпика (RT-3425)
3ad6d1028 Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3425-flow-reads-branch-line
79e88f34e [RT-3434] Шаг меряется после разбора папки, одно несовпадение перед PR не снимает отметку (#3503)
e38ee69bc docs(rt:agent-kit): ход работы RT-3425 — живая проверка на истории RT-3434 (RT-3425)
881123411 fix(rt:agent-kit): влитая база со старой папкой не откатывает разобранную задачу (RT-3425)
7211e5b06 docs(rt:agent-kit): ход работы RT-3425 — план одобрен, шаги плана в ходе работы (RT-3425)
26c2f5e4a docs(rt:agent-kit): находки разбора правил после RT-3434 — в файл находок эпика (RT-3425)
b1922a944 Merge branch 'RT-3434-step-after-archive' into RT-3425-flow-reads-branch-line
45e16596e docs(rt:agent-kit): папка задачи о шаге после разбора папки разобрана в архив (RT-3434)
200059b64 fix(rt:agent-kit): разложенный flow-step.mjs укладывается в предел 500 строк (RT-3434)
a398846b6 Revert "docs(rt:agent-kit): папка задачи о шаге после разбора папки разобрана в архив (RT-3434)"
b48e35afd Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3434-step-after-archive
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
