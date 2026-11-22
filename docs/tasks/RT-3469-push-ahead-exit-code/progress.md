# Ход работы

## Где мы

- **State:** `этап-идёт`
- **Stage:** этапы кончились — живая проверка сделана, впереди два круга ревью
- **Done:** все 9 шагов отмечены движком. Набор проверки — 32 ok; таблица решений — 517 ok; `metric-events` — 64 ok; проверки дерева по `tools/tests/run.sh` — все зелёные
- **Next step:** первый круг ревью — `qa-engineer`, `product-strategist`, `goal-critic` на дифф ветки
- **Uncommitted:** nothing
- **PR:** not open yet

## Шаги

- [x] 1.1 A run ahead whose tail hides its code and prints no `$?` is refused with the ready form
- [x] 1.2 A run ahead alone, redirected, chained by `&&` to the end or followed by `$?` passes
- [x] 1.3 A text that only names the script passes, a run inside `bash -c` is judged by its inner text
- [x] 1.4 A red set in the ready form ends with a nonzero code
- [x] 1.5 The refusal is a row of the decision table
- [x] 2.1 The refusals of the table that name the run ahead name the ready form
- [x] 2.2 The two texts of the epic delivery guard name the ready form
- [x] 2.3 The pattern of the delivery loop gives the ready form of the run ahead
- [x] 3.1 The scenarios stand in the description of the run ahead

## Решения по ходу

- **Проверка отказывает только там, где код набора не виден нигде.** Стратег показал: 317 из 340
  вызовов с хвостом печатают `$?`, случаев «красный прочитан как зелёный» нет, а отказ на любой
  хвост поднимает 21.11 выше вехи. Решение записано в разборе как умолчание ночного захода. Этап
  плана: 1.
- **Число точки A пересчитано по номеру вызова:** 383 разных вызова, а не 625 строк записей.
- **Слово владельца 21.11 «все планы я тебе заранее одобряю» проверка правки кода не засчитывает.**
  Ей нужен ответ «Одобряю план RT-3469» после ролей на этом плане; утром он задаётся меню.
- **Номера сценариев SC-AK-1814…1816 и SC-AK-1821.** SC-AK-1817…1820 взяты планом RT-3423.
- **Живая проверка 22.11 на настоящих вызовах.** Все вызовы Bash с `git-guard-push-ahead.sh` из
  записей сессий 14–21.11, вложенные сессии и рабочие копии тоже: 462 разных вызова (разбор
  считал 383 только по главным записям). Первый прогон отказал 33. Четыре из них ложные:
  `nohup bash -c "набор > журнал; echo exit \$? >> журнал" &` пишет код в журнал. Правка:
  `bash -c`, который печатает `$?` после набора, проходит, сценарий SC-AK-1816 добавлен. Второй
  прогон — 29 отказов. Каждый прочитан, во всех код набора не виден:
  - `| tail` без `PIPESTATUS`;
  - `; grep` или `; tail` без `$?`;
  - `&` и затем `echo started`;
  - цикл `&& { echo green; break; }; grep …`.
  29 за 8 дней — около 3,6 отказа в день. Это выше цели плана «не больше 0,05 на сто»: при 1500
  вызовах в день выходит 0,24. Готовая форма теперь стоит в 13 текстах отказов и в шаблоне, и
  счёт должен упасть. Его покажет отчёт после выпуска, а не этот прогон.
- **Тексты таблицы и образцы `says` правлены вместе.** Сверка SC-AK-1563 запуском хуков нашла 12
  строк, где образец `says` держал старую форму. Образцы переписаны под готовую.
- **Счёт `metric-events` — 25 проверок с объявленным правилом.** Новая проверка объявляет
  `git-workflow`.
