# Ход работы

## Где мы

- **State:** `задача-взята`
- **Stage:** 1 of 2 — The lag is counted without a diff, and a refusal is a note
- **Done:** разбор, план; две роли прочли план, их находки внесены до коммита плана.
- **Next step:** одобрение плана владельцем, затем шаг 1.1.
- **Uncommitted:** nothing
- **PR:** not open yet

## Шаги

- [>] 1.1 On the double a 422 of the comparison gives the note with the commit and the day
- [ ] 1.2 On the double the line of the last rollout and the count follow the note, the code is 0
- [ ] 1.3 On the double a 500 of the comparison and a failure of another request break the audit
- [ ] 1.4 On the recorded answers the audit names the lag by a number and prints its last line
- [ ] 1.5 The recorded output holds no stack
- [ ] 2.1 `SC-AK-1600` no longer waits for the fall
- [ ] 2.2 The scenario of the note stands in the description of the audit

## Решения по ходу

- **Ночью готовятся разбор и черновик плана, кода нет.** Движок не даёт начать этап без одобрения плана владельцем.
- **План переписан 21.11 по замерам.** Запрос сравнения с одной страницей строит тот же дифф из 300
  файлов; отставание считается GraphQL-сравнением. Перехват узкий и внутри замера отставания.
  Проверки шагов называют случаи, а не только номер; число отставания в проверке не зашито; живой
  аудит — только наблюдение. Находки ролей `goal-critic` и `product-strategist`.

## Сессии

### 2026-11-21

- Замер до работы: набор аудита 91 ok; набор на записанных ответах 10 ok на node 22, 9 ok и 1
  провал на node 20; в записанном выводе 7 строк стека; живое полное сравнение отвечает 487.
