# Ход работы

## Где мы

- **State:** `замысел-записан`
- **Stage:** 1 — A branch carries the own copy by a merge or under the head, and it stays a base
- **Done:** план одобрен владельцем 23.11 («Одобряю план RT-3426»), plan-red: все семь проверок
  красные, отметка одобрения записана
- **Next step:** 1.1 — случаи в наборе базы, затем условие в `rt_push_base`
- **Uncommitted:** nothing
- **Waiting for the owner:** nothing
- **PR:** not open yet

## Шаги

- [>] 1.1 The epic under the head that carries the copy is the base
- [ ] 1.2 The epic ahead of the head that carries the copy by a host merge is the base, whether the task took the epic in or not
- [ ] 1.3 The head at the commit of the epic takes the epic as the base, and the copy removed on the host changes nothing
- [ ] 1.4 A branch taken from this one by plain commits stays dropped, a host merge of a higher branch into it included
- [ ] 1.5 No former case of the scenario is lost: the 20 cases of the push suite and the 8 new ones
- [ ] 2.1 The rule of the description names the new condition
- [ ] 2.2 The scenario names the cases

## Решения по ходу

- **Ночью 22.11 готовились разбор и черновик плана, кода нет.** Движок не даёт начать этап без
  одобрения плана владельцем.
- **22.11 задача перешла в эпик RT-3471 и в цепочку от RT-3465.** Коммиты разбора 20.11 перенесены;
  ветка того разбора лежит локально как `RT-3426-grill-2011`.
- **Роли на план.** Критик построил пять историй: условие «строго под вершиной» давало эпик в одной.
  Стратег повторил историю 19.11 и нашёл стопку, которую ломала проверка слияния хоста; условие
  стало линией первых родителей, добавлены случай стопки и общий счёт сценария (решения в разборе).
- **Ветка пересобрана 23.11 на вершине RT-3465.** Ночная ветка стояла на прежней ночной ветке
  RT-3465; разбор, план и ход работы перенесены, прежняя ветка лежит локально как
  `RT-3426-night-before-rebuild`.
- **Новые случаи — в наборе базы.** Набор проверки отправки стоит на 499 строках из 500; набор
  базы `git-guard-push-base-live.test.sh` RT-3465 выделила под эти сценарии. Проверки шагов 1.1–1.4
  читают его, шаг 1.5 держит прежние 20 случаев в наборе отправки.
- **Проверка шага 1.5 — общий счёт двух наборов, `>= 28`.** Счёт одного набора отправки `>= 20`
  был зелёным до работы, и plan-red его отказал; общий счёт до работы даёт 20 и красный.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3426-push-base-under-head

### Where we stand at the minute of the compaction

- **State:** `задача-взята`
- **Stage:** нет — план ждёт одобрения владельца
- **Next step:** одобрение плана владельцем, затем `plan-red`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3426-push-base-under-head/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
01b4b43eb docs(rt:agent-kit): разбор и план RT-3426 на вершине RT-3465 — новые случаи в наборе базы (RT-3426)
3d5b08748 docs(rt:agent-kit): папка RT-3465 разобрана в архив (RT-3465)
045eb59d3 fix(rt:agent-kit): закреплённая ссылка базы названа числом, та же база после переписанного коммита — правки после второго круга ревью (RT-3465)
d2dde38db Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3465-push-base-live-ref
f678cb463 fix(rt:agent-kit): шаги набора идут от закреплённой ссылки базы — правки после второго круга ревью (RT-3465)
94e549124 fix(rt:agent-kit): запись базы своя у ветки и подходит голове над записанной — правки после первого круга ревью (RT-3465)
6f7b9bff9 docs(rt:agent-kit): отметка плана эпика — задача RT-3427 влита, RT-3465 идёт (RT-3465)
f075de21a docs(rt:agent-kit): описание отправки — ссылка снятой ветки не база, отправка берёт базу прогона вперёд (RT-3465)
07d7fbcb6 fix(rt:agent-kit): отправка берёт базу прогона вперёд для того же дерева, отказ называет обе базы (RT-3465)
fe0fdde1f fix(rt:agent-kit): база набора перед отправкой — только ветки, которые держит хостинг (RT-3465)
7e7ef8068 docs(rt:agent-kit): номера сценариев RT-3465 — 1850…1853, разбор правил после RT-3427 рядом с планом эпика (RT-3465)
a80194a22 docs(rt:agent-kit): ход работы RT-3465 — план одобрен, ветка пересобрана на вершине RT-3427 (RT-3465)
40fca5dea [RT-3427] Девять длинных правил помещаются в выдачу проверки правил: правка с window и с переменными окружения получает правила с первого вызова (#3512)
e4d465277 docs(rt:agent-kit): план RT-3465 — база из живых веток и закреплённая за деревом набора (RT-3465)
7b400cfd1 docs(rt:agent-kit): разбор RT-3465 — база набора только из веток, которые хостинг держит (RT-3465)
b149d3842 fix(rt:agent-kit): у холодных частей epic-flow, mockups и queue-audit есть раздел ловушек (RT-3427)
e71e29e57 docs(rt:agent-kit): отметка плана эпика — задача RT-3419 влита, RT-3427 идёт (RT-3427)
ebd75aed8 Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3427-long-rules-fit-2
ef642ccff docs(rt:agent-kit): папка RT-3427 разобрана в архив, потери для RT-3510 названы (RT-3427)
6a69a47b2 fix(rt:agent-kit): строки doc-style-human и platform-access возвращены, RT-3510 на деление observability — правки после второго круга ревью (RT-3427)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
