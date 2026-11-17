import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    InputSignal,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import type { EChartsCoreOption } from 'echarts/core';

import { WINDOW } from '@rt-tools/core';

import { RtChartComponent } from '../../rt-chart.component';
import { RT_CHART_SERIES_COUNT } from '../../rt-chart.theme';
import { IChartStoryCase } from './chart.fixture';

/**
 * Карточка витрины по макету: подпись сверху и график под ней.
 *
 * Опции, которой цвет нужен по имени листа, карточка отдаёт палитру, прочитанную со своего узла:
 * в тёмной половине пары узел отвечает тёмной палитрой. Остальные опции идут как есть — цвета
 * серий им даёт сам график.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chart-card',
    template: `
        <h4 class="app-chart-card__title">{{ item().name }}</h4>
        @if (option(); as ready) {
            <rt-chart height="217px" [option]="ready" />
        }
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
            line-height: 1.4;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChartComponent,
    ],
})
export class TestRtChartCardComponent {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    readonly #window: Window = inject(WINDOW);
    readonly #palette: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

    protected readonly option: Signal<EChartsCoreOption | null> = computed((): EChartsCoreOption | null => {
        const item: IChartStoryCase = this.item();
        const palette: readonly string[] = this.#palette();

        if (item.build) {
            return palette.length ? item.build(palette) : null;
        }

        return item.option ?? null;
    });

    public readonly item: InputSignal<IChartStoryCase> = input.required<IChartStoryCase>();

    constructor() {
        afterNextRender((): void => {
            const style: CSSStyleDeclaration = this.#window.getComputedStyle(this.#host.nativeElement);

            this.#palette.set(
                Array.from({ length: RT_CHART_SERIES_COUNT }, (_: unknown, index: number): string =>
                    style.getPropertyValue(`--rt-color-chart-series-${index + 1}`).trim()
                )
            );
        });
    }
}
