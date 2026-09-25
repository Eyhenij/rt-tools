import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IPageModel } from '@rt-tools/utils';

import {
    ITestDataTableRow,
    TEST_DATA_TABLE_ROWS,
    TEST_DATA_TABLE_SHORT_COLUMNS,
} from '../../../data-table/stories/component/test-data-table.rows';
import { TestRtDataListCellComponent } from './test-data-list-cell.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент.
 *
 * Внутри стоит та же ячейка, что и в матрицах: у неё своя служба настроек, без которой список не
 * получит ни одной колонки. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-data-list',
    template: `
        <app-data-list-cell
            storageKey="story-list-playground"
            [columns]="columns"
            [rows]="rows"
            [page]="page"
            [filtersShown]="filtersShown"
            [iconsOutlined]="iconsOutlined"
            [loading]="loading"
            [fetching]="fetching"
            [selectAllShown]="selectAllShown"
            [multiSelect]="multiSelect" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TestRtDataListCellComponent],
})
export class TestRtDataListComponent {
    public rows: ITestDataTableRow[] = TEST_DATA_TABLE_ROWS;
    public page: IPageModel = { pageNumber: 1, pageSize: 10, totalCount: 27, hasPrev: false, hasNext: true };
    public filtersShown: boolean = false;
    public iconsOutlined: boolean = true;
    public loading: boolean = false;
    public fetching: boolean = false;
    public selectAllShown: boolean = true;
    public multiSelect: boolean = true;

    public readonly columns: typeof TEST_DATA_TABLE_SHORT_COLUMNS = TEST_DATA_TABLE_SHORT_COLUMNS;
}
