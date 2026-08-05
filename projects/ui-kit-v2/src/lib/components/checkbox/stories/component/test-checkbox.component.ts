import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtCheckboxComponent } from '../../rt-checkbox.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-checkbox',
    template: `
        <rt-checkbox [inputId]="inputId" [ariaLabel]="ariaLabel" [disabled]="disabled" [indeterminate]="indeterminate" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCheckboxComponent,
    ],
})
export class TestRtCheckboxComponent {
    public inputId: string | null = null;
    public ariaLabel: string | null = null;
    public disabled: boolean = false;
    public indeterminate: boolean = false;
}
