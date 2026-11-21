# Ход работы

## Где мы

- **State:** `задача-взята`
- **Stage:** 1 of 2 — An ended task is read, not offered to stop over
- **Done:** разбор в истории; план поправлен по находкам goal-critic и product-strategist.
- **Next step:** одобрение плана владельцем.
- **Uncommitted:** план
- **PR:** not open yet

## Шаги

- [>] 1.1 A task that ended after the last call makes the stop not idle
- [ ] 1.2 The refusal names the task and its output and offers no menu
- [ ] 1.3 Only a call that names the task or its output reads it
- [ ] 1.4 A task the session stopped itself, or one with no start in the record, is not unread
- [ ] 1.5 The menu of a forbidden step is not offered over an unread task
- [ ] 1.6 A task running past the bound is named, not the menu
- [ ] 1.7 A transcript shaped as on 21.11 holds the stop through the hook and names the task
- [ ] 1.8 A refusal with no ended task still gives the menu
- [ ] 2.1 The old case of an ended task is gone from the suite
- [ ] 2.2 The old line of an ended task is gone from the description
- [ ] 2.3 The scenario of the unread task stands in the description

## Решения по ходу

## Сессии

### 2026-11-21

- Замер до работы: набор проверки конца хода 105 ok; случай «задача кончилась — простой, как
  раньше» стоит в наборе один раз; движок на записи разговора до 01:20:13 называет меню.

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
