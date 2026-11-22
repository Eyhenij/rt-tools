# Ход работы

## Где мы

- **State:** `замысел-записан`
- **Stage:** 1 — A stop after a refusal of another check is no idle one
- **Done:** план одобрен владельцем 22.11 ответом «Одобряю план RT-3468», отметка `plan-red` записана; ветка вобрала RT-3425 после её разбора папки
- **Next step:** шаг 1.1
- **Uncommitted:** nothing
- **PR:** not open yet

## Шаги

- [>] 1.1 A refusal of a stop names the hook that refused, the model check with no name included
- [ ] 1.2 A stop after a refusal of the draft check about a foreign PR, with no background task, gives the move of the state and a line about the foreign refusal
- [ ] 1.3 A stop after a refusal of the engine itself is still idle
- [ ] 1.4 A refusal of the engine and of the model check in one stop, then a stop with no call, give the menu
- [ ] 1.5 A refusal of the model check with no name is no idle one
- [ ] 2.1 A draft of a branch checked out in another copy passes, a draft of a branch no copy holds is refused
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
