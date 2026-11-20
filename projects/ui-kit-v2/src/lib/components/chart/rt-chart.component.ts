import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    input,
    InputSignal,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective, WINDOW } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import { rtChartIsEmpty } from './rt-chart.empty';
import { RT_CHART_NO_SCENE, rtChartEstimate, rtChartScene } from './rt-chart.layout';
import { IRtChart } from './rt-chart.model';
import { rtChartToPng } from './rt-chart.png';
import { IRtChartPath, IRtChartScene, IRtChartSize, RT_CHART_COLOR, TRtChartMeasure } from './rt-chart.scene';

const BEM_BLOCK: string = 'rt-chart';

/** Подсказка над полем: текст и место относительно поля. */
interface ITip {
    readonly text: string;
    readonly x: number;
    readonly y: number;
}

/** Сдвиг подсказки от указателя, чтобы она не закрывала то, что под ним. */
const TIP_OFFSET: number = 12;

/** Модификатор значка-отрезка в легенде. */
const LINE_MARK: Readonly<Record<string, boolean>> = { line: true };

/** Значок-круг в легенде — без модификатора. */
const DOT_MARK: Readonly<Record<string, boolean>> = {};

/**
 * График кита: рисует данные модели кита как SVG своего шаблона.
 *
 * d3 считает формы и раскладку дерева, цвета — токены кита прямо в разметке, поэтому тёмное
 * поддерево и смена темы перерисовки не требуют. Пустые данные показывают заглушку кита вместо
 * осей. В контейнере нулевой ширины поле пусто, пока контейнер не получит ширину.
 */
@Component({
    selector: 'rt-chart',
    templateUrl: './rt-chart.component.html',
    styleUrl: './rt-chart.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtEmptyStateComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[style.--rt-chart-height]': 'height()',
    },
})
export class RtChartComponent {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    /** Конструкторы наблюдателей объявлены на глобальном объекте, а не на интерфейсе окна. */
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    /** Размер поля; ноль — контейнер ещё не разложен или страница рисуется на сервере. */
    readonly #size: WritableSignal<IRtChartSize> = signal<IRtChartSize>({ width: 0, height: 0 });

    /** Ширина подписи: холст страницы, а без него — оценка по числу букв. */
    #measure: TRtChartMeasure = rtChartEstimate;

    protected readonly LINE_MARK: Readonly<Record<string, boolean>> = LINE_MARK;

    protected readonly DOT_MARK: Readonly<Record<string, boolean>> = DOT_MARK;

    protected readonly plot: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('plot');

    protected readonly svg: Signal<ElementRef<SVGSVGElement> | undefined> = viewChild<ElementRef<SVGSVGElement>>('svg');

    protected readonly emptyTitle: Signal<string> = rtKitLabel('chartEmpty');

    protected readonly emptyHint: Signal<string> = rtKitLabel('chartEmptyHint');

    protected readonly empty: Signal<boolean> = computed((): boolean => rtChartIsEmpty(this.data()));

    protected readonly width: Signal<number> = computed((): number => this.#size().width);

    protected readonly plotHeight: Signal<number> = computed((): number => this.#size().height);

    protected readonly viewBox: Signal<string> = computed((): string => `0 0 ${this.#size().width} ${this.#size().height}`);

    protected readonly scene: Signal<IRtChartScene> = computed((): IRtChartScene => {
        const data: IRtChart.TData = this.data();

        return rtChartIsEmpty(data) ? RT_CHART_NO_SCENE : rtChartScene(data, this.#size(), this.#measure);
    });

    protected readonly tip: WritableSignal<ITip | null> = signal<ITip | null>(null);

    /** График в модели кита. */
    public readonly data: InputSignal<IRtChart.TData> = input.required<IRtChart.TData>();

    /** Высота поля без легенды: любое значение CSS-длины. */
    public readonly height: InputSignal<string> = input<string>('188px');

    /** Доступное имя графика. */
    public readonly label: InputSignal<string | null> = input<string | null>(null);

    constructor() {
        // Только в браузере: на сервере у поля нет размера, и график не рисуется.
        afterNextRender((): void => {
            this.#measure = this.#canvasMeasure();
            this.#observeSize();
        });
    }

    /** PNG графика с подложкой его темы и легендой — адрес данных; `null`, пока график не нарисован. */
    public toPng(): Promise<string | null> {
        const svg: SVGSVGElement | undefined = this.svg()?.nativeElement;
        const host: HTMLElement = this.#host.nativeElement;

        if (!svg || this.#size().width <= 0) {
            return Promise.resolve(null);
        }

        return rtChartToPng(this.#window, {
            host,
            svg,
            width: host.clientWidth,
            height: host.clientHeight,
            plot: this.#size(),
            legend: Array.from(host.querySelectorAll<HTMLElement>(`.${BEM_BLOCK}__legend-item, .${BEM_BLOCK}__scale`)),
            background: this.#window.getComputedStyle(host).getPropertyValue('--rt-color-bg-surface').trim() || RT_CHART_COLOR.surface,
        });
    }

    protected showTip(path: IRtChartPath, event: PointerEvent): void {
        const plot: HTMLElement | undefined = this.plot()?.nativeElement;

        if (!plot || path.tip.length === 0) {
            this.tip.set(null);

            return;
        }

        const box: DOMRect = plot.getBoundingClientRect();

        this.tip.set({ text: path.tip.join('\n'), x: event.clientX - box.left + TIP_OFFSET, y: event.clientY - box.top + TIP_OFFSET });
    }

    protected hideTip(): void {
        this.tip.set(null);
    }

    #canvasMeasure(): TRtChartMeasure {
        const context: CanvasRenderingContext2D | null =
            typeof this.#window.CanvasRenderingContext2D === 'function'
                ? this.#window.document.createElement('canvas').getContext('2d')
                : null;

        if (!context) {
            return rtChartEstimate;
        }

        const family: string = this.#window.getComputedStyle(this.#host.nativeElement).fontFamily;

        return (text: string, size: number): number => {
            context.font = `${size}px ${family}`;

            return context.measureText(text).width;
        };
    }

    #observeSize(): void {
        const host: HTMLElement = this.#host.nativeElement;
        const read: () => void = (): void => {
            const next: IRtChartSize = { width: host.clientWidth, height: this.plot()?.nativeElement.clientHeight ?? 0 };
            const current: IRtChartSize = this.#size();

            if (next.width !== current.width || next.height !== current.height) {
                this.#size.set(next);
            }
        };
        const observer: ResizeObserver = new this.#window.ResizeObserver(read);

        read();
        observer.observe(host);
        this.#destroyRef.onDestroy((): void => observer.disconnect());
    }
}
