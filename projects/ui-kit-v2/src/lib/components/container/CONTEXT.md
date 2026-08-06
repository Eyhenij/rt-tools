# `rt-container`

Каркас страницы: шапка, боковое меню, полосы панели инструментов, содержимое и правая
выезжающая панель. Зоны объявляются директивами на `ng-template`.

```html
<rt-container height="viewport" mobileLeftNav="bottom">
    <ng-template rtContainerHeader><rt-header /></ng-template>
    <ng-template rtContainerLeftSidenav><rt-section-nav … /></ng-template>
    <ng-template rtContainerToolbarLeft><rt-filter-control … /></ng-template>
    <ng-template rtContainerContent><router-outlet /></ng-template>
    <ng-template rtContainerRightSidenav><app-details /></ng-template>
</rt-container>
```

| вход            | тип                    | умолчание |
| --------------- | ---------------------- | --------- |
| `mobileLeftNav` | `'keep' \| 'bottom'`   | `'keep'`  |
| `height`        | `'auto' \| 'viewport'` | `'auto'`  |

Выходы: `backdropClick`, `rightOpened`, `rightClosed`. Публичное API: `openRight()`,
`closeRight()`, `rightOpen()`, `rightOverlayReady()`.

## Главное, что нужно знать

**Необъявленная зона не создаёт пустого узла** — каркас состоит ровно из того, что передали.
Зоны рисуются смысловыми тегами: `<header>`, `<aside>`, `<main>`.

**Правая панель существует, только когда её зона объявлена.** Оверлей под неё создаётся заранее
(`rightOverlayReady()`), а `openRight()` без объявленной зоны — no-op.

**`rightOpened` / `rightClosed` привязаны к `transitionend` панели.** Там, где анимаций нет
(тест, `prefers-reduced-motion`), события не придут, а `rightOpen()` уже верен — смотреть надо
на него.

**Стопка уведомлений встроена в каркас** (`rt-toaster` внизу по центру): заводить её отдельно
не нужно.

## Рядом

- [`rt-toaster`](../toast/CONTEXT.md) — та самая стопка.
- [`rt-workspace`](../workspace/CONTEXT.md) — трёхколоночная раскладка внутри содержимого.
