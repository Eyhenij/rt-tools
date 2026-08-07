# `rt-table`

Таблица поверх CDK Table: колонки объявляются директивами CDK, а кит добавляет состояния,
карточки для узкого экрана, меню строки и настройку колонок.

```html
<table rt-table tableId="tours" ariaLabel="Туры" [dataSource]="rows()" [columns]="columns" [loading]="loading()" [columnsConfig]="config">
    <ng-container cdkColumnDef="title">
        <th *cdkHeaderCellDef cdk-header-cell>Название</th>
        <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
    </ng-container>
    <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
    <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
</table>
```

| вход                                | тип                           | умолчание     |
| ----------------------------------- | ----------------------------- | ------------- |
| `columns`                           | `ReadonlyArray<string>`       | `[]`          |
| `columnsConfig`                     | `ReadonlyArray<ColumnConfig>` | `[]`          |
| `tableId`                           | `string \| null`              | `null`        |
| `density`                           | `'default' \| 'compact'`      | `'default'`   |
| `cards`                             | `boolean`                     | `true`        |
| `clickable`                         | `boolean`                     | `false`       |
| `loading` / `fetching`              | `boolean`                     | `false`       |
| `skeletonRows`                      | `number`                      | 5             |
| `emptyMessage` / `emptyDescription` | `string` / `string \| null`   | `''` / `null` |
| `emptyIcon`                         | `IRtIcon.Name \| null`        | `'inbox'`     |
| `showRowActions`                    | `boolean`                     | `false`       |
| `sort`                              | `ISortModel<string> \| null`  | `null`        |

Выход: `sortChange`.

## Главное, что нужно знать

**`loading` и `fetching` — разные состояния.** Первая загрузка (`loading` при пустых данных)
подменяет строки заглушками; догрузка (`fetching`) оставляет уже показанное на месте — иначе
таблица мигала бы при каждой смене страницы.

**Карточки — это другая разметка, а не перестроенная стилями таблица.** Компонент сам решает по
ширине вьюпорта (`BreakpointsService.narrow`), что показать. Подписью в карточке служит **ключ
колонки**: заголовки живут в шаблонах ячеек CDK, куда карточка не дотягивается. Осмысленные
подписи даёт `columnsConfig`.

**Настройка колонок требует и `columnsConfig`, и `tableId`.** Выбор хранится в IndexedDB, и без
идентификатора таблицы его некуда положить — поэтому `canConfigure()` останется `false`.

## Края

- Пустой набор рисует заглушку с переведённым `uiNoData`; свой текст перебивает её.
- Колонка `rtRowActions` добавляется китом сама, когда включён `showRowActions`, и рисует
  [`rt-menu`](../menu/CONTEXT.md) в строке.
- Спеки логики лежат рядом: сортировка и предикат действий строки проверены отдельно.
