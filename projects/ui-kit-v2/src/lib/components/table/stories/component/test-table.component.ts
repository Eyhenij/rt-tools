import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ISortModel } from '@rt-tools/utils';

import { RtTableComponent } from '../../rt-table.component';
import { IRtTable } from '../../rt-table.model';
import { IRtIcon } from '../../../icon/rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-table',
    template: `
        <rt-table
            [ariaLabel]="ariaLabel"
            [density]="density"
            [cards]="cards"
            [clickable]="clickable"
            [loading]="loading"
            [fetching]="fetching"
            [columns]="columns"
            [columnsConfig]="columnsConfig"
            [tableId]="tableId"
            [showRowActions]="showRowActions"
            [rowHasActions]="rowHasActions"
            [sort]="sort"
            [skeletonRows]="skeletonRows"
            [emptyMessage]="emptyMessage"
            [emptyIcon]="emptyIcon"
            [emptyDescription]="emptyDescription" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTableComponent,
    ],
})
export class TestRtTableComponent {
    public ariaLabel: string | null = null;
    public density: IRtTable.Density = 'default';
    public cards: boolean = true;
    public clickable: boolean = false;
    public loading: boolean = false;
    public fetching: boolean = false;
    public columns: ReadonlyArray<string> = [];
    public columnsConfig: ReadonlyArray<IRtTable.ColumnConfig> = [];
    public tableId: string | null = null;
    public showRowActions: boolean = false;
    public rowHasActions: IRtTable.RowActionsPredicate<string> | null = null;
    public sort: ISortModel<string> | null = null;
    public skeletonRows: number = 5;
    public emptyMessage: string = '';
    public emptyIcon: IRtIcon.Name | null = 'inbox';
    public emptyDescription: string | null = null;
}
