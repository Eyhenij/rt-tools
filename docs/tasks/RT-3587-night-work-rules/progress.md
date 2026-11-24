# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Защиты ночью
- **Done:** этап 1 — закон, закон доставки, правило, образец и команда ночи; старые запреты ушли
  (`grep -c "nothing goes outside during the night" …/commands/night.md` — 0)
- **Next step:** 2.1 — вердикт защиты конца хода ночью даёт умолчание
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Закон ночной работы допускает действие, которое владелец назвал
- [x] 1.2 Закон доставки признаёт заранее сказанное слово о классе слияний
- [x] 1.3 Правило снимает запрет без исключения
- [x] 1.4 Правило не откладывает PR на утро
- [x] 1.5 Правило не откладывает внешний шаг отказа на утро без разрешения
- [x] 1.6 Правило называет исключение для названного владельцем
- [x] 1.7 Правило называет репетицию вызовов до ухода владельца
- [x] 1.8 Правило называет прерванный вызов и ход без обещания
- [x] 1.9 Правило: приказ работать самому — не одобрение
- [x] 1.10 Правило называет ночной разбор промаха
- [x] 1.11 Образец снимает запрет и строку «ждёт PR»
- [x] 1.12 Образец допускает названное владельцем
- [x] 1.13 Команда ночи не обещает, что ничего не уйдёт наружу
- [x] 1.14 Команда ночи пишет разрешение и границу в голову списка
- [>] 2.1 Вердикт защиты конца хода ночью даёт умолчание вместо меню
- [ ] 2.2 Сценарий: граница впереди даёт умолчание, прошедшая — меню
- [ ] 2.3 Защита согласий кита ночью отказывает вместо окна
- [ ] 2.4 Сценарии защиты согласий кита: ночь и день
- [ ] 2.5 Правила и защита разложены в дерево

## Decisions along the way

- **Слово владельца о слияниях, 24.11.2026:** «Разрешаю всё это» — на вопрос, сливать ли самому PR
  задач RT-3585, RT-3587, RT-3588, RT-3589 в ветку эпика после двух кругов ревью и зелёного набора,
  а PR эпика RT-3586 в main — после зелёного прогона.
- **Пересечение с #3584** (эпик RT-3580 соседней копии): та же правка вердикта защиты конца хода
  ночью и правила `autonomous-work`. Соседней сессии отправлено сообщение; до ответа этап 1 идёт,
  этап 2 сверяется с её веткой перед началом.
- **Check of step 1.3 replaced:** `grep -c "Nothing goes outside during the night\.\*\*" projects/agent-kit/assets/rules/autonomous-work.md || true` → = 0
- **Check of step 1.4 replaced:** `grep -c "the PR is opened in the morning" projects/agent-kit/assets/rules/autonomous-work.md || true` → = 0
- **Check of step 1.5 replaced:** `grep -c "not carried out at night" projects/agent-kit/assets/rules/autonomous-work.md || true` → = 0
- **Check of step 1.11 replaced:** `grep -c "Nothing goes outside during the night: no" projects/agent-kit/assets/patterns/autonomous-work-run.md || true` → = 0
- **Check of step 1.13 replaced:** `grep -c "does not merge and does not open requests" projects/agent-kit/assets/commands/night.md || true` → = 0

## Sessions

### 24.11.2026

- Задача эпика RT-3586 заведена по слову владельца «Отправь разборы и исправь все что нашел».
  Стратег и критик цели прочли первый план: ночной PR всё равно встал бы на окне защиты согласий
  кита, признак ночи «список за сутки» ошибается днём, старые запреты оставались рядом с
  исключением. План переписан до одобрения.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3587-night-work-rules

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Защиты ночью
- **Next step:** 2.1 — вердикт защиты конца хода ночью даёт умолчание
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3587-night-work-rules/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3587-night-work-rules/progress.md
 M projects/agent-kit/assets/commands/night.md
 M projects/agent-kit/assets/laws/autonomous-work.md
 M projects/agent-kit/assets/laws/delivery.md
 M projects/agent-kit/assets/patterns/autonomous-work-run.md
 M projects/agent-kit/assets/rules/autonomous-work.md
```

### Commits over the main branch

```
66f24a20f Merge remote-tracking branch 'origin/RT-3586-night-findings-fixes' into RT-3587-night-work-rules
5abceba2a [RT-3585] Проверка согласий кита не требует согласий за чужие правки кита, сборка графов не краснит проверку Angular Doctor (#3595)
314476266 docs(rt:agent-kit): папка задачи RT-3585 разобрана в архивную запись (RT-3585)
fae352780 fix(rt:agent-kit): правки после второго круга ревью (RT-3585)
1ba81b0d5 fix(rt:agent-kit): правки после первого круга ревью (RT-3585)
91dd6209e fix(rt:agent-kit): сценарии не зависят от временного каталога машины (RT-3585)
85816de24 fix(rt:agent-kit): сборка графов удаляет graph.html (RT-3585)
537254bee fix(rt:agent-kit): проверка согласий судит слитые задачи по их записям (RT-3585)
0729657f9 docs(rt:agent-kit): разбор и план RT-3587 — правила ночной работы (RT-3587)
974506ce7 docs(rt:agent-kit): разбор и план RT-3585 — находки ночи 23.11 (RT-3585)
019e56e95 docs(rt:agent-kit): план эпика RT-3586 и назначение копии — находки ночи 23.11 (RT-3586)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
