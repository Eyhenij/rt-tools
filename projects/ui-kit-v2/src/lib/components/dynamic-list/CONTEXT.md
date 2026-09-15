# `rt-dynamic-list`

```html
<rt-dynamic-list
    [pageModel]="page()"
    [showRefresh]="true"
    [showClearFilters]="true"
    [filtered]="hasFilters()"
    (searchChange)="onSearch($event)"
    (refreshed)="reload()"
    (pageChange)="onPage($event)">
    <ng-container *rtDynamicListSelectors>
        <rt-select [options]="stages()" />
    </ng-container>

    <rt-table [rows]="rows()" />
</rt-dynamic-list>
```

| вход                 | тип                  | умолчание |
| -------------------- | -------------------- | --------- |
| `pageModel`          | `IPageModel \| null` | `null`    |
| `loading`            | `boolean`            | `false`   |
| `fetching`           | `boolean`            | `false`   |
| `empty`              | `boolean`            | `false`   |
| `filtered`           | `boolean`            | `false`   |
| `showSearch`         | `boolean`            | `true`    |
| `showRefresh`        | `boolean`            | `false`   |
| `showClearFilters`   | `boolean`            | `false`   |
| `showColumnSettings` | `boolean`            | `false`   |
| `selectable`         | `boolean`            | `false`   |
| `allSelected`        | `boolean`            | `false`   |
| `someSelected`       | `boolean`            | `false`   |
| `selectAllDisabled`  | `boolean`            | `false`   |
| `selectedCount`      | `number`             | `0`       |
| `emptyTitle`         | `string`             | `''`      |
| `emptyDescription`   | `string \| null`     | `null`    |

Выходы: `searchChange`, `refreshed`, `filtersCleared`, `columnSettingsOpened`, `pageChange`,
`perPageChange`, `allSelectedChange`. Стороны панели объявляются двумя директивами:
`rtDynamicListSelectors` и `rtDynamicListActions`.

## Главное, что нужно знать

**Записи проецируются, а не приходят входом.** Таблица между панелью и страницами — потребителя:
его колонки, его ячейки, его действия строки. Семья стоит вокруг и в неё не заглядывает.

**Незаказанное действие не рисуется вовсе, а выключенное держит место.** Экран без обновления не
показывает кнопку обновления; кнопка сброса отбора стоит и выключена, пока сбрасывать нечего, —
это разные утверждения, и оба сделаны намеренно.

**Пустых мест два.** Раздел без записей и отбор, ничего не нашедший, говорят человеку разное: из
второго ему дают дорогу назад — сброс того, что он поставил.

**Поиск не ходит наружу на каждое нажатие.** Значение сперва устаивается — готовым оператором
ожидания кита, тем же, что стоит в списке переписок.

**Ряд номеров рисуется только там, где страниц больше одной.** Под списком из трёх записей он шум.

**Полоса панели переносит непоместившееся сама.** Поиск уходит на свою строку, когда рядом с
действиями ему места нет: без этого список раздался бы шире хозяина и уехал за его край.

**Ниже порога кита поиск занимает всю строку.** Порог — 1080 точек, объявлен медиазапросом по
общему файлу порогов. Ни описанием, ни входом его не включить: он виден только на кадре.

## Как этим пользоваться

- Высоту списка задаёт потребитель: он берёт сто процентов своего хоста.
- Настройка колонок открывается потребителем: семья только говорит о нажатии.
- Подписи приходят из словаря кита — `provideRtKitLabels`.
- Расстояния и ширину поиска переопределяют свойствами блока — `--rt-dynamic-list-gap`,
  `--rt-dynamic-list-search-width`.

## Договорённость

`docs/specs/ui-kit-v2/dynamic-list/` — восемь правил и сценарии `SC-UKV-165`…`SC-UKV-174`.
