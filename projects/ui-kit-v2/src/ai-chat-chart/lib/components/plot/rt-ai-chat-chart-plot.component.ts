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

import { BlockDirective, ElemDirective, WINDOW } from '@rt-tools/core';

import { RT_KIT_LOCALE, rtKitLabel } from '@rt-tools/ui-kit-v2';
import { IRtChart, RtChartComponent } from '@rt-tools/ui-kit-v2/chart';

import { rtAiChatChartData } from '../../ai-chat-chart.data';
import { ERtAiChatChartKind } from '../../ai-chat-chart.enum';
import { IRtAiChatChart } from '../../ai-chat-chart.model';
import { rtAiChatChartIsEmpty, rtAiChatChartLabelEvery } from '../../ai-chat-chart.view';

const BEM_BLOCK: string = 'rt-ai-chat-chart-plot';

/** Виды без осей: имена осей у них не рисуются. */
const AXISLESS_KINDS: ReadonlySet<ERtAiChatChartKind> = new Set([
    ERtAiChatChartKind.PIE,
    ERtAiChatChartKind.TREEMAP,
    ERtAiChatChartKind.SUNBURST,
]);

/** Данные, которые `rt-chart` считает пустыми: блок сам решил, что рисовать нечего. */
const EMPTY_DATA: IRtChart.TData = { kind: 'cartesian', categories: [], series: [] };

/**
 * Поле графика по проверенной спецификации: имя оси значений над полем, `rt-chart`, имя оси
 * категорий под легендой. Подписи категорий прореживаются по ширине поля, форматы берут локаль кита.
 */
@Component({
    selector: 'rt-ai-chat-chart-plot',
    templateUrl: './rt-ai-chat-chart-plot.component.html',
    styleUrl: './rt-ai-chat-chart-plot.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtChartComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiChatChartPlotComponent {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    /** Конструктор наблюдателя объявлен на глобальном объекте, а не на интерфейсе окна. */
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;
    readonly #locale: Signal<string> = inject(RT_KIT_LOCALE);

    /** Ширина поля; ноль — блок ещё не разложен или страница рисуется на сервере. */
    readonly #width: WritableSignal<number> = signal<number>(0);

    readonly #fallbackLabel: Signal<string> = rtKitLabel('aiChartLabel');

    protected readonly chart: Signal<RtChartComponent | undefined> = viewChild(RtChartComponent);

    protected readonly axisNames: Signal<boolean> = computed((): boolean => !AXISLESS_KINDS.has(this.spec().kind));

    protected readonly label: Signal<string> = computed((): string => this.spec().title || this.#fallbackLabel());

    protected readonly data: Signal<IRtChart.TData> = computed((): IRtChart.TData => {
        const spec: IRtAiChatChart.Spec = this.spec();
        if (rtAiChatChartIsEmpty(spec)) {
            return EMPTY_DATA;
        }
        const data: IRtChart.TData = rtAiChatChartData(spec, this.#locale());

        return data.kind === 'cartesian' ? { ...data, labelEvery: rtAiChatChartLabelEvery(data.categories, this.#width()) } : data;
    });

    /** Нарисован ли график: до раскладки поля снимать нечего. */
    public readonly drawn: Signal<boolean> = computed((): boolean => this.#width() > 0 && !rtAiChatChartIsEmpty(this.spec()));

    /** Проверенная спецификация. */
    public readonly spec: InputSignal<IRtAiChatChart.Spec> = input.required<IRtAiChatChart.Spec>();

    /** Высота поля без легенды: любое значение CSS-длины. */
    public readonly height: InputSignal<string> = input<string>('188px');

    constructor() {
        // Только в браузере: на сервере у поля нет ширины.
        afterNextRender((): void => this.#observeWidth());
    }

    /** PNG поля с легендой — адрес данных; `null`, пока график не нарисован. */
    public toPng(): Promise<string | null> {
        return this.chart()?.toPng() ?? Promise.resolve(null);
    }

    #observeWidth(): void {
        const host: HTMLElement = this.#host.nativeElement;
        const read: () => void = (): void => this.#width.set(host.clientWidth);
        const observer: ResizeObserver = new this.#window.ResizeObserver(read);

        read();
        observer.observe(host);
        this.#destroyRef.onDestroy((): void => observer.disconnect());
    }
}
