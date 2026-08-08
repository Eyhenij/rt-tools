---
name: admin-lists-screen
kind: pattern
rule: lists
description: Паттерн правила lists. Брать при сборке или правке списочного экрана админки — готовый порядок блоков, разметка <префикс>-table, клик по строке, меню строки с vmTableRowActionsRowType, сортируемый заголовок, слоты тулбара, тост отказа.
---

# Собрать списочный экран

Паттерн правила `lists`. Что при этом должно быть верно — закон
`docs/constitution/lists.md`.

## Когда брать

- Заводится новый экран со списком записей.
- Правится существующий: столбцы, меню строки, тулбар, сортировка.

## Порядок блоков

Раскладку даёт общий блок `<префикс>-page` из слоя приложения, а не стили экрана. Экран отвечает за
порядок:

```html
<ng-container rtBlock="<префикс>-page">
    <header rtElem="header">
        <!-- div rtElem="header-main" c h1 rtElem="title" + p rtElem="hint" -->
        <<префикс>-toolbar>
        <!-- vmToolbarLeft / vmToolbarRight -->
        <div rtElem="scroll">
            <!-- overflow-x: auto -->
            <<префикс>-table rtElem="table">
            <!-- min-width: max-content -->
            <<префикс>-pagination>
        </div>
    </header>
</ng-container>
```

Оба правила прокрутки нужны вместе: с одним контейнером столбцы сжимаются вместо сдвига.
Тулбар и пагинация своих классов не носят — промежуток задаёт сам `<префикс>-page`.

## Таблица

```html
<<префикс>-table #rowsTable="vmTable" rtElem="table" clickable [ariaLabel]="'bookingsTableAria' | transloco" [emptyMessage]="'bookingsEmpty'
| transloco" [tableId]="tableId" [dataSource]="rows()" [columnsConfig]="columnsConfig()" [rowHasActions]="hasRowActions"
[loading]="loading()">
```

- `tableId` — ключ, под которым хранится выбор столбцов; он же уходит в асайд настроек.
- `[columnsConfig]`, а не голый список ключей: из него берутся подписи и для панели настроек, и
  для карточек на узком экране.

## Клик по строке

```html
<tr
    *cdkRowDef="let row; columns: rowsTable.displayedColumns()"
    cdk-row
    qa-dataid="bookings-row"
    vmTableRow
    (activated)="openAside(row)"></tr>
```

Строки объявляются на `rowsTable.displayedColumns()`: столбец с меню таблица добавляет сама.

## Меню строки

```html
<ng-template vmTableRowActions let-row [vmTableRowActionsRowType]="rows()"></ng-template>
```

```typescript
protected readonly hasRowActions = (row: IBooking.State): boolean => row.canConfirm || row.canReject;
```

Доступность действия лежит полем строки (`canConfirm`, `canReject`), а не вызовом метода
компонента. Действие, которого записи нельзя сделать, из меню убирается целиком. Необратимое
несёт `danger`, `confirmTitle` и `confirmMessage` с последствием — не «Вы уверены?», а что
именно произойдёт.

## Сортируемый заголовок

```html
<th *cdkHeaderCellDef cdk-header-cell vmSortHeader="checkIn">{{ 'bookingsCheckIn' | transloco }}</th>
```

Колонка помечается `sortable: true` в `columnsConfig`. Заголовок переключает сортировку по
кругу и отдаёт выбранное событием `(sortChange)`; саму выборку делает экран. Подпись остаётся
внутри кнопки — из неё берётся доступное имя.

Список приходит уже отсортированным, поэтому экран передаёт таблице текущую сортировку —
`[sort]="sortModel()"`, — и стрелка стоит на нужной колонке сразу, до первого нажатия. Без
этого список выглядит неотсортированным, хотя он отсортирован.

## Тулбар

Тулбар поделён на две части слотами: `vmToolbarLeft` — то, что меняет выборку,
`vmToolbarRight` — действия над списком. Своей раскладки внутри тулбара экран не заводит.

Левый слот — фильтры и поиск. Правый — иконки `<префикс>-icon-button variant="primary"` с парой
`tooltip` + `ariaLabel` одного текста: обновление (`sync`), настройки столбцов (`sliders-v`),
создание (`plus`). Если список не прочитался, повторяют той же кнопкой обновления.

## Отказ загрузки

```typescript
this.#notifications.error(this.#transloco.translate(this.#store.errorKey() ?? 'bookingsLoadFailed'));
```

Ключ читается сразу после запроса, а не подпиской на сигнал стора: стор делят список и панель
правки, и подписка показала бы один отказ дважды. Строк `<p role="alert">` над таблицей не
заводить.

## Проверить

```bash
npx nx build admin
```

Продовая сборка обязательна: без `[vmTableRowActionsRowType]` тип `let-row` выводится как
`unknown`, и падает только она — юниты и дев-сервер проходят.

## Частые промахи

- Свой `@if (rows().length === 0)` — экран собран мимо таблицы.
- Свой список столбцов вместо `displayedColumns()` — пропадает столбец с меню.
- Доступность действия считается методом компонента — пересчёт на каждой проверке.
- `[rowHasActions]` не задан — кнопка «…» висит у строки без действий.
- Заголовок вложен в тулбар вместо своего `<header>`.
- `qa-dataid` не проставлен на таблицу, строку, ячейки и элементы тулбара.
