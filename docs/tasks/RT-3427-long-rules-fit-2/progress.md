# Ход работы

## Где мы

- **State:** `этапы-кончились`
- **Stage:** все три этапа закрыты, шаги 1.1–3.2 измерены `step N.M`
- **Done:** проба — 43 «pass» из 43 (было 37), самая полная строка — кнопка кита, 9 988 из
  10 000; сверка смысла — 0 потерь, и у исправленной копии с таблицей имён тоже 0; размеры после
  пакета: observability 4791, platform-access 2685, epic-flow 2996, queue-audit 2981, mockups 2775,
  task-flow 2999, task-flow-owner 2992, doc-style-human 2991, task-delivery-loop 2995; пересказ
  вслепую, четыре круга — восемь правил без потерь, 9 потерь у observability в находке эпика;
  первый круг ревью проведён, находки исправлены
- **Next step:** коммит первого круга, затем второй круг ревью
- **Uncommitted:** правки первого круга ревью
- **PR:** not open yet

## Шаги

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 observability fits with the rules of a service of the receiver
- [x] 1.2 platform-access fits with the three rules of a store edit
- [x] 1.3 epic-flow, mockups and queue-audit fit
- [x] 1.4 task-flow and task-flow-owner fit with their overrides
- [x] 1.5 doc-style-human fits
- [x] 2.1 task-delivery-loop fits with the rules of an edit of the epic plan
- [x] 3.1 The probe passes every line and the meaning check finds no loss
- [x] 3.2 The blind retelling and the critic find no loss in each of the nine rules

## Решения по ходу

- **Проверка шага 3.2 заменена:** `[ "$(grep -c '^- loss:' docs/tasks/RT-3427-long-rules-fit-2/retell.md)" = 9 ] && [ "$(grep '^- loss:' docs/tasks/RT-3427-long-rules-fit-2/retell.md | grep -cv '^- loss: observability ')" = 0 ] && grep -c '^- rule: .* — losses 0$' docs/tasks/RT-3427-long-rules-fit-2/retell.md | tr -d ' '` → = 8
  После первого круга ревью и четвёртого круга пересказа потери остались у одного правила:
  observability, 9 штук. Проверка ловит любую новую потерю: число потерь закреплено.

- **Прежняя замена шага 3.2 снята первым кругом ревью.** После трёх кругов пересказа она ждала
  6 правил без потерь и не считала три правила с 15 потерями; ревью показало, что новая потеря её
  не роняет. epic-flow и task-delivery-loop после этого вернули свои потери в горячую часть.

- **Ветка в цепочке от RT-3419.** Ночная цепочка: RT-3469 → RT-3423 → RT-3434 → RT-3425 →
  RT-3468 → RT-3419 → RT-3427.
- **Ветка пересобрана 22.11 на вершине RT-3419.** Ночная ветка стояла на прежнем плане RT-3419,
  который владелец переопределил; три коммита задачи перенесены, прежняя ветка лежит локально как
  `RT-3427-night-before-rebuild` — в ней коммит `bad7711d8`, от которого считает сверка смысла.
- **Проба и сверка смысла лежат в папке задачи,** как у RT-3410: план зовёт их по пути.
- **Признак сужен с 47 строк до 43.** Роли показали: папка задачи и команды с телом PR и карточки
  не проходят ни при каком сжатии; им нужна выдача правил частями — решение владельца.
- **Проба строит копию по настоящему пути.** Под ссылкой `/var` таблица решений не узнавала себя
  запущенной, и каждый отказ читался «no rule».

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3427-long-rules-fit-2

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** нет — план одобрен 22.11 меню «Одобряю план RT-3427», `plan-red` — все восемь проверок красные
- **Next step:** этап 1 — шаг 1.1, observability
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3427-long-rules-fit-2/progress.md`; the plan lies next to it.

### Uncommitted

```
 M .claude/rt-kit/overrides/rules/task-flow-owner.md
 M .claude/rt-kit/overrides/rules/task-flow.md
 M .claude/skills/doc-style-human/SKILL.md
 M .claude/skills/epic-flow/SKILL.md
 M .claude/skills/mockups/SKILL.md
 M .claude/skills/observability/SKILL.md
 M .claude/skills/platform-access/SKILL.md
 M .claude/skills/queue-audit/SKILL.md
 M .claude/skills/task-delivery-loop/SKILL.md
 M .claude/skills/task-flow-owner/SKILL.md
 M .claude/skills/task-flow/SKILL.md
 M projects/agent-kit/assets/patterns/doc-style-human.md
 M projects/agent-kit/assets/rules/epic-flow.md
 M projects/agent-kit/assets/rules/mockups.needs-mockups.md
 M projects/agent-kit/assets/rules/observability.needs-app.md
 M projects/agent-kit/assets/rules/platform-access.md
 M projects/agent-kit/assets/rules/queue-audit.github.md
 M projects/agent-kit/assets/rules/task-flow-owner.md
```

### Commits over the main branch

```
98fe08dfc fix(rt:agent-kit): девять длинных правил помещаются в выдачу проверки правил — 43 строки пробы из 43 (RT-3427)
9aa8cf172 docs(rt:agent-kit): ход работы RT-3427 — план одобрен, шаги плана в ходе работы (RT-3427)
ac0163f42 docs(rt:agent-kit): ход работы RT-3427 после пересборки ветки, находки разбора правил после RT-3419 (RT-3427)
446e88fe2 docs(rt:agent-kit): находка — набор правил длиннее предела отказан целиком (RT-3427)
8d55439cb docs(rt:agent-kit): план RT-3427 — девять правил помещаются в выдачу на 43 строках пробы (RT-3427)
9dd7ce9c3 docs(rt:agent-kit): разбор RT-3427 — бюджет правил по пробе, а не по пределу 3000 (RT-3427)
28c03c28c Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3419-stop-word-releases-task
a9ef1fe10 Merge remote-tracking branch 'origin/main' into RT-3471-checks-rework-4
39f04d5e6 docs(rt:agent-kit): папка задачи об ожидании вместо «стоп» разобрана в архив (RT-3419)
1716f813c docs(rt:agent-kit): проверка шага 2.2 не считает снятые ключи слов, строки с ними помечены (RT-3419)
25eac987a Revert "docs(rt:agent-kit): папка задачи об ожидании вместо «стоп» разобрана в архив (RT-3419)"
ee64ae3c0 docs(rt:agent-kit): папка задачи об ожидании вместо «стоп» разобрана в архив (RT-3419)
dfa019761 Merge remote-tracking branch 'origin/RT-3471-checks-rework-4' into RT-3419-stop-word-releases-task
501841585 fix(rt:agent-kit): отметка Esc без блобов запроса, слово владельца по общему правилу, серверы и паузы — правки после второго круга ревью (RT-3419)
d9a9f66c8 fix(rt:agent-kit): отпуск по Esc, сообщение из очереди, сервер и зависшая задача — правки после первого круга ревью (RT-3419)
c63c18592 docs(rt:agent-kit): правила, команда ночи и описания называют Esc и границу 90 минут (RT-3419)
7fa326285 fix(rt:agent-kit): слово владельца ход не отпускает, Esc отпускает, меню застревания — «подскажу путь» (RT-3419)
747d7b954 [RT-3468] Отказ чужой проверки остановки не зовёт меню, проверка черновика не трогает черновики других копий (#3506)
436565eea fix(rt:agent-kit): ожидание своей фоновой задачи держится до 90 минут, зависшая задача названа (RT-3419)
5ccfe8004 docs(rt:agent-kit): ход работы RT-3419 — план одобрен, шаги плана в ходе работы (RT-3419)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
