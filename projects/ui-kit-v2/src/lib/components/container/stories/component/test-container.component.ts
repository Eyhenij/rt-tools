import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtContainerComponent } from '../../rt-container.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-container',
    template: `
        <rt-container [mobileLeftNav]="mobileLeftNav" [height]="height" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtContainerComponent,
    ],
})
export class TestRtContainerComponent {
    public mobileLeftNav: 'keep' | 'bottom' = 'keep';
    public height: 'auto' | 'viewport' = 'auto';
}
