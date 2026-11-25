# Progress

## Where we stand

- **State:** `договорённость-записана`
- **Stage:** 1 of 1 — Соседний файл правила
- **Done:** задача заведена, план записан
- **Next step:** коммит папки, одобрение плана владельцем, затем 1.1
- **Uncommitted:** папка задачи
- **PR:** not open yet

## Steps

- [>] 1.1 Переписать строки 17, 18, 27, 30 символами проверок вместо номеров задач
- [ ] 1.2 Снять ложные пометки «Not checked by anything» в строках 28, 29, 31

## Decisions along the way

## Sessions

### 2026-11-25

- Первая запись плана называла четыре строки и проверку `node tools/check-specs.mjs`. Роли `goal-critic` и
  `product-strategist` на плане нашли ещё три устаревшие строки (28, 29, 31), а `plan-red` отказал: `check-specs`
  зелёный и до работы. Коммиты плана не были отправлены, они отмотаны через `git reset --soft`, план записан заново
  с двумя признаками в шагах.
- До правки: `grep -c "RT-361[01]"` — 4; `grep -c "Not checked by anything"` — 9; `node tools/check-specs.mjs` — код 0.
