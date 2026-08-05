import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtStepperComponent } from '../../rt-stepper.component';
import { IRtStepper } from '../../rt-stepper.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-stepper',
    template: `
        <rt-stepper [steps]="steps" [currentIndex]="currentIndex" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtStepperComponent,
    ],
})
export class TestRtStepperComponent {
    public steps: readonly IRtStepper.Step[] = [];
    public currentIndex: number = 0;
}
