# Progress

## Where we stand

- **State:** in progress
- **Stage:** 2 of 2 — Поставка и выпуск
- **Done:** код, тесты, спека; таймер вынесен в `SubMenuCloseDelay`, выбор закреплённого подменю — в `pickPinnedSubMenu`
- **Next step:** коммит, PR в main
- **Uncommitted:** правка меню, стенд, новый набор тестов, спека, папка задачи
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Вход `subMenuCloseDelay` и отложенное закрытие в `rtui-side-menu`
- [x] 1.2 Сценарии SC-UK-144…147 и тесты на поддельных таймерах
- [x] 1.3 Правило в спеке бокового меню и карта реализации
- [>] 2.1 PR в main и слияние
- [ ] 2.2 Выпуск `@rt-tools/ui-kit` прогоном публикации

## Decisions along the way

- **Таймер и реакции на указатель — в `sub-menu-close-delay.ts`, выбор закреплённого подменю — в `sub-menu-pinned-pick.ts`** — файл меню перешёл предел в 500 строк. Affected stage of the plan: 1.
- **Стенд тестов держит задержку 0** — прежние сценарии читают итог ухода указателя без ожидания. Affected stage of the plan: 1.

## Sessions

### 07.10.2026

- Задача заведена, ветка в отдельном рабочем дереве.
