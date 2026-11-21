# Ход работы

## Где мы

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — The host and the session give the facts
- **Done:** разведка движка хода работы; разбор и план; план одобрен владельцем 21.11.
- **Next step:** 1.1 — адаптер хостинга отдаёт открытые PR и запуски конвейера по sha вершины.
- **Uncommitted:** ход работы
- **PR:** not open yet

## Шаги

- [x] 1.1 The host adapter gives the open PRs and the pipeline runs of a head sha
- [x] 1.2 The session events carry the time and branch of a call and the command of a background task
- [>] 2.1 A running run without a watch holds the stop with its number
- [ ] 2.2 A background watch lifts the hold, and the scenario decides the stop
- [ ] 2.3 An unread red run holds the stop with its number
- [ ] 2.4 A red run read after its end lifts the hold
- [ ] 2.5 A watch call before the end of the run is no read
- [ ] 2.6 A green run and a run of another workflow do not hold the stop
- [ ] 2.7 A silent host releases the stop
- [ ] 2.8 The end of the epic does not release a running run of its PR
- [ ] 2.9 A head moved by a push or an epic merge holds the stop after a branch switch
- [ ] 2.10 A fresh head without a run holds the stop only for a pipeline base
- [ ] 2.11 Three stops on one red run give one refusal when a read follows it
- [ ] 2.12 A second stop without a call names the run, not the menu
- [ ] 2.13 The stop word passes a running run, not a red attempt ended after it
- [ ] 3.1 The scenarios stand in the description

## Решения по ходу

## Сессии

### 2026-11-21

- Замер до работы: набор проверки конца хода — 124 ok, 0 провалов; сценариев SC-AK-1799…1813 нет
  ни в наборах, ни в описании — все проверки шагов дают 0.
- Разведка: решение принимает движок (`task-flow-script.mjs verdict`), таблица решений только
  оформляет отказ; у адаптера хостинга нет порта запусков CI; команда фоновой задачи лежит в
  событии вызова с тем же номером.
- Роли на плане, два круга. Опровергнута первая точка A: красный запуск 44884048830 сессия прочла
  сама в 08:26, а слово владельца в 02:01 сказано о наборе. Точка A взята по PR #3460: запуск
  44810853234 красный с 20.11 20:43, ни одна запись не называет его номер.
- Владелец по меню: красный запуск, кончившийся после «стоп», читается до остановки.
- Находки разбора правил после RT-3475 по слову владельца легли в эпик задачей RT-3493.
