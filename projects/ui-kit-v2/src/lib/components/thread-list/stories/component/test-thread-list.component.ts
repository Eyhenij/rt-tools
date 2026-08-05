import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtThreadListComponent } from '../../rt-thread-list.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-thread-list',
    template: `
        <rt-thread-list
            [rows]="rows"
            [activeId]="activeId"
            [searchPlaceholder]="searchPlaceholder"
            [emptyText]="emptyText"
            [loading]="loading"
            [fetching]="fetching"
            [hasMore]="hasMore"
            [filtersActive]="filtersActive" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtThreadListComponent,
    ],
})
export class TestRtThreadListComponent {
    public rows: readonly string[] = [];
    public activeId: number | null = null;
    public searchPlaceholder: string = '';
    public emptyText: string = 'Ничего не найдено';
    public loading: boolean = false;
    public fetching: boolean = false;
    public hasMore: boolean = false;
    public filtersActive: boolean = false;
}
