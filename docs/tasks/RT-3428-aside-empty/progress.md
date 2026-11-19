# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Витрина и тексты
- **Done:** уточнение, описание фичи, задача, ветка, план
- **Next step:** история пустой панели в витрине; вопрос владельцу про панель с вкладками
- **Uncommitted:** нет
- **Waiting for the owner:** одобрение кадра пустой вкладки 8362:1987
- **PR:** not open yet

## Steps

- [x] 1.1 Нарисовать кадр пустой панели в Figma
- [x] 1.2 Получить одобрение макета владельцем
- [x] 2.1 Директива слота rtAsideEmpty
- [x] 2.2 Входы и заглушка в rt-aside
- [x] 2.3 Тест rt-aside-empty.spec.ts
- [>] 3.1 История пустой панели в витрине
- [ ] 3.2 CONTEXT.md и Overview.mdx панели
- [ ] 3.3 Одобрение витрины владельцем

## Decisions along the way

- **Панель с вкладками получает заглушку от вкладки: входы `empty`, `emptyIcon`, `emptyTitle`, `emptyDescription` у `rtTab`** — владелец выбрал «Вход empty у вкладки» из трёх: вход у вкладки, готовая заглушка в теле вкладки, вкладки не трогать. Affected stage of the plan: 1, 2.
- **Ключ подписи переименован в `uiEmptyTitle`** — им пользуются и панель, и вкладка; `asideNoData` врал бы во вкладках. Affected stage of the plan: 2.

- **Подпись по умолчанию — новый ключ `uiEmptyTitle`** — владелец на вопрос по макету: «текст по дефолту "Нет данных"». Ключ `uiNoData` читается «Пока нет данных» у `rt-bar-list`. Кадр поправлен. Affected stage of the plan: 1, 2.

## Sessions

### 2026-11-19

- Задача RT-3428 заведена вне эпика, ветка от `origin/main`, копия названа `rt-aside-empty`.
- Макет: вариант `Size=md, State=empty` в наборе Aside, https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL/?node-id=8331-1805. Измерено: шапка 540×120, тело 540×511, заглушка 492×160 по центру тела (y 296), круг иконки 64, значок 28, подпись 24 высотой, подвал 540×89 на месте.
- Код: `rt-aside-empty.directive.ts`, входы и заглушка в `rt-aside`, ключ `uiEmptyTitle`. Тесты панели: 15 наборов, 96 тестов зелёные (jest напрямую: `nx test` падает на плагине webpack в этой копии); `tsc -p tsconfig.spec.json` и eslint чистые.
- Вкладка: входы пустоты у `rtTab`, заглушка в теле `rt-tabs`, тест `rt-tabs-empty.spec.ts` (SC-UKV-1387, 1388). Панель, вкладки и подписи: 32 набора, 254 теста зелёные.
- Кадр пустой вкладки: вариант `Size=md, State=empty tab`, https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL/?node-id=8362-1987. Полоса вкладок y 120, тело вкладки 492×462 с y 169, заглушка 492×160 по центру (y 320). Набор Aside вырос до 3040, рамка «Тёмная тема» сдвинута на 768 вниз.
