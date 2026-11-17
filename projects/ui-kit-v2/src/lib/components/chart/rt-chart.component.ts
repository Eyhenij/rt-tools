import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    afterRenderEffect,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import type { ECharts, EChartsCoreOption, EChartsInitOpts } from 'echarts/core';
import { NgxEchartsDirective, provideEchartsCore, ThemeOption } from 'ngx-echarts';

import { BlockDirective, ElemDirective, WINDOW } from '@rt-tools/core';

import { rtKitLabel, ThemeService } from '@rt-tools/ui-kit-v2/core';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import { rtChartIsEmpty } from './rt-chart.empty';
import { rtChartSvgToPng } from './rt-chart.png';
import { RT_CHART_ECHARTS } from './rt-chart.registry';
import { IRtChartColors, rtChartColorsKey, rtChartReadColors, rtChartTheme } from './rt-chart.theme';

const BEM_BLOCK: string = 'rt-chart';

/** Рендерер SVG: серии и оси становятся узлами страницы. */
const INIT_OPTS: EChartsInitOpts = { renderer: 'svg' };

/**
 * Опция, с которой график создаётся. Пустая: всё, что пришло во вход, ложится вторым вызовом
 * слиянием — так новая опция сливается с нарисованным графиком, а не пересоздаёт его.
 */
const BASE_OPTION: EChartsCoreOption = {};

/**
 * График кита: рисует опцию `echarts` в палитре и теме кита.
 *
 * Палитра читается с узла самого графика, поэтому тёмное поддерево светлой страницы даёт тёмный
 * график. Смена темы пересоздаёт график в новых цветах. Пустая опция показывает заглушку кита
 * вместо осей. В контейнере нулевой ширины график не создаётся, пока контейнер не получит ширину.
 */
@Component({
    selector: 'rt-chart',
    templateUrl: './rt-chart.component.html',
    styleUrl: './rt-chart.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        NgxEchartsDirective,
        RtEmptyStateComponent,
        BlockDirective,
        ElemDirective,
    ],
    providers: [provideEchartsCore({ echarts: RT_CHART_ECHARTS })],
    host: {
        class: BEM_BLOCK,
        '[style.--rt-chart-height]': 'height()',
    },
})
export class RtChartComponent {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    readonly #document: Document = inject(DOCUMENT);
    readonly #theme: ThemeService = inject(ThemeService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    /** Конструкторы наблюдателей объявлены на глобальном объекте, а не на интерфейсе окна. */
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    /** Ширина узла графика; ноль — контейнер ещё не разложен. */
    readonly #width: WritableSignal<number> = signal<number>(0);

    /** Цвета, прочитанные с узла; `null` до первого прочтения в браузере. */
    readonly #colors: WritableSignal<IRtChartColors | null> = signal<IRtChartColors | null>(null);

    #chart: ECharts | null = null;

    protected readonly baseOption: EChartsCoreOption = BASE_OPTION;

    protected readonly initOpts: EChartsInitOpts = INIT_OPTS;

    protected readonly emptyTitle: Signal<string> = rtKitLabel('chartEmpty');

    protected readonly emptyHint: Signal<string> = rtKitLabel('chartEmptyHint');

    protected readonly empty: Signal<boolean> = computed((): boolean => rtChartIsEmpty(this.option()));

    /** График создаётся, когда у узла есть ширина и прочитаны цвета темы. */
    protected readonly ready: Signal<boolean> = computed((): boolean => this.#width() > 0 && this.#colors() !== null);

    protected readonly chartTheme: Signal<ThemeOption> = computed((): ThemeOption => {
        const colors: IRtChartColors | null = this.#colors();

        return colors ? rtChartTheme(colors) : {};
    });

    /** Опция `echarts`; палитру и цвета подписей добавляет график. */
    public readonly option: InputSignal<EChartsCoreOption> = input.required<EChartsCoreOption>();

    /** Высота графика: любое значение CSS-длины. */
    public readonly height: InputSignal<string> = input<string>('320px');

    /** График дорисован. */
    public readonly rendered: OutputEmitterRef<void> = output<void>();

    constructor() {
        // Оба обратных вызова идут только в браузере: на сервере график не создаётся.
        afterNextRender((): void => this.#observeWidth());

        afterRenderEffect({
            read: (): void => {
                this.#theme.current();
                this.#readColors();
            },
        });
    }

    /** PNG графика с подложкой его темы — адрес данных; `null`, пока график не нарисован. */
    public toPng(): Promise<string | null> {
        const chart: ECharts | null = this.#chart;
        const colors: IRtChartColors | null = this.#colors();

        if (!chart || chart.isDisposed() || !colors) {
            return Promise.resolve(null);
        }

        return rtChartSvgToPng(
            this.#document,
            chart.renderToSVGString(),
            { width: chart.getWidth(), height: chart.getHeight() },
            colors.surface
        );
    }

    protected onChartInit(chart: ECharts): void {
        this.#chart = chart;
    }

    protected onChartFinished(): void {
        this.rendered.emit();
    }

    #readColors(): void {
        const next: IRtChartColors = rtChartReadColors(this.#window.getComputedStyle(this.#host.nativeElement));
        const current: IRtChartColors | null = this.#colors();

        if (!current || rtChartColorsKey(current) !== rtChartColorsKey(next)) {
            this.#colors.set(next);
        }
    }

    #observeWidth(): void {
        const host: HTMLElement = this.#host.nativeElement;
        const observer: ResizeObserver = new this.#window.ResizeObserver((): void => this.#width.set(host.clientWidth));

        this.#width.set(host.clientWidth);
        observer.observe(host);
        this.#destroyRef.onDestroy((): void => observer.disconnect());
    }
}
