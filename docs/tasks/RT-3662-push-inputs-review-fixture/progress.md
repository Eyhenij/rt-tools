# Progress

## Where we stand

- **State:** `разбор-кончился`
- **Stage:** 1 of 1 — Таблица входов
- **Done:** таблица переснята, `verify` зелёный, вход `.diff` записан
- **Next step:** два круга ревью, набор перед отправкой, разбор папки, PR в ветку эпика
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Переснять таблицу входов командой record
- [x] 1.2 Проверить, что таблица знает расширение файла образца

## Decisions along the way

## Sessions

### 2026-11-25

- Набор перед отправкой ветки эпика RT-3603 на `8d50620c7` красный на `node tools/push-inputs.mjs verify`; проба
  переснятия: один файл, 17 строк добавлено, 15 убрано.
- Проверка вживую: после `record` команда `node tools/push-inputs.mjs verify` — код 0; `grep -c '"\.diff"'` — 1.
  Против `origin/main` на вершине эпика `nx affected -t lint typecheck test build` — 40 из 40 зелёные.
