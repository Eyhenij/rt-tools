import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtUsageRingComponent } from '../../rt-usage-ring.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-usage-ring',
    templateUrl: './test-usage-ring.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtUsageRingComponent,
    ],
})
export class TestRtUsageRingComponent {
    public value: number = 32;
    public warnAt: number = 80;
    public hint: string = '32% of the monthly limit · Resets on 1 November';
}
