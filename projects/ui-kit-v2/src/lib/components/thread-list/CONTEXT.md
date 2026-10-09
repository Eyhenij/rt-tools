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
    <ng-template let-row [rtThreadListRow]="rows()">…</ng-template>
    <ng-template rtThreadListFilters>…</ng-template>
</rt-thread-list>
```

Входы: `rows`, `activeId`, `searchPlaceholder`, `emptyText`, `loading`, `fetching`, `hasMore`,
`filtersActive`, `emptyPreviewIcons`. Выходы: `selectRow`, `openInNewTab`, `searchChange`, `loadMore`.

Строка обязана иметь `id`, `hasUnread` и (необязательно) `overdue` — это всё, что список о ней знает.
Номер строки — число или строка: у записей домена ключ не всегда числовой. Тем же типом приходит
`activeId` и уходят `selectRow` и `openInNewTab`.

Тот же массив строк передаётся входом `[rtThreadListRow]` в шаблон строки: из него выводится тип
`row`. Без этого входа строгая сборка приложения отказывает — атрибут без значения приходит строкой.

Действия строки — `<ng-template let-row [rtThreadListRowActions]="rows()">`: кнопки стоят поверх
правого края строки, рядом с её кнопкой, а не внутри: вложенная кнопка в `<button>` недопустима и
забирала бы клик выбора. Видны при наведении, фокусе и пока открыто `rt-menu` из них (`rt-menu--open`):
панель меню лежит вне строки, и фокус уходит в неё. Без шаблона строка стоит без обёртки.

## Главное, что нужно знать

**Ctrl/Cmd+клик просит открыть в новой вкладке, а не выбирает строку.** Список — это навигация,
и привычка «Ctrl+клик открывает рядом» должна работать.

**`loading` подменяет строки заглушками только при пустом списке.** Загрузка поверх уже
показанных строк их не трогает — иначе список мигал бы при каждой смене фильтра.

**Поиск отдаёт значение с задержкой** и без повторов (`searchDebounce` + `distinctUntilChanged`),
уже обрезанное по краям.

## Края

- Пустой список рисует строки-превью по одной на значок из `emptyPreviewIcons` (по умолчанию
  `user`, `users`, `user`); каждая вторая строка сдвинута модификатором `offset`.
- Якорь догрузки (`rtInfiniteScroll`) появляется только при `hasMore`.
- Кнопка фильтров рисуется, только если объявлен шаблон `[rtThreadListFilters]`;
  `filtersActive` рисует на ней точку.
- Собственное поле поиска можно заменить шаблоном `[rtThreadListSearch]`.
