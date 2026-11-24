import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    linkedSignal,
    Signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import {
    RT_KIT_LABELS,
    RT_KIT_LOCALE,
    RtButtonDirective,
    RtDialogService,
    RtIconButtonComponent,
    RtMessageComponent,
    RtTooltipDirective,
    TRtKitLabelMap,
} from '@rt-tools/ui-kit-v2';

import { IRtAiChatChart } from '../../ai-chat-chart.model';
import { rtAiChatChartSave } from '../../ai-chat-chart.save';
import { IRtAiChatChartTable, rtAiChatChartTable } from '../../ai-chat-chart.table';
import { rtAiChatChartFileName, rtAiChatChartIsEmpty, rtAiChatChartState, TRtAiChatChartState } from '../../ai-chat-chart.view';
import { RtAiChatChartDialogComponent } from '../dialog/rt-ai-chat-chart-dialog.component';
import { RtAiChatChartPlotComponent } from '../plot/rt-ai-chat-chart-plot.component';

const BEM_BLOCK: string = 'rt-ai-chat-chart';

/** Счётчик экземпляров: id таблицы у каждого блока ленты свой. */
let tableCount: number = 0;

function nextTableId(): string {
    tableCount += 1;

    return `rt-ai-chat-chart-data-${tableCount}`;
}

/**
 * Блок `chart` ответа ассистента. Разбирает и проверяет спецификацию, рисует её через `rt-chart`
 * со строкой заголовка, открывает график на весь экран и сохраняет его PNG. Пока спецификация идёт —
 * заглушка, негодная — плашка, пустая — пустое состояние графика без кнопок.
 */
@Component({
    selector: 'rt-ai-chat-chart',
    templateUrl: './rt-ai-chat-chart.component.html',
    styleUrl: './rt-ai-chat-chart.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtAiChatChartPlotComponent,
        RtButtonDirective,
        RtIconButtonComponent,
        RtMessageComponent,
        RtTooltipDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiChatChartComponent {
    readonly #doc: Document = inject(DOCUMENT);
    readonly #dialog: RtDialogService = inject(RtDialogService);
    readonly #locale: Signal<string> = inject(RT_KIT_LOCALE);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /** Id таблицы данных для `aria-controls` кнопки: свой у каждого блока. */
    protected readonly tableId: string = nextTableId();

    protected readonly plot: Signal<RtAiChatChartPlotComponent | undefined> = viewChild(RtAiChatChartPlotComponent);

    protected readonly state: Signal<TRtAiChatChartState> = computed((): TRtAiChatChartState => rtAiChatChartState(this.block()));

    protected readonly spec: Signal<IRtAiChatChart.Spec | null> = computed((): IRtAiChatChart.Spec | null => {
        const state: TRtAiChatChartState = this.state();

        return state.kind === 'ready' ? state.spec : null;
    });

    /** Кнопки строки заголовка: у пустого графика их нет. */
    protected readonly actions: Signal<boolean> = computed((): boolean => {
        const spec: IRtAiChatChart.Spec | null = this.spec();

        return spec !== null && !rtAiChatChartIsEmpty(spec);
    });

    protected readonly drawn: Signal<boolean> = computed((): boolean => this.plot()?.drawn() ?? false);

    /** Ключ спецификации: другая спецификация закрывает таблицу, та же — нет. */
    readonly #specKey: Signal<string> = computed((): string => JSON.stringify(this.spec()));

    /** Таблица открыта: закрыта при создании и при другой спецификации, не запоминается. */
    protected readonly open: WritableSignal<boolean> = linkedSignal<string, boolean>({
        source: this.#specKey,
        computation: (): boolean => false,
    });

    /** Подпись кнопки: «Показать данные» у закрытой таблицы, «Скрыть данные» у открытой. */
    protected readonly toggleLabel: Signal<string> = computed((): string =>
        this.open() ? this.t().aiChartHideData : this.t().aiChartShowData
    );

    /** Стрелка кнопки: вниз у закрытой таблицы, вверх у открытой. */
    protected readonly toggleIcon: Signal<string> = computed((): string => (this.open() ? 'chevron-up' : 'chevron-down'));

    /** Таблица данных: строится только открытая, по языку подписей кита. */
    protected readonly table: Signal<IRtAiChatChartTable | null> = computed((): IRtAiChatChartTable | null => {
        const spec: IRtAiChatChart.Spec | null = this.spec();
        if (!spec || !this.open() || !this.actions()) {
            return null;
        }
        const t: TRtKitLabelMap = this.t();

        return rtAiChatChartTable(spec, this.#locale(), {
            category: t.aiChartCategory,
            bin: t.aiChartBin,
            value: t.aiChartValue,
            series: t.aiChartSeries,
            x: t.aiChartX,
            y: t.aiChartY,
            path: t.aiChartPath,
        });
    });

    /** Блок ответа, как его отдала лента: `{ type: 'chart', spec, pending? }`. */
    public readonly block: InputSignal<unknown> = input.required<unknown>();

    protected toggleData(): void {
        this.open.update((open: boolean): boolean => !open);
    }

    protected openFullScreen(): void {
        const spec: IRtAiChatChart.Spec | null = this.spec();
        if (spec) {
            this.#dialog.open<RtAiChatChartDialogComponent, IRtAiChatChart.Spec>(RtAiChatChartDialogComponent, {
                data: spec,
                trapFocus: true,
                restoreFocus: true,
                autoFocus: 'dialog',
            });
        }
    }

    protected async download(): Promise<void> {
        const url: string | null = (await this.plot()?.toPng()) ?? null;
        if (url) {
            rtAiChatChartSave(this.#doc, url, rtAiChatChartFileName(this.spec()?.title));
        }
    }
}
