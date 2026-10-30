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
    templateUrl: './test-progress-bar.component.html',
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
