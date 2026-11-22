# Ход работы

## Где мы

- **State:** `замысел-записан`
- **Stage:** 1–4 идут одновременно, файлы этапов не пересекаются
- **Done:** план одобрен владельцем 22.11 ответом «Одобряю план RT-3423», отметка `plan-red` записана; ветка вобрала RT-3469 после её второго круга ревью
- **Next step:** закончить этапы 1–4, раскладка, этап 5 — описания
- **Uncommitted:** правки этапов 1–4
- **PR:** not open yet

## Шаги

- [>] 1.1 The report prints the dead ends of a day by check
- [ ] 1.2 The report judges the milestone by three days in a row of at least 1500 calls
- [ ] 1.3 The report with no `--until` takes today
- [ ] 2.1 The counter names the check of a refusal text with no name by its kind
- [ ] 3.1 A read, a run of the engine and a file name inside another text pass the step guard
- [ ] 3.2 A write to a guarded file by a built path, a copy into its directory or a writing script is refused
- [ ] 4.1 The words of a model check let the call through when its file is missing or unread
- [ ] 4.2 The settings laid out from the package carry those words
- [ ] 5.1 The scenarios stand in the descriptions

## Решения по ходу

- **Ночью готовятся разбор и черновик плана, кода нет.** Движок не даёт начать этап без одобрения плана владельцем.
- **21.11 задача перешла в эпик RT-3471 и в цепочку от RT-3469.** Коммиты разбора перенесены с
  ветки 20.11 на ветку от RT-3469; прежняя ветка лежит локально как `RT-3423-grill-2011`. Слово
  владельца 21.11 «все планы я тебе заранее одобряю» проверка правки кода не засчитывает: ей нужен
  ответ «Одобряю план RT-3423» после ролей на этом плане.
- **Номера сценариев SC-AK-1817…1820, 1834, 1835.** SC-AK-1814…1816 и SC-AK-1821 взяты планом
  RT-3469, 1822…1833 — планами задач ниже по цепочке.
- **Роли на первом плане 21.11 показали, что он не ведёт ни к точке B, ни к вехе G.** В план
  вошли тупики по проверкам и суждение о вехе в отчёте (этап 1), имя сбою диспетчера и модельной
  проверке без файла (этап 2), поиск своего файла модельной проверкой (этап 4).
