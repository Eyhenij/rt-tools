import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { RtChartComponent } from '../../rt-chart.component';
import { IChartStoryCase } from './chart.fixture';

const BEM_BLOCK: string = 'app-chart-card';

/**
 * Карточка витрины по макету: подпись сверху и график под ней.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chart-card',
    templateUrl: './test-chart-card.component.html',
    styleUrl: './test-chart-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtChartComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class TestRtChartCardComponent {
    public readonly item: InputSignal<IChartStoryCase> = input.required<IChartStoryCase>();
}
