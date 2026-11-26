# Progress

## Where we stand

- **State:** `просьба-не-разобрана`
- **Stage:** 2 of 2 — шаги обоих этапов отмечены движком; строку состояния выше первого отказывает движок главной копии на `00422d2cf`
- **Done:** модуль `flow-merge.mjs`, контекст слияния, суждение проверки, 12 случаев SC-AK-2016, спек, раскладка; живая проба через хук
- **Next step:** первый круг ревью по всей ветке
- **Uncommitted:** ничего
- **PR:** not open yet

## Steps

- [x] 1.1 Блок конфликта в модуле слияния
- [x] 1.2 Слияние проверенной базы в контексте проверки
- [x] 1.3 Разрешение конфликта в суждении проверки
- [x] 1.4 Случаи SC-AK-2016 в наборе проверки
- [x] 2.1 Правило и сценарий в спеке проверки
- [x] 2.2 Раскладка пакета в дерево
- [x] 2.3 Живая проба после правки

## Decisions along the way

- **Задача взята вне эпика RT-3602 по ответу владельца в меню 26.11 «Задача вне эпика от main».** Слияние `main` в
  ветку эпика встало на отказе проверки хода работы; предложение о том же ушло в приёмник пакета.

## Sessions

### 2026-11-26

- Проба во временном клоне: слияние `origin/main` в `RT-3602-owner-stop-holds`, 1 конфликт в источнике движка;
  `edit=deny checkout=deny newline=deny unreviewed=deny`, причина отказа — правило охраны файлов движка.
- Роли прочитали план: хук берёт движок из `tools/` папки проекта сессии, у этой сессии это главная копия на
  `00422d2cf`. План переписан, проба идёт через сам хук: `edit=deny checkout=deny newline=deny outside=deny unreviewed=deny`.
- Владелец одобрил план, `plan-red` записал отметку. Строку состояния выше `просьба-не-разобрана` проверка
  отказывает: движок `00422d2cf` меряет задачу вне эпика на `эпик-заведён` (индекс 2), движок этой ветки — на
  `замысел-записан`. Код в дереве поэтому не правится.
- Код, спек и случаи написаны во временном клоне ветки
  `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/611348a0-4037-4ebe-8492-719501de2c3b/scratchpad/rt-merge/impl`:
  `flow-merge.mjs` 39 строк, `flow-guard.mjs` 497, `flow-guard-run.mjs` 111, набор 491. Набор стража: 130 ok,
  0 провалов, из них 12 случаев SC-AK-2016. Проба с движком клона: `edit=pass checkout=pass newline=deny outside=deny unreviewed=deny`.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/epic-3471-merge
**Branch:** RT-3691-merge-base-engine-conflict

### Where we stand at the minute of the compaction

- **State:** `просьба-не-разобрана`
- **Stage:** 0 of 2 — план написан, ждёт ролей и одобрения владельца
- **Next step:** коммит разбора, роли `product-strategist` и `goal-critic` по плану, затем вопрос владельцу об одобрении
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3691-merge-base-engine-conflict/progress.md`; the plan lies next to it.

### Uncommitted

```
?? docs/tasks/RT-3691-merge-base-engine-conflict/plan.md
```

### Commits over the main branch

```
f43270048 docs(rt:agent-kit): разбор и ход работы RT-3691
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
