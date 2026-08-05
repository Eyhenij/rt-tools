import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtInputComponent } from '../../rt-input.component';
import { IRtInput } from '../../rt-input.model';
import { IRtIcon } from '../../../icon/rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-input',
    template: `
        <rt-input
            [type]="type"
            [placeholder]="placeholder"
            [iconLeft]="iconLeft"
            [iconRight]="iconRight"
            [passwordToggle]="passwordToggle"
            [autocomplete]="autocomplete" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtInputComponent,
    ],
})
export class TestRtInputComponent {
    public type: IRtInput.Type = 'text';
    public placeholder: string = 'Введите значение';
    public iconLeft: IRtIcon.Name | null = null;
    public iconRight: IRtIcon.Name | null = null;
    public passwordToggle: boolean = false;
    public autocomplete: string | null = null;
}
