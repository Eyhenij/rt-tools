import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtInputNumberComponent } from '../../rt-input-number.component';
import { IRtIcon } from '../../../icon/rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-input-number',
    template: `
        <rt-input-number
            [iconLeft]="iconLeft"
            [prefix]="prefix"
            [placeholder]="placeholder"
            [min]="min"
            [max]="max"
            [minFractionDigits]="minFractionDigits"
            [maxFractionDigits]="maxFractionDigits" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtInputNumberComponent,
    ],
})
export class TestRtInputNumberComponent {
    public iconLeft: IRtIcon.Name | null = null;
    public prefix: string | null = null;
    public placeholder: string = 'Введите значение';
    public min: number | null = null;
    public max: number | null = null;
    public minFractionDigits: number = 0;
    public maxFractionDigits: number = 2;
}
