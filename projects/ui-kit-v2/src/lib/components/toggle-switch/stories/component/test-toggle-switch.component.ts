import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtToggleSwitchComponent } from '../../rt-toggle-switch.component';
import { IRtToggleSwitch } from '../../rt-toggle-switch.model';
import { IRtIcon } from '../../../icon/rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-toggle-switch',
    template: `
        <rt-toggle-switch
            [inputId]="inputId"
            [ariaLabel]="ariaLabel"
            [size]="size"
            [iconOff]="iconOff"
            [iconOn]="iconOn"
            [disabled]="disabled" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToggleSwitchComponent,
    ],
})
export class TestRtToggleSwitchComponent {
    public inputId: string | null = null;
    public ariaLabel: string | null = null;
    public size: IRtToggleSwitch.Size = 'sm';
    public iconOff: IRtIcon.Name | null = null;
    public iconOn: IRtIcon.Name | null = null;
    public disabled: boolean = false;
}
