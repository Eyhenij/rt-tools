import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTableRowActionsDirective } from '../../rt-table-row-actions.directive';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-table-row-actions',
    template: `
        <ng-template rtTableRowActions [rtTableRowActionsRowType]="rtTableRowActionsRowType"></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTableRowActionsDirective,
    ],
})
export class TestRtTableRowActionsComponent {
    public rtTableRowActionsRowType: readonly string[] = [];
}
