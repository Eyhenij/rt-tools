import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

import { RtChartComponent } from '../../rt-chart.component';
import { IChartStoryCase } from './chart.fixture';

/**
 * Карточка витрины по макету: подпись сверху и график под ней.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chart-card',
    template: `
        <h4 class="app-chart-card__title">{{ item().name }}</h4>
        <rt-chart [data]="item().data" [label]="item().name" />
    `,
    styles: `
        :host {
            box-sizing: border-box;
            display: flex;
            width: 360px;
            height: 306px;
            flex-direction: column;
            gap: 12px;
            padding: var(--rt-space-4);
            border: var(--rt-border-width-thin) solid var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-md);
            background: var(--rt-color-bg-surface);
        }

        .app-chart-card__title {
            margin: 0;
            color: var(--rt-color-text-primary);
            font-size: var(--rt-text-sm);
            font-weight: var(--rt-font-weight-semibold);
            line-height: 1.35;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChartComponent,
    ],
})
export class TestRtChartCardComponent {
    public readonly item: InputSignal<IChartStoryCase> = input.required<IChartStoryCase>();
}
