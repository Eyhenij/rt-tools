import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtLogoComponent } from '../../rt-logo.component';
import { IRtLogo } from '../../rt-logo.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-logo',
    template: `
        <rt-logo [variant]="variant" [height]="height" [aspect]="aspect" [ariaLabel]="ariaLabel" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtLogoComponent,
    ],
})
export class TestRtLogoComponent {
    public variant: IRtLogo.Variant = 'lockup';
    public height: number = 0;
    public aspect: number = 0;
    public ariaLabel: string = '';
}
