import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTableCardDirective } from '../../rt-table-card.directive';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-table-card',
    template: `
        <ng-template rtTableCard [rtTableCardRowType]="rtTableCardRowType"></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTableCardDirective,
    ],
})
export class TestRtTableCardComponent {
    public rtTableCardRowType: readonly string[] = [];
}
