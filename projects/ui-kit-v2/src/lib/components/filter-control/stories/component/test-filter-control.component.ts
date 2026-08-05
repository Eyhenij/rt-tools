import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtFilterControlComponent } from '../../rt-filter-control.component';
import { IRtFilterControl } from '../../rt-filter-control.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-filter-control',
    template: `
        <rt-filter-control
            [options]="options"
            [value]="value"
            [ariaLabel]="ariaLabel"
            [placeholder]="placeholder"
            [size]="size"
            [disabled]="disabled"
            [fullWidth]="fullWidth" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFilterControlComponent,
    ],
})
export class TestRtFilterControlComponent {
    public options: ReadonlyArray<IRtFilterControl.Option<string>> = [];
    public value: string | undefined = undefined;
    public ariaLabel: string | null = null;
    public placeholder: string = 'Введите значение';
    public size: IRtFilterControl.Size = 'sm';
    public disabled: boolean = false;
    public fullWidth: boolean = false;
}
