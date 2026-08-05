import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtCounterComponent } from '../../rt-counter.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-counter',
    template: `
        <rt-counter
            [ariaLabel]="ariaLabel"
            [min]="min"
            [max]="max"
            [step]="step"
            [decreaseLabel]="decreaseLabel"
            [increaseLabel]="increaseLabel"
            [disabled]="disabled" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCounterComponent,
    ],
})
export class TestRtCounterComponent {
    public ariaLabel: string | null = null;
    public min: number = 0;
    public max: number = Number.MAX_SAFE_INTEGER;
    public step: number = 1;
    public decreaseLabel: string = '';
    public increaseLabel: string = '';
    public disabled: boolean = false;
}
