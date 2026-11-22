# Ход работы

## Где мы

- **State:** `этап-идёт`
- **Stage:** нет — план одобрен 22.11 меню «Одобряю план RT-3427», `plan-red` — все восемь проверок красные
- **Done:** проба на копии дерева — 37 «pass» из 43, перемерено 22.11 на вершине RT-3419 — те же 37; план в три этапа переписан по находкам `goal-critic` и `product-strategist`, `plan-check` — код 0
- **Next step:** этап 1 — шаг 1.1, observability
- **Uncommitted:** nothing
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
- [>] 3.2 The blind retelling and the critic find no loss in each of the nine rules

## Решения по ходу

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
