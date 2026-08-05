import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtThemeToggleComponent } from '../../rt-theme-toggle.component';
import { IRtThemeToggle } from '../../rt-theme-toggle.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-theme-toggle',
    template: `
        <rt-theme-toggle [appearance]="appearance" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtThemeToggleComponent,
    ],
})
export class TestRtThemeToggleComponent {
    public appearance: IRtThemeToggle.Appearance = 'icon';
}
