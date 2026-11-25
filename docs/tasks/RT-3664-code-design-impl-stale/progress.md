# Progress

## Where we stand

- **State:** `разбор-кончился`
- **Stage:** 1 of 1 — Соседний файл правила
- **Done:** семь строк переписаны; номеров RT-3610 и RT-3611 нет, пометок «Not checked by anything» три
- **Next step:** два круга ревью, набор перед отправкой, разбор папки, PR в ветку эпика
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Переписать строки 17, 18, 27, 30 символами проверок вместо номеров задач
- [x] 1.2 Снять ложные пометки «Not checked by anything» в строках 28, 29, 31

## Decisions along the way

## Sessions

### 2026-11-25

- Первая запись плана называла четыре строки и проверку `node tools/check-specs.mjs`. Роли `goal-critic` и
  `product-strategist` на плане нашли ещё три устаревшие строки (28, 29, 31), а `plan-red` отказал: `check-specs`
  зелёный и до работы. Коммиты плана не были отправлены, они отмотаны через `git reset --soft`, план записан заново
  с двумя признаками в шагах.
- До правки: `grep -c "RT-361[01]"` — 4; `grep -c "Not checked by anything"` — 9; `node tools/check-specs.mjs` — код 0.
- После правки: `grep -q "RT-361[01]"` — код 1; `grep -c "Not checked by anything"` — 3 (строки 19, 21, 25);
  `node tools/check-specs.mjs` — код 0, новые ссылки `decisionProblems` и `held` стоят в коде.
