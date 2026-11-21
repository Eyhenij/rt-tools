# Ход работы

## Где мы

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — The description
- **Done:** три этапа, живая проверка, два круга ревью с правками.
- **Next step:** коммит второго круга, слияние ветки эпика, разбор папки, набор перед отправкой, PR.
- **Uncommitted:** правки второго круга ревью
- **PR:** not open yet

## Шаги

- [x] 1.1 The host adapter gives the open PRs and the pipeline runs of a head sha
- [x] 1.2 The session events carry the time and branch of a call and the command of a background task
- [x] 2.1 A running run without a watch holds the stop with its number
- [x] 2.2 A background watch lifts the hold, and the scenario decides the stop
- [x] 2.3 An unread red run holds the stop with its number
- [x] 2.4 A red run read after its end lifts the hold
- [x] 2.5 A watch call before the end of the run is no read
- [x] 2.6 A green run and a run of another workflow do not hold the stop
- [x] 2.7 A silent host releases the stop
- [x] 2.8 The end of the epic does not release a running run of its PR
- [x] 2.9 A head moved by a push or an epic merge holds the stop after a branch switch
- [x] 2.10 A fresh head without a run holds the stop only for a pipeline base
- [x] 2.11 Three stops on one red run give one refusal when a read follows it
- [x] 2.12 A second stop without a call names the run, not the menu
- [x] 2.13 The stop word passes a running run, not a red attempt ended after it
- [x] 3.1 The scenarios stand in the description

## Решения по ходу

- **Пометки «(правится)» в строках кода следа плана.** Проверка правки движка пускает его файлы
  только по таким строкам; план их не ставил. Коммит плана переписан до первой правки кода, отметка
  одобрения записана заново по тому же ответу владельца. Этап плана: 1.
- **Сверка видов описания в дереве (`node tools/flow-sync.mjs --check`) расходится и до правки.**
  Разложенный `flow.md` несёт шапку раскладки, генерация её не пишет; сверка в пакете даёт
  «5 views match». Этап плана: 2.
- **Блок прогноза вынесен из набора движка в `task-flow-script-forecast.test.sh`.** Сценарий
  SC-AK-1799 довёл набор до 517 строк при пределе 500 для кода; строки «Covered:» сценариев прогноза
  переведены на новый файл. Этап плана: 1.
- **Первый круг ревью: снято с причиной.**
  - «Стоп» пропускает идущий запуск без слежения. Так владелец выбрал в меню 21.11: «стоп»
    снимает ожидание, красный после него держит ход.
  - Сбой движка не пишет номер PR в журнал. Строка «движок упал» пишется, когда движок уже не
    ответил или вышел за предел времени; вызов хостинга на этом пути добавил бы ожидание.
  - Молчащий хостинг снимает удержание без своей строки в журнале. Ход решают случаи отпуска, а
    случай молчащего хостинга пишет журнал, когда на молчании остановилось измерение.
  - Признака вытеснения у запуска нет: отменённый запуск судится как красный, и ход к выходу —
    чтение.
  - Прогноз отказов удержания по CI не видит. Повтор стратега по записям 15–21.11: 11–38 новых
    отказов на 19 215 вызовов, 0,06–0,20 на сто, в худший день 0,32–1,48; тупиков нет.
  - Вершина PR из хостинга может отстать от отправки. Открытые PR читаются мимо кэша, хостинг
    обновляет вершину за секунды.
  - Переход к задаче другого эпика теряет PR прежнего эпика. Такой переход бывает редко: следующая
    задача берётся из того же эпика.
- **Точка A плана названа примером, который работа не судит.** PR #3460 открыл сторонний участник,
  и ни одна сессия на его ветке не стояла. Работа меняет другое: 20.11 запись 84ce19f0 останавливала
  ход с 10:48 по 14:57 на ветке RT-3341, пока запуск 44720542029 PR #3453 стоял красным с 10:56
  до 15:00 и ни один вызов его не прочёл.
- **Второй круг ревью: «стоп» возвращён к ответу владельца.** Правка круга требовала слежения и
  после «стоп» и держала красный, кончившийся до слова. Это расходилось с выбранным вариантом:
  «стоп» снимает ожидание идущего запуска. Теперь «стоп» пропускает идущий запуск и свежую
  вершину, а держит только красный, кончившийся после слова, в любом порядке ответа хостинга.
- **Второй круг ревью: исправлено.**
  - Вывод слежения, прочитанный через `cat` или `tail`, засчитывается как чтение.
  - Команда чтения из отказа обрезает лог до 200 последних строк: ошибка стоит в конце лога.
  - Разбор отправки находит ветку в кавычках, после продолжения строки, в адресе с подстановкой,
    после помощника учётных данных в кавычках и в `--head owner:branch`. В записях 52fdffe9,
    7eee7976 и 84ce19f0 отправки с токеном давали ноль веток, теперь 21, 5 и 7.
  - Слежение требует слова `watch` и находит запуск по ветке PR.
  - Запись `on:` в одну строку с `pull_request` даёт любую базу.
- **Второй круг ревью: снято с причиной.**
  - `git -C <другая копия> push` и `--repo=` дают ветку записи. Таких форм в записях не нашлось.
  - Чтения хостинга идут без своего предела времени. Зависший клиент выводит движок за предел, ход
    отпускается со строкой «движок упал»; предел для всех чтений адаптера — отдельная правка.
  - Журнал молчащего хостинга и прогноз без удержания по CI сняты в первом круге.
- **Предел длины не действует на файлы сценариев и привязок.** Вопрос владельцу о переносе
  сценариев был лишним: 15 сценариев легли в прежний файл. Этап плана: 3.

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
- Живая проверка: мера `measure.ci.hold` разложенного движка на настоящих записях и данных хостинга.
  - Запись 05592134, PR #3472, запуск 44884048830 (08:15:50–08:23:09, failure). Срезы и итог:
    - 08:15:48 — `fresh`;
    - 08:20:00 — `running 44884048830`;
    - 08:23:15 — `red 44884048830`;
    - 08:23:30 — `none`, после `--log-failed` в 08:23:21;
    - 08:36:48 — `none` на ветке RT-3473.
  - Запись b8fa904d, запуск 44897325872 на PR #3472, вершину сдвинуло слияние RT-3473 в ветку эпика
    в браузере, `git push` в ветку эпика не было. 11:10 и 11:30 — `none` со слежением в фоне. Без
    событий фоновых задач — `running 44897325872` в оба среза. Ветку эпика мера взяла из плана
    `checks-rework-3.md`.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3467-ci-watch-after-push

### Where we stand at the minute of the compaction

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — The description
- **Next step:** живая проверка на настоящей записи, затем два круга ревью.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3467-ci-watch-after-push/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/agent-kit/turn-guards/flow-script/exit/implementation.md
 M docs/specs/agent-kit/turn-guards/flow-script/exit/scenarios.md
 M docs/specs/agent-kit/turn-guards/flow-script/exit/spec.md
 M projects/agent-kit/assets/checks/flow-verdict.mjs
 M projects/agent-kit/assets/task-flow/measure/ci.mjs
 M projects/agent-kit/assets/task-flow/measure/session.mjs
 M projects/agent-kit/assets/task-flow/source/session.mjs
 M projects/agent-kit/tests/turn-exit-guard.test.sh
```

### Commits over the main branch

```
461418400 fix(rt:agent-kit): удержание по CI после первого круга ревью (RT-3467)
2b29c57a4 feat(rt:agent-kit): конец хода держит запуск CI без слежения и непрочитанный красный (RT-3467)
eded67aba feat(rt:agent-kit): адаптер хостинга читает запуски CI вершины, события сессии — время и ветку (RT-3467)
6293aa0d0 docs(rt:agent-kit): план RT-3467 — конец хода читает CI открытых PR
fcc5d0834 docs(rt:agent-kit): разбор RT-3467 — конец хода читает запуск CI после PR
efe70df68 docs(rt:agent-kit): план эпика RT-3471 — признак RT-3427 без адреса в кавычках
4386d62e2 docs(rt:agent-kit): план эпика RT-3471 — четвёртая часть переделки проверок
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
