# Ход работы

## Где мы

- **State:** `замысел-записан`
- **Stage:** 1 — база берётся из веток, которые держит хостинг
- **Done:** план одобрен 23.11 меню «Одобряю план RT-3465»; `plan-red` — все шесть проверок
  красные; ветка пересобрана на вершине RT-3427
- **Next step:** шаг 1.1 — сценарий ссылки удалённой ветки и чистки ссылок между набором и отправкой
- **Uncommitted:** ход работы после одобрения
- **PR:** not open yet

## Шаги

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [>] 1.1 A ref of a branch removed on the host is no base, and a prune between the set and the push changes nothing
- [ ] 1.2 With no answer from the host the run ahead takes the refs of the copy and prints the line
- [ ] 2.1 The push guard takes the base of the run ahead for the same tree when the lower branch is merged and removed or a nearer branch appears during the set
- [ ] 2.2 The refusal «No green mark» names the base of the push and the base of the last run ahead
- [ ] 3.1 The scenarios stand in the description
- [ ] 3.2 No scenario keeps the ref of a removed branch as the base

## Решения по ходу

- **Ветка пересобрана 23.11 на вершине RT-3427.** Ночная ветка стояла на прежней ветке RT-3427
  до её пересборки; разбор и план перенесены, прежняя ветка лежит локально как
  `RT-3465-night-before-rebuild`.
- **Ветка в цепочке от RT-3427.** Ночная цепочка: RT-3469 → RT-3423 → RT-3434 → RT-3425 →
  RT-3468 → RT-3419 → RT-3427 → RT-3465.
- **Роли на первом плане 22.11.** Фильтр живых веток один разводил базы при слиянии нижней ветки
  во время набора и без сети; в план вошла база, закреплённая за деревом набора, и отказ с двумя
  базами.
