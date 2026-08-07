import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtTooltipDirective } from '../../rt-tooltip.directive';
import { IRtTooltip } from '../../rt-tooltip.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Директива висит на кнопке, а не на пустом `div`: подсказка появляется по наведению, и
 * наводиться должно быть на что.
 */
@Component({
    selector: 'app-tooltip',
    template: `
        <button
            rtButton
            type="button"
            label="Наведите курсор"
            aria-label="Наведите курсор"
            [rtTooltip]="text"
            [rtTooltipPlacement]="placement"></button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtTooltipDirective,
    ],
})
export class TestRtTooltipComponent {
    public text: string = 'Текст подсказки';
    public placement: IRtTooltip.Placement = 'top';
}
