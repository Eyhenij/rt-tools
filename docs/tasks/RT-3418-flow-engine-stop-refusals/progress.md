# Ход работы

## Где мы

- **State:** `этап-идёт`
- **Stage:** 3 из 3 — The forecast counts the runs
- **Done:** этапы 1 и 2: источник сессии называет фоновые задачи, запись читается кусками, ожидающий конец хода отпускается своим случаем; наборы — 178, 98 и 97 без провалов
- **Next step:** прогноз пропускает остановки через новый случай и называет самую длинную серию
- **Uncommitted:** nothing
- **PR:** not open yet

## Шаги

- [x] 1.1 The session source names the start and the end of a background task
- [x] 1.2 The session record is read by pieces
- [x] 2.1 A stop with a background task of the session running is released
- [x] 2.2 A background task past the bound releases nothing
- [x] 2.3 A waiting stop after a refusal names no owner's menu
- [x] 2.4 A stop in the state that sends work to the background is held
- [>] 3.1 The forecast lets a waiting stop go and names the longest run
- [ ] 3.2 Over the closed days the forecast holds fewer stops than the base

## Решения по ходу

- **Ночью готовятся разбор и черновик плана, кода нет.** Движок не даёт начать этап без одобрения плана владельцем, а проверка вопросов не дала одобрить планы ночи заранее.
- **План одобрен утром 20.11.** Слово владельца в меню: «Одобряю plan.md RT-3418».
- **Граница в двадцать минут записана в измерителе и в описании проверки, а не в словах `flow.js`.** Список слов описания принимает только строки, и новый ключ потребовал бы правки проверки данных вне области задачи. Затронут этап 2.
- **Состояние «работа-отдана» случай узнаёт по выходу 10.** Условие случая — «сессия ждёт и выход 10 не выполнен»: языку описания хватило готового измерителя. Затронут этап 2.
- **Порядок случаев отпуска сдвинулся.** Новый случай встал третьим, случаи «нет записи», «роль» и «хостинг молчит» получили номера 4, 5 и 6. Затронут этап 2.
