# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — Касание открывает подсказку хоста без действия
- **Done:** вход, кольцо, тесты, спек
- **Next step:** прогон набора, разбор папки, PR в `main`
- **Uncommitted:** вся правка задачи
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Вход `rtTooltipShowOnTap` в директиве подсказки
- [x] 1.2 Кольцо расхода ставит вход
- [x] 1.3 Тесты SC-UKV-1051…1055
- [x] 1.4 Спек поддомена, привязка и описание подсказки

## Decisions along the way

- **Сквозного теста витрины нет, касание на WebKit проверит VillaManager** — у кита нет набора
  Playwright для витрины. Affected stage of the plan: 1.
