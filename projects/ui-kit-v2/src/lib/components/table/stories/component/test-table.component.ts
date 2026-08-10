import {
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkHeaderCell,
    CdkHeaderCellDef,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
} from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ISortModel } from '@rt-tools/utils';

import { RtMenuItemComponent } from '../../../menu/rt-menu-item.component';
import { RtTableComponent } from '../../rt-table.component';
import { RtTableRowActionsDirective } from '../../rt-table-row-actions.directive';
import { IRtTable } from '../../rt-table.model';
import { IRtIcon } from '../../../icon/rt-icon.model';

/** Строка витрины: то, что показывают ячейки. */
export interface ITestTableRow {
    readonly id: number;
    readonly title: string;
    readonly city: string;
    readonly sum: string;
}

const ROWS: readonly ITestTableRow[] = [
    { id: 1, title: 'Договор №2024-118', city: 'Москва', sum: '148 000 ₽' },
    { id: 2, title: 'Договор №2024-119', city: 'Санкт-Петербург', sum: '92 400 ₽' },
    { id: 3, title: 'Договор №2024-120', city: 'Новосибирск', sum: '61 000 ₽' },
];

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Колонки таблица берёт не входом, а директивами CDK из разметки: обёртка объявляет их сама и
 * потому показывает настоящие строки. Прежняя отдавала пустые `columns` и роняла таблицу
 * ошибкой «нет определений строк» — контролы были, а показывать им было нечего.
 */
@Component({
    selector: 'app-table',
    template: `
        <table
            rt-table
            #table="rtTable"
            [ariaLabel]="ariaLabel"
            [density]="density"
            [cards]="cards"
            [clickable]="clickable"
            [loading]="loading"
            [fetching]="fetching"
            [dataSource]="rows"
            [columnsConfig]="columnsConfig"
            [tableId]="tableId"
            [showRowActions]="showRowActions"
            [rowHasActions]="rowHasActions"
            [sort]="sort"
            [skeletonRows]="skeletonRows"
            [emptyMessage]="emptyMessage"
            [emptyIcon]="emptyIcon"
            [emptyDescription]="emptyDescription">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            <ng-container cdkColumnDef="city">
                <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
            </ng-container>
            <ng-container cdkColumnDef="sum">
                <th *cdkHeaderCellDef cdk-header-cell>Сумма</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.sum }}</td>
            </ng-container>

            <ng-template rtTableRowActions let-row [rtTableRowActionsRowType]="rows">
                <rt-menu-item icon="ico-eye" [label]="'Открыть ' + row.title" />
                <rt-menu-item icon="ico-trash" label="Удалить" [danger]="true" />
            </ng-template>

            <tr *cdkHeaderRowDef="table.displayedColumns()" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: table.displayedColumns()" cdk-row></tr>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkColumnDef,
        CdkHeaderCellDef,
        CdkHeaderCell,
        CdkCellDef,
        CdkCell,
        CdkHeaderRowDef,
        CdkHeaderRow,
        CdkRowDef,
        CdkRow,

        // components
        RtTableComponent,
        RtTableRowActionsDirective,
        RtMenuItemComponent,
    ],
})
export class TestRtTableComponent {
    public readonly rows: readonly ITestTableRow[] = ROWS;

    public ariaLabel: string | null = null;
    public density: IRtTable.Density = 'default';
    public cards: boolean = true;
    public clickable: boolean = false;
    public loading: boolean = false;
    public fetching: boolean = false;
    public columnsConfig: ReadonlyArray<IRtTable.ColumnConfig> = [
        { key: 'title', label: 'Договор', locked: true, sortable: true },
        { key: 'city', label: 'Город', sortable: true },
        { key: 'sum', label: 'Сумма' },
    ];
    public tableId: string | null = null;
    public showRowActions: boolean = false;
    public rowHasActions: IRtTable.RowActionsPredicate<ITestTableRow> | null = null;
    public sort: ISortModel<string> | null = null;
    public skeletonRows: number = 5;
    public emptyMessage: string = '';
    public emptyIcon: IRtIcon.Name | null = 'inbox';
    public emptyDescription: string | null = null;
}
