import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtSpinnerComponent } from '../../rt-spinner.component';
import { IRtSpinner } from '../../rt-spinner.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-spinner',
    template: `
        <rt-spinner [diameter]="diameter" [color]="color" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSpinnerComponent,
    ],
})
export class TestRtSpinnerComponent {
    public diameter: number = 32;
    public color: IRtSpinner.Color = 'primary';
}
