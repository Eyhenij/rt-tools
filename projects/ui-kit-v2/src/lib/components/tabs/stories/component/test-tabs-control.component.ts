import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTabsControlDirective } from '../../rt-tabs-control.directive';
import { IRtTabs } from '../../rt-tabs.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-tabs-control',
    template: `
        <div rtTabsControl [side]="side"></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTabsControlDirective,
    ],
})
export class TestRtTabsControlComponent {
    public side: IRtTabs.ControlSide = 'right';
}
