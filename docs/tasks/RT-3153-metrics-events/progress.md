# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 5 of 5 — роли, экзамен и правила
- **Done:** все пять этапов
- **Next step:** таблицы ролей, набор перед отправкой, разбор папки
- **Uncommitted:** нет
- **Waiting for the owner:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Подпись содержимого дерева и вызова в отдельном файле меток
- [x] 1.2 Запись guard-deny с признаком пустого отказа
- [x] 1.3 Счёт пустых отказов в отчёте
- [x] 2.1 Строка запуска с исходом, секундами и родом шага
- [x] 2.2 Пустой запуск по подписи содержимого за день
- [x] 2.3 Счёт минут в отчёте
- [x] 3.1 Метка передачи при открытии PR и снятии черновика
- [x] 3.2 Хук UserPromptSubmit со счётчиком правок ветки и записью в карту событий
- [x] 4.1 Функция профиля `rt_pull_outcomes` и значение по умолчанию для GitHub
- [x] 4.2 Чистый расчёт первой приёмки, отката и повторного PR
- [x] 4.3 Строки отчёта и счёт каждого PR один раз
- [x] 5.1 Запись вызова роли и команды
- [x] 5.2 Запись итога экзамена
- [x] 5.3 Объявление правила гардом и счёт отказов после загрузки
- [x] 5.4 Знаменатель доли правок

## Decisions along the way

- Запись `empty=0` пишется наравне с `empty=1`: без неё отчёт не отличит ноль от старых записей без признака.
- Подпись дерева не читает каталог наблюдений: в дереве, которое его не игнорирует, своя запись выглядела бы правкой.
- Подпись берётся с копии вызова, а не с корня проекта: хуки стоят в основной копии, правка во второй копии иначе считалась бы повтором.
- Строка запуска пишется на каждую проверку набора: потерянные минуты сравниваются по одной команде, а не по всему набору.
- Зелёная проверка с отметкой не запускается и строки не даёт: запуска не было.
- Черновик передачей не считается: передача наступает при снятии черновика. Первая подпись ветки остаётся.
- Счётчик правок делится на до и после передачи: первая приёмка читает только правки после неё.
- Заявка без подписи передачи не считается вовсе: так старые заявки не роняют первое число, а человек, открывший заявку мимо проверки, не попадает в счёт.
- Итог пишется в наблюдения в день чтения: отчёт считает по ним, а номера заявок лежат только в файле учёта.
- Отчёт сам читает итоги: отправка из RT-3154 позовёт тот же `collectOutcomes`.
- Роль в фоне отвечает фактом запуска: такой вызов считается вызовом, приговора у него нет. Иначе запуск читался бы как «принято».
- Правило объявили 27 проверок из 36: у остальных нет своего правила пакета, им объявлять нечего.
- Подделка хостинга не поймала два промаха: потерю коммитов и метку эпика на заявке. Оба нашло чтение настоящего GitHub, первый теперь держит проверка набора.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/rt-3049-push
**Branch:** RT-3153-metrics-events

### Where we stand at the minute of the compaction

- **State:** `этапы-кончились`
- **Stage:** 5 of 5 — роли, экзамен и правила
- **Next step:** таблицы ролей, набор перед отправкой, разбор папки
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3153-metrics-events/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/agent-kit/assets/defaults/project.sh
 M projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh
 M projects/agent-kit/assets/hooks/metric-marks.sh
 M projects/agent-kit/assets/hooks/role-calls.sh
 M projects/agent-kit/src/lib/metric-usage.spec.ts
 M projects/agent-kit/src/lib/metric-usage.ts
 M projects/agent-kit/src/lib/metrics.ts
 M projects/agent-kit/src/lib/outcomes.spec.ts
 M projects/agent-kit/src/lib/outcomes.ts
 M projects/agent-kit/tests/metric-events.test.sh
?? projects/agent-kit/assets/hooks/handover-mark.sh
```

### Commits over the main branch

```
3bd9c9ba3 test(rt:agent-kit): состав полей отказа дополнен признаком и правилом
8c58a31b1 feat(rt:agent-kit): отчёт считает роли, экзамены и правила
1aa68ff77 feat(rt:agent-kit): отчёт считает главную метрику
c1b9f01b6 feat(rt:agent-kit): передача на ревью и правки владельца
1a4523562 feat(rt:agent-kit): отчёт считает запуски и потерянные минуты
4b5c6f9eb feat(rt:agent-kit): отчёт считает пустые отказы проверок
97bd0eceb docs(rt:agent-kit): папка задачи RT-3153
871604260 Merge remote-tracking branch 'origin/RT-3151-agent-kit-metrics' into RT-3152-metrics-catalog
df0ff2925 Merge remote-tracking branch 'origin/main' into RT-3151-agent-kit-metrics
f05fe69c7 fix(rt:agent-kit): договорённость эпика не держит PR его задач
edc86bc27 fix(rt:agent-kit): отчёт называет прочитанные дни и удалённые файлы
cb66fd5e0 docs(rt:agent-kit): описание пакета укладывается в предел длины
ad74252bc docs(rt:agent-kit): папка задачи RT-3152 разобрана в запись архива
b1e471525 feat(rt:agent-kit): команда metrics считает качество пакета по наблюдениям дерева
09aedadd7 docs(rt:agent-kit): договорённость о метриках пакета правил
4811f6680 docs(rt:agent-kit): план эпика RT-3151 о метриках пакета правил
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
