# Grill

## The owner request

> заводи баг и правь пакет

Предшествующий разбор: подменю боковой панели уезжает вверх на 96px, если водить курсором по пунктам первого уровня один за другим. Шапка панели с полем поиска уходит за верхний край и обратно не возвращается.

## What the tree already has

- `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.scss:269` — `.rtui-sub-side-menu .rtui-sub-side-menu-content { position: relative }`.
- `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.html:204` — `[rtScrollToElement]` на списке подменю.
- `RtScrollToElementDirective` в `@rt-tools/core` — `scrollIntoView({ behavior: 'smooth', block: 'start' })` из `effect()`.
- Спека боковой панели: `docs/specs/ui-kit/` — проверить, описано ли там расположение шторки.

## What the rules already say

- `styling-bem` — правила оформления; перебивать чужие раскладочные свойства без нужды нельзя.
- Material задаёт `.mat-drawer { position: absolute; top: 0; bottom: 0 }` для всех режимов, включая `mode="side"`; место под боковую шторку освобождается отступом на `.mat-drawer-content`.

## Questions and answers

Вопросов владельцу не было: причина измерена, починка проверена подстановкой в живой странице до постановки задачи.

## Decisions

- **Снять `position: relative`, а не гасить прокрутку контейнера** — правило перебивает раскладочный контракт Material, и переполнение контейнера есть следствие. Отвергнуто: `overflow: clip` на контейнере — прячет симптом, оставляя шторку в потоке.
- **`RtScrollToElementDirective` не трогать** — прокрутка активного пункта в видимую часть списка нужна; она перестаёт задевать контейнер, как только контейнер перестаёт быть прокручиваемым.
