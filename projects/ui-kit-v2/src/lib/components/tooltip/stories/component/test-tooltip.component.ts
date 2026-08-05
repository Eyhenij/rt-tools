import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTooltipDirective } from '../../rt-tooltip.directive';
import { IRtTooltip } from '../../rt-tooltip.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-tooltip',
    template: `
        <div rtTooltip [text]="text" [placement]="placement"></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTooltipDirective,
    ],
})
export class TestRtTooltipComponent {
    public text: string = 'Текст';
    public placement: IRtTooltip.Placement = 'top';
}
