# Ход работы

## Где мы

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — The description
- **Done:** оба этапа, все 11 шагов отмечены движком.
- **Next step:** живая проверка, затем первый круг ревью.
- **Uncommitted:** код и описание этапов
- **PR:** not open yet

## Шаги

- [x] 1.1 A task that ended after the last call makes the stop not idle
- [x] 1.2 The refusal names the task and its output and offers no menu
- [x] 1.3 Only a call that names the task or its output reads it
- [x] 1.4 A task the session stopped itself, or one with no start in the record, is not unread
- [x] 1.5 The menu of a forbidden step is not offered over an unread task
- [x] 1.6 A task running past the bound is named, not the menu
- [x] 1.7 A transcript shaped as on 21.11 holds the stop through the hook and names the task
- [x] 1.8 A refusal with no ended task still gives the menu
- [x] 2.1 The old case of an ended task is gone from the suite
- [x] 2.2 The old line of an ended task is gone from the description
- [x] 2.3 The scenario of the unread task stands in the description

## Решения по ходу

- **Первый круг ревью: прочитанной задачу делает любой вызов после её уведомления, как решено в
  разборе.** Шаг 1.3 плана требовал вызова с номером задачи; повтор на настоящих записях показал,
  что так названы 39 отказов из 42 в одной записи, 38 из них — задачи, после конца которых шли до
  187 вызовов, и агенты, чей отчёт уже пришёл в уведомлении. После правки: 1 и 1 название на двух
  записях, оба — конец после последнего вызова. Вызов с номером нужен только команде старше
  предела; агент старше предела не называется. Случаи шага 1.3 переписаны под это правило.
- **Там же, после goal-critic: «любой вызов» снова пропускал меню над красным итогом.** Одного
  постороннего вызова между уведомлением и остановкой хватало. Итог — середина: агент прочитан
  первым вызовом после уведомления (отчёт в уведомлении), команда — вызовом с её номером, файлом
  вывода или файлом, куда она писала перенаправлением. На записи с 42 отказами названы 3 задачи:
  два набора перед отправкой с непрочитанным логом и цикл наблюдения за CI. Меню запрета другой
  проверки не предлагается и над идущей задачей.
- **Второй круг ревью: средний признак прочтения снят, остаётся правило разбора.** QA на 31 записи:
  701 из 1737 концов хода несли непрочитанную задачу, 668 — после позднейших вызовов (до 550);
  прогноз за неделю удвоил удержания — 133 → 275, самая длинная серия 33 → 165. Разбор
  перенаправлений ошибался в обе стороны. Теперь непрочитана задача, после уведомления которой нет
  ни вызова, ни меню — уведомление до сессии не дошло, как 21.11. Замеры: прогноз ветки равен базе
  (911 остановок, 133 удержания, серия 33); на восьми записях 11 названий на 324 остановки, все —
  агенты, чьё уведомление стояло в очереди. Признак «старше предела» убран (сервер в фоне давал
  ложный отказ): шаг 1.6 проверяет, что идущая задача не называется. Меню запрета не
  подавляется над идущей задачей. Для агента отказ называет отчёт в уведомлении, не файл
  стенограммы. Отписано: отпуск по слову «стоп» над непрочитанной задачей — остановка за
  владельцем. В отпечатке плана нет `flow-forecast.mjs` и набора источника событий: план после
  одобрения не правится, оба файла названы здесь.
- **Вне задачи:** набор в фоне, запущенный командой `…; echo "exit=$?"`, отдаёт уведомление «exit code
  0» при красном итоге — завести задачей.

## Сессии

### 2026-11-21

- Замер до работы: набор проверки конца хода 105 ok; случай «задача кончилась — простой, как
  раньше» стоит в наборе один раз; движок на записи разговора до 01:20:13 называет меню.
- После этапов: набор 117 ok, 0 провалов; `agent-kit:check` — сходится; движок на той же записи
  до 01:20:13 называет задачу `b1fwlt952` и её файл вывода, меню не предлагает.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3463-turn-exit-reads-ended-task

### Where we stand at the minute of the compaction

- **State:** `задача-взята`
- **Stage:** 1 of 2 — An ended task is read, not offered to stop over
- **Next step:** роли читают план, затем одобрение владельца.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3463-turn-exit-reads-ended-task/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3463-turn-exit-reads-ended-task/progress.md
?? docs/tasks/RT-3463-turn-exit-reads-ended-task/plan.md
```

### Commits over the main branch

```
cfbebb6e2 docs(rt:agent-kit): разбор RT-3463 — кончившаяся фоновая задача читается, меню «стоп» над ней не предлагается
258ce324b Merge remote-tracking branch 'origin/RT-3302-checks-rework-3' into RT-3302-checks-rework-3
8df1651d5 Merge remote-tracking branch 'origin/main' into RT-3302-checks-rework-3
cd7265c69 [RT-3422] Аудит очереди падал на ответе 422 сравнения веток (#3462)
9ddac7e28 test(rt:agent-kit): сценарий заметки остаётся в наборе очереди, отставание от главной ветки — в своём наборе (RT-3422)
b4bb97d9d test(rt:agent-kit): сценарии прода против главной ветки вынесены в свой набор и в описание проверки очереди (RT-3422)
293cb2a04 docs(rt:agent-kit): папка задачи об отставании прода разобрана в архив (RT-3422)
b28a1c324 fix(rt:agent-kit): правки после второго круга ревью (RT-3422)
e8c027d3e fix(rt:agent-kit): правки после первого круга ревью (RT-3422)
f8e469657 fix(rt:agent-kit): аудит очереди считает отставание прода без диффа, отказ сравнения — заметка (RT-3422)
d808bc622 docs(rt:agent-kit): план RT-3422 — отставание считается без диффа, отказ сравнения — заметка
595a3d8e1 Merge branch 'RT-3302-checks-rework-3' into RT-3422-board-audit-422
f538329b0 docs: просроченные записи архива удалены
39944c07b Merge remote-tracking branch 'origin/main' into RT-3302-checks-rework-3
3eff9c925 Merge remote-tracking branch 'origin/main' into RT-3302-checks-rework-3
528b255e9 [RT-3421] Раскладка пакета пишет в настройку дерева записи двух модельных проверок (#3452)
8b23720c9 fix(rt:agent-kit): тест снимка прежней редакции правит копию ресурсов, а не общий каталог пакета (RT-3421)
a2c9a5955 Merge remote-tracking branch 'origin/RT-3302-checks-rework-3' into RT-3421-kit-lays-out-model-checks
bc1e02ba6 docs(rt:agent-kit): папка задачи о записях модельных проверок разобрана в архив (RT-3421)
41e378bfd fix(rt:agent-kit): правки после второго круга ревью (RT-3421)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
