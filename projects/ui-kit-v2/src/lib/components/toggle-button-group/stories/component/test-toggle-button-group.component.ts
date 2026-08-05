import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtToggleButtonGroupComponent } from '../../rt-toggle-button-group.component';
import { IRtToggleButtonGroup } from '../../rt-toggle-button-group.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-toggle-button-group',
    template: `
        <rt-toggle-button-group
            [options]="options"
            [value]="value"
            [ariaLabel]="ariaLabel"
            [size]="size"
            [disabled]="disabled"
            [fullWidth]="fullWidth" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToggleButtonGroupComponent,
    ],
})
export class TestRtToggleButtonGroupComponent {
    public options: ReadonlyArray<IRtToggleButtonGroup.Option<string>> = [];
    public value: string | undefined = undefined;
    public ariaLabel: string | null = null;
    public size: IRtToggleButtonGroup.Size = 'sm';
    public disabled: boolean = false;
    public fullWidth: boolean = false;
}
