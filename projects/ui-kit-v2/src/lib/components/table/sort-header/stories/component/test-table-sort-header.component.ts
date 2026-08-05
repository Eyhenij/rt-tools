import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTableSortHeaderComponent } from '../../rt-table-sort-header.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-table-sort-header',
    template: `
        <rt-table-sort-header [rtSortHeader]="rtSortHeader" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTableSortHeaderComponent,
    ],
})
export class TestRtTableSortHeaderComponent {
    public rtSortHeader: string = '';
}
