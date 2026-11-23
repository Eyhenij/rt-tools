# Ход работы

## Где мы

- **State:** `этапы-кончились`
- **Stage:** все три этапа закрыты; живая проверка, круги ревью
- **Done:** этап 1 — выбор базы один раз за вызов спрашивает `git ls-remote --heads` и сверяет
  имя целиком; без ответа хостинга база по ссылкам копии и строка на stderr; SC-AK-1850 — 4 ok,
  SC-AK-1851 — 2 ok; SC-AK-1340 о ссылке снятой ветки переписан. Этап 2 — прогон вперёд пишет
  дерево, базу и её коммит в каталог рабочей копии; проверка отправки и хук git берут их для того
  же дерева, ссылку после чистки ставят обратно, ключ отметки — по записанному коммиту; отказ
  называет обе базы. SC-AK-1852 — 8 ok, SC-AK-1853 — 1 ok, набор отправки — 99 ok, 0 провалов;
  без чтения записи три сценария отправки SC-AK-1852 красные. Этап 3 — SC-AK-1850…1853 в
  описании, «Then the base is that ref» — 0, правила, данные, решения и привязки переписаны.
- **Живая проверка 23.11:** PR #3512 влит в ветку эпика в 02:10, хостинг снял ветку RT-3427, ссылка
  на неё в копии осталась. В копии 30 ссылок, хостинг держит 7 веток, мёртвых ссылок 22. Прежний
  код взял базой `origin/RT-3427-long-rules-fit-2`, новый — `origin/RT-3471-checks-rework-4`, за
  3 с с одним вызовом хостинга. Запись базы на этой копии написана и прочитана: дерево, база,
  коммит; `rt_push_base_recorded` и `rt_push_base_last` отвечают веткой эпика.
- **Next step:** первый круг ревью
- **Uncommitted:** этап 3
- **PR:** not open yet

## Шаги

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 A ref of a branch removed on the host is no base, and a prune between the set and the push changes nothing
- [x] 1.2 With no answer from the host the run ahead takes the refs of the copy and prints the line
- [x] 2.1 The push guard takes the base of the run ahead for the same tree when the lower branch is merged and removed or a nearer branch appears during the set
- [x] 2.2 The refusal «No green mark» names the base of the push and the base of the last run ahead
- [x] 3.1 The scenarios stand in the description
- [x] 3.2 No scenario keeps the ref of a removed branch as the base

## Решения по ходу

- **Проверка шага 1.1 заменена:** `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-tests.test.sh 2>&1 | grep -c 'ok .*SC-AK-1850'` → >= 3 · слово владельца: «Одобряю план RT-3465»
- **Проверка шага 1.2 заменена:** `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-tests.test.sh 2>&1 | grep -c 'ok .*SC-AK-1851'` → >= 2 · слово владельца: «Одобряю план RT-3465»
- **Проверка шага 2.1 заменена:** `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-tests.test.sh 2>&1 | grep -c 'ok .*SC-AK-1852'` → >= 3 · слово владельца: «Одобряю план RT-3465»
- **Проверка шага 2.2 заменена:** `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-tests.test.sh 2>&1 | grep -c 'ok .*SC-AK-1853'` → >= 1 · слово владельца: «Одобряю план RT-3465»
- **Проверка шага 3.1 заменена:** `grep -c -E '^### SC-AK-185[0-3]' docs/specs/agent-kit/push-gate-ahead/scenarios.md` → = 4 · слово владельца: «Одобряю план RT-3465»
- **Проверка шага 3.2 заменена:** `grep -c 'Then the base is that ref' docs/specs/agent-kit/push-gate-ahead/scenarios.md || true` → = 0 · слово владельца: «Одобряю план RT-3465»
- **Номера сценариев — SC-AK-1850…1853, а не 1842…1845.** План ночи 22.11 взял 1842…1845, но
  RT-3419 после этого заняла 1842 и 1843 сценариями хода; номер сценария выдаётся один раз.
  Проверки пяти шагов заменены только номерами, ожидаемые числа те же.

- **Ветка пересобрана 23.11 на вершине RT-3427.** Ночная ветка стояла на прежней ветке RT-3427
  до её пересборки; разбор и план перенесены, прежняя ветка лежит локально как
  `RT-3465-night-before-rebuild`.
- **Ветка в цепочке от RT-3427.** Ночная цепочка: RT-3469 → RT-3423 → RT-3434 → RT-3425 →
  RT-3468 → RT-3419 → RT-3427 → RT-3465.
- **Роли на первом плане 22.11.** Фильтр живых веток один разводил базы при слиянии нижней ветки
  во время набора и без сети; в план вошла база, закреплённая за деревом набора, и отказ с двумя
  базами.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3465-push-base-live-ref

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 — отправка судит дерево от базы своего набора
- **Next step:** шаг 2.1 — запись базы набора и её коммита, проверка отправки берёт их
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3465-push-base-live-ref/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
fe0fdde1f fix(rt:agent-kit): база набора перед отправкой — только ветки, которые держит хостинг (RT-3465)
7e7ef8068 docs(rt:agent-kit): номера сценариев RT-3465 — 1850…1853, разбор правил после RT-3427 рядом с планом эпика (RT-3465)
a80194a22 docs(rt:agent-kit): ход работы RT-3465 — план одобрен, ветка пересобрана на вершине RT-3427 (RT-3465)
e4d465277 docs(rt:agent-kit): план RT-3465 — база из живых веток и закреплённая за деревом набора (RT-3465)
7b400cfd1 docs(rt:agent-kit): разбор RT-3465 — база набора только из веток, которые хостинг держит (RT-3465)
b149d3842 fix(rt:agent-kit): у холодных частей epic-flow, mockups и queue-audit есть раздел ловушек (RT-3427)
e71e29e57 docs(rt:agent-kit): отметка плана эпика — задача RT-3419 влита, RT-3427 идёт (RT-3427)
ebd75aed8 Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3427-long-rules-fit-2
ef642ccff docs(rt:agent-kit): папка RT-3427 разобрана в архив, потери для RT-3510 названы (RT-3427)
6a69a47b2 fix(rt:agent-kit): строки doc-style-human и platform-access возвращены, RT-3510 на деление observability — правки после второго круга ревью (RT-3427)
c13216894 [RT-3419] Агент ждёт свою долгую задачу до итога, «стоп» ход не отпускает, останавливает только Esc (#3509)
80762abf6 fix(rt:agent-kit): потери epic-flow и task-delivery-loop возвращены, итог шага 3.2 закреплён — правки после первого круга ревью (RT-3427)
5d0a12ac0 fix(rt:agent-kit): пересказ вслепую — шесть правил без потерь, 15 потерь трёх правил в находке (RT-3427)
98fe08dfc fix(rt:agent-kit): девять длинных правил помещаются в выдачу проверки правил — 43 строки пробы из 43 (RT-3427)
9aa8cf172 docs(rt:agent-kit): ход работы RT-3427 — план одобрен, шаги плана в ходе работы (RT-3427)
ac0163f42 docs(rt:agent-kit): ход работы RT-3427 после пересборки ветки, находки разбора правил после RT-3419 (RT-3427)
446e88fe2 docs(rt:agent-kit): находка — набор правил длиннее предела отказан целиком (RT-3427)
8d55439cb docs(rt:agent-kit): план RT-3427 — девять правил помещаются в выдачу на 43 строках пробы (RT-3427)
9dd7ce9c3 docs(rt:agent-kit): разбор RT-3427 — бюджет правил по пробе, а не по пределу 3000 (RT-3427)
28c03c28c Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3419-stop-word-releases-task
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
