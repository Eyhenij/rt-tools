import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDatePickerComponent } from '../../rt-date-picker.component';
import { IRtDatePicker } from '../../rt-date-picker.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-date-picker',
    template: `
        <rt-date-picker [type]="type" [min]="min" [max]="max" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDatePickerComponent,
    ],
})
export class TestRtDatePickerComponent {
    public type: IRtDatePicker.Type = 'date';
    public min: string | null = null;
    public max: string | null = null;
}
