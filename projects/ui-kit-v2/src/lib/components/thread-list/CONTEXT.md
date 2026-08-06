# `rt-thread-list`

Список переписок/заявок с поиском, фильтрами и бесконечной прокруткой. Строку рисует шаблон
потребителя.

```html
<rt-thread-list
    [rows]="rows()"
    [activeId]="activeId()"
    [loading]="loading()"
    [hasMore]="hasMore()"
    (selectRow)="open($event)"
    (openInNewTab)="openInTab($event)"
    (searchChange)="search($event)"
    (loadMore)="next()">
    <ng-template rtThreadListRow let-row>…</ng-template>
    <ng-template rtThreadListFilters>…</ng-template>
</rt-thread-list>
```

Входы: `rows`, `activeId`, `searchPlaceholder`, `emptyText`, `loading`, `fetching`, `hasMore`,
`filtersActive`. Выходы: `selectRow`, `openInNewTab`, `searchChange`, `loadMore`.

Строка обязана иметь `id`, `hasUnread` и (необязательно) `overdue` — это всё, что список о ней знает.

## Главное, что нужно знать

**Ctrl/Cmd+клик просит открыть в новой вкладке, а не выбирает строку.** Список — это навигация,
и привычка «Ctrl+клик открывает рядом» должна работать.

**`loading` подменяет строки заглушками только при пустом списке.** Загрузка поверх уже
показанных строк их не трогает — иначе список мигал бы при каждой смене фильтра.

**Поиск отдаёт значение с задержкой** и без повторов (`searchDebounce` + `distinctUntilChanged`),
уже обрезанное по краям.

## Края

- Якорь догрузки (`rtInfiniteScroll`) появляется только при `hasMore`.
- Кнопка фильтров рисуется, только если объявлен шаблон `[rtThreadListFilters]`;
  `filtersActive` рисует на ней точку.
- Собственное поле поиска можно заменить шаблоном `[rtThreadListSearch]`.
