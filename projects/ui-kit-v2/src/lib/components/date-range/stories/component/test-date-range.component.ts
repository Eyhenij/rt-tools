import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDateRangeComponent } from '../../rt-date-range.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-date-range',
    templateUrl: './test-date-range.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDateRangeComponent,
    ],
})
export class TestRtDateRangeComponent {
    public min: string | null = null;
    public max: string | null = null;
}
