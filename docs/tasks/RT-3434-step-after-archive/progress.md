# Ход работы

## Где мы

- **State:** `замысел-записан`
- **Stage:** 1 — команда шага меряет шаг после разбора папки
- **Done:** план одобрен владельцем 22.11 ответом «Одобряю план RT-3434», отметка `plan-red` записана; ветка вобрала RT-3423 после её разбора папки
- **Next step:** этап 1, затем этап 2 и описания
- **Uncommitted:** nothing
- **PR:** not open yet

## Шаги

- [>] 1.1 The step command on a taken-apart folder puts it back, measures the step and writes the mark
- [ ] 1.2 A step the history does not mark done is refused with a move the step guard lets through
- [ ] 1.3 A start of the engine cleans a folder of a dead run and leaves the folder of a live one
- [ ] 2.1 A step that did not match before a PR is run again and loses its mark only on the second mismatch
- [ ] 2.2 The line of an unmatched step names the command and the last lines of its output and errors
- [ ] 2.3 A step that fails twice on a taken-apart folder gets the revert move, and the exit refusal names its number
- [ ] 3.1 The scenarios stand in the descriptions

## Решения по ходу

- **Ночью готовятся разбор и черновик плана, кода нет.** Движок не даёт начать этап без одобрения плана владельцем.
- **21.11 задача перешла в эпик RT-3471 и в цепочку от RT-3423.** Коммиты разбора перенесены с
  ветки 20.11; прежняя ветка лежит локально как `RT-3434-grill-2011`. Номера сценариев
  SC-AK-1822…1826 и 1833.
- **Роли на первом плане 21.11 нашли четыре тупика.** В план вошли ход `git revert <коммит
  разбора>`, запись возврата с номером процесса, перемер по группам в бюджете 1500 с и номер шага
  в отказе конца хода. Поиск удалившего коммита вынесен в `removedAt` источника истории: RT-3425
  правит его там.
- **Новые случаи — в отдельном наборе `task-flow-script-archive.test.sh`.** Набор шагов уже 486
  строк при пределе 500 для кода.
