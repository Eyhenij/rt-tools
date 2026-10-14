import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtProgressBarComponent } from '../../rt-progress-bar.component';
import { IRtProgressBar } from '../../rt-progress-bar.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда. В пакет
 * обёртка не уезжает.
 */
@Component({
    selector: 'app-progress-bar',
    template: `
        <div style="width: 20rem">
            <rt-progress-bar ariaLabel="Обновление набора данных" [mode]="mode" [value]="value" [color]="color" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtProgressBarComponent,
    ],
})
export class TestRtProgressBarComponent {
    public mode: IRtProgressBar.Mode = 'determinate';
    public value: number = 40;
    public color: IRtProgressBar.Color = 'primary';
}
