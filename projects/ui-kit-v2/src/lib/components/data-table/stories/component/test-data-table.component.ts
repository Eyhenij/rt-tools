import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ITestDataTableRow, TEST_DATA_TABLE_COLUMNS, TEST_DATA_TABLE_ROWS } from './test-data-table.rows';
import { TestRtDataTableCellComponent } from './test-data-table-cell.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент.
 *
 * Внутри стоит та же ячейка, что и в матрицах: у неё своя служба настроек, без которой таблица не
 * получит ни одной колонки. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-data-table',
    template: `
        <app-data-table-cell
            storageKey="story-playground"
            [columns]="columns"
            [rows]="rows"
            [filtersShown]="filtersShown"
            [clickable]="clickable"
            [selectorsShown]="selectorsShown"
            [multiSelect]="multiSelect"
            [selectorsDisabled]="selectorsDisabled"
            [withRowActions]="withRowActions" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TestRtDataTableCellComponent],
})
export class TestRtDataTableComponent {
    public rows: ITestDataTableRow[] = TEST_DATA_TABLE_ROWS;
    public filtersShown: boolean = false;
    public clickable: boolean = false;
    public selectorsShown: boolean = true;
    public multiSelect: boolean = true;
    public selectorsDisabled: boolean = false;
    public withRowActions: boolean = true;

    public readonly columns: typeof TEST_DATA_TABLE_COLUMNS = TEST_DATA_TABLE_COLUMNS;
}
