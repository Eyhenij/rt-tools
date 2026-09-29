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

import { EFilterOperatorType, IFilterModel } from '@rt-tools/utils';

import { RtTableComponent } from '../../../rt-table.component';
import { IRtTable } from '../../../rt-table.model';
import { RtTableFilterHeaderComponent } from '../../rt-table-filter-header.component';

/** Строка показа: то, что видно в ячейках и что сужает отбор. */
interface IRow {
    readonly title: string;
    readonly city: string;
    readonly sum: number;
}

const ROWS: readonly IRow[] = [
    { title: 'Договор №2024-118', city: 'Москва', sum: 148000 },
    { title: 'Договор №2024-119', city: 'Сочи', sum: 92400 },
    { title: 'Договор №2024-120', city: 'Новосибирск', sum: 61000 },
];

/** Набор для списка собирается из самих строк: два перечня городов разошлись бы молча. */
const CITIES: readonly IRtTable.FilterOption[] = ROWS.map((row: IRow): IRtTable.FilterOption => ({ value: row.city, label: row.city }));

/** Отбор, заданный по колонке города: по нему видно, что показанных строк стало меньше. */
const START: readonly IFilterModel<string>[] = [{ propertyName: 'city', operatorType: EFilterOperatorType.EQUALS, value: ROWS[1].city }];

/**
 * Показ отбора там, где он живёт: в шапке настоящей таблицы кита.
 *
 * Сужает строки обёртка, а не ячейка: ячейка сообщает набор условий наружу, а список принадлежит
 * тому, кто его держит, — здесь это потребитель, как и у настоящего потребителя кита. В пакет
 * обёртка не уезжает.
 */
@Component({
    selector: 'app-table-filter-in-table',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        <div class="app-table-filter-in-table" data-story-root>
            <table rt-table #table="rtTable" ariaLabel="Договоры" [dataSource]="visibleRows" [columnsConfig]="columnsConfig">
                <ng-container cdkColumnDef="title">
                    <th *cdkHeaderCellDef cdk-header-cell>
                        <span class="app-table-filter-in-table__label">Договор</span>
                        <rt-table-filter-header
                            propertyName="title"
                            [filter]="titleFilter"
                            [filters]="filters"
                            (filtersChange)="onFilters($event)" />
                    </th>
                    <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                </ng-container>

                <ng-container cdkColumnDef="city">
                    <th *cdkHeaderCellDef cdk-header-cell>
                        <span class="app-table-filter-in-table__label">Город</span>
                        <rt-table-filter-header
                            propertyName="city"
                            [filter]="cityFilter"
                            [filters]="filters"
                            (filtersChange)="onFilters($event)" />
                    </th>
                    <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
                </ng-container>

                <ng-container cdkColumnDef="sum">
                    <th *cdkHeaderCellDef cdk-header-cell>
                        <span class="app-table-filter-in-table__label">Сумма</span>
                        <rt-table-filter-header
                            propertyName="sum"
                            [filter]="sumFilter"
                            [filters]="filters"
                            (filtersChange)="onFilters($event)" />
                    </th>
                    <td *cdkCellDef="let row" cdk-cell>{{ row.sum }}</td>
                </ng-container>

                <tr *cdkHeaderRowDef="table.displayedColumns()" cdk-header-row></tr>
                <tr *cdkRowDef="let row; columns: table.displayedColumns()" cdk-row></tr>
            </table>
        </div>
    `,
    // native-ok: обёртка истории витрины — правила показа живут рядом с ним, а не отдельным файлом
    styles: `
        .app-table-filter-in-table {
            display: grid;
            padding: var(--rt-space-4);
            gap: var(--rt-space-2);
        }

        .app-table-filter-in-table__label {
            display: block;
            margin-block-end: var(--rt-space-1);
        }
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
        RtTableFilterHeaderComponent,
    ],
})
export class TestRtTableFilterInTableComponent {
    public readonly titleFilter: IRtTable.ColumnFilter = { kind: 'text', startOperator: EFilterOperatorType.CONTAINS };
    public readonly cityFilter: IRtTable.ColumnFilter = { kind: 'select', options: CITIES };
    public readonly sumFilter: IRtTable.ColumnFilter = { kind: 'number' };

    public readonly columnsConfig: ReadonlyArray<IRtTable.ColumnConfig> = [
        { key: 'title', label: 'Договор', filter: this.titleFilter },
        { key: 'city', label: 'Город', filter: this.cityFilter },
        { key: 'sum', label: 'Сумма', filter: this.sumFilter },
    ];

    public filters: readonly IFilterModel<string>[] = START;
    public visibleRows: readonly IRow[] = ROWS.filter((row: IRow): boolean => this.#matches(row, START));

    public onFilters(next: readonly IFilterModel<string>[]): void {
        this.filters = next;
        this.visibleRows = ROWS.filter((row: IRow): boolean => this.#matches(row, next));
    }

    /** Подходит ли строка под весь набор условий: сужение — дело потребителя, не ячейки. */
    #matches(row: IRow, filters: readonly IFilterModel<string>[]): boolean {
        return filters.every((filter: IFilterModel<string>): boolean => {
            const value: string = String(row[filter.propertyName as keyof IRow]).toLowerCase();
            const wanted: string = String(filter.value).toLowerCase();

            return filter.operatorType === EFilterOperatorType.CONTAINS ? value.includes(wanted) : value === wanted;
        });
    }
}
