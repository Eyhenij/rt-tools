# Ход работы

## Где мы

- **State:** `замысел-записан`
- **Stage:** 1 — The last version of a removed file is read before its removal
- **Done:** план одобрен владельцем 22.11 ответом «Одобряю план RT-3425», отметка `plan-red` записана; ветка вобрала RT-3434 после её разбора папки
- **Next step:** шаг 1.1
- **Uncommitted:** nothing
- **PR:** not open yet

## Шаги

- [>] 1.1 The last version of a file the head does not hold is read at the parent of the commit that removed it
- [ ] 1.2 A merged base, a fast-forward and a removal in the base do not roll the state below «папка-разобрана»
- [ ] 1.3 The step command on a taken-apart folder after a merged base measures the step by the branch's own progress
- [ ] 2.1 The scenarios stand in the description

## Решения по ходу

- **Ночью готовятся разбор и черновик плана, кода нет.** Движок не даёт начать этап без одобрения плана владельцем.
- **21.11 задача перешла в эпик RT-3471 и в цепочку от RT-3434.** Коммиты разбора перенесены с
  ветки 20.11; прежняя ветка лежит локально как `RT-3425-grill-2011`. Номера сценариев
  SC-AK-1827…1829, новые случаи — в наборе `task-flow-script-merge.test.sh`: набор движка уже 450
  строк.
- **Роли на первом плане 21.11.** Критик нашёл две истории, где «самый новый удаливший коммит»
  ошибается: перемотку и удаление старой копии в базе; стратег показал, что число 16 не про эту
  причину, и что поиск нужен и команде шага RT-3434. План ищет через `removedAt`, сценарии — три
  истории и шаг после влитой базы.
