# Ход работы

## Где мы

- **State:** `этап-идёт`
- **Stage:** 1 — The steps of the set run on the pinned node
- **Done:** план одобрен владельцем 23.11 («Одобряю план RT-3466»), plan-red: все шесть проверок
  красные; пробная отправка на текущем коде даёт 1 строку неверной node
- **Next step:** 1.1 — общая функция закреплённой node и случаи SC-AK-1846
- **Uncommitted:** nothing
- **Waiting for the owner:** nothing
- **PR:** not open yet

## Шаги

- [>] 1.1 A step of the set and of the run ahead sees the pinned node when another stands first in PATH
- [ ] 1.2 A pin of a major takes the highest installed match; an alias and a tree without a pin run as before
- [ ] 1.3 A pinned node not installed with another node in PATH refuses the push by one line in the guard and in the git hook
- [ ] 1.4 A pinned node not installed with the same node in PATH runs the steps as before
- [ ] 1.5 A real push from a clone with node 20 first goes through the git hook with no line of a wrong node
- [ ] 2.1 The scenarios stand in the description

## Решения по ходу

- **Ветка в цепочке от RT-3426.** Цепочка эпика: RT-3465 влита → RT-3426 (#3523) → RT-3466.
- **Номера сценариев SC-AK-1846, 1847.** 23.11 они свободны: 1849…1853 заняты, 1848 держит план
  RT-3461.
- **Роли на первый план.** Стратег и критик нашли одно и то же: набор вперёд гоняет шаги своим
  циклом и не получил бы закреплённую node; пустой набор проверка отправки пропускает, так что
  строка о версии без своей строки таблицы решений ослабила бы отправку; отказ по отсутствию
  каталога nvm ложен, когда node в `PATH` та же. План переписан под все три; живая отправка из
  клона — шаг 1.5, скрипт `live-push.sh` рядом с планом.
- **Ветка пересобрана 23.11 на вершине RT-3426.** Ночная ветка стояла на прежней ночной цепочке;
  разбор, план и ход работы перенесены, прежняя ветка лежит локально как
  `RT-3466-night-before-rebuild`. Скрипт живой отправки проверяет свой временный путь до git и до
  удаления, а пробный коммит несёт файл.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3466-push-set-pinned-node

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 — The steps of the set run on the pinned node
- **Next step:** 1.1 — общая функция закреплённой node и случаи SC-AK-1846
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3466-push-set-pinned-node/progress.md`; the plan lies next to it.

### Uncommitted

```
 M ../../docs/tasks/RT-3466-push-set-pinned-node/progress.md
 M assets/hooks/facts.sh
 M assets/hooks/git-guard-push-ahead.sh
 M assets/hooks/push-set.sh
```

### Commits over the main branch

```
69e665137 docs(rt:agent-kit): ход работы RT-3466 — план одобрен, шаги этапов; разбор правил после RT-3426 (RT-3466)
183647f48 docs(rt:agent-kit): разбор и план RT-3466 на вершине RT-3426 — скрипт живой отправки охраняет свой путь (RT-3466)
41f124924 docs(rt:agent-kit): папка RT-3426 разобрана в архив (RT-3426)
7ebc1c0f0 fix(rt:agent-kit): все родители слияния хоста, случай строки continue — правки после проверки второго круга свежим QA (RT-3426)
55e620aab fix(rt:agent-kit): слияние хоста с копией ищется во всей ветке эпика — правки после второго круга ревью (RT-3426)
c4b164a0d fix(rt:agent-kit): ветка, принявшая эту слиянием сессии, не база — правки после первого круга ревью (RT-3426)
ea9824371 Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3426-push-base-under-head
769b251d0 docs(rt:agent-kit): описание отправки — ветка стоит на этой по копии на линии первых родителей (RT-3426)
0399affb8 fix(rt:agent-kit): ветка эпика с копией задачи остаётся базой набора (RT-3426)
0c863cd16 docs(rt:agent-kit): ход работы RT-3426 — план одобрен, шаги этапов (RT-3426)
561d73b9e docs(rt:agent-kit): находки разбора правил после RT-3465 рядом с планом эпика (RT-3426)
4e3d7e3fd [RT-3465] Зелёный набор перед отправкой больше не отклоняется из-за снятой или сдвинутой ветки базы (#3519)
790cd9de8 docs(rt:agent-kit): разбор и план RT-3426 на вершине RT-3465 — новые случаи в наборе базы (RT-3426)
3d5b08748 docs(rt:agent-kit): папка RT-3465 разобрана в архив (RT-3465)
045eb59d3 fix(rt:agent-kit): закреплённая ссылка базы названа числом, та же база после переписанного коммита — правки после второго круга ревью (RT-3465)
d2dde38db Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3465-push-base-live-ref
f678cb463 fix(rt:agent-kit): шаги набора идут от закреплённой ссылки базы — правки после второго круга ревью (RT-3465)
94e549124 fix(rt:agent-kit): запись базы своя у ветки и подходит голове над записанной — правки после первого круга ревью (RT-3465)
6f7b9bff9 docs(rt:agent-kit): отметка плана эпика — задача RT-3427 влита, RT-3465 идёт (RT-3465)
f075de21a docs(rt:agent-kit): описание отправки — ссылка снятой ветки не база, отправка берёт базу прогона вперёд (RT-3465)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
