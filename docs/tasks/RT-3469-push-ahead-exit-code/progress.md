# Ход работы

## Где мы

- **State:** `задача-взята`
- **Stage:** нет — план написан, роли его прочли; одобрение владельца утром
- **Done:** разведка, разбор, план в три этапа, правки плана по находкам `goal-critic` и `product-strategist`
- **Next step:** утром — «Одобряю план RT-3469» и `plan-red`, затем этап 1
- **Uncommitted:** nothing
- **PR:** not open yet

## Шаги

- [>] 1.1 A run ahead whose tail hides its code and prints no `$?` is refused with the ready form
- [ ] 1.2 A run ahead alone, redirected, chained by `&&` to the end or followed by `$?` passes
- [ ] 1.3 A text that only names the script passes, a run inside `bash -c` is judged by its inner text
- [ ] 1.4 A red set in the ready form ends with a nonzero code
- [ ] 1.5 The refusal is a row of the decision table
- [ ] 2.1 The refusals of the table that name the run ahead name the ready form
- [ ] 2.2 The two texts of the epic delivery guard name the ready form
- [ ] 2.3 The pattern of the delivery loop gives the ready form of the run ahead
- [ ] 3.1 The scenarios stand in the description of the run ahead

## Решения по ходу

- **Проверка отказывает только там, где код набора не виден нигде.** Стратег показал: 317 из 340
  вызовов с хвостом печатают `$?`, случаев «красный прочитан как зелёный» нет, а отказ на любой
  хвост поднимает 21.11 выше вехи. Решение записано в разборе как умолчание ночного захода. Этап
  плана: 1.
- **Число точки A пересчитано по номеру вызова:** 383 разных вызова, а не 625 строк записей.
- **Слово владельца 21.11 «все планы я тебе заранее одобряю» проверка правки кода не засчитывает.**
  Ей нужен ответ «Одобряю план RT-3469» после ролей на этом плане; утром он задаётся меню.
- **Номера сценариев SC-AK-1814…1816 и SC-AK-1821.** SC-AK-1817…1820 взяты планом RT-3423.
