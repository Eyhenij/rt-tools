import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    Signal,
    viewChild,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import {
    RT_KIT_LABELS,
    RtDialogService,
    RtIconButtonComponent,
    RtMessageComponent,
    RtTooltipDirective,
    TRtKitLabelMap,
} from '@rt-tools/ui-kit-v2';

import { IRtAiChatChart } from '../../ai-chat-chart.model';
import { rtAiChatChartSave } from '../../ai-chat-chart.save';
import { rtAiChatChartFileName, rtAiChatChartIsEmpty, rtAiChatChartState, TRtAiChatChartState } from '../../ai-chat-chart.view';
import { RtAiChatChartDialogComponent } from '../dialog/rt-ai-chat-chart-dialog.component';
import { RtAiChatChartPlotComponent } from '../plot/rt-ai-chat-chart-plot.component';

const BEM_BLOCK: string = 'rt-ai-chat-chart';

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
        RtAiChatChartPlotComponent,
        RtIconButtonComponent,
        RtMessageComponent,
        RtTooltipDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiChatChartComponent {
    readonly #document: Document = inject(DOCUMENT);
    readonly #dialog: RtDialogService = inject(RtDialogService);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

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

    /** Блок ответа, как его отдала лента: `{ type: 'chart', spec, pending? }`. */
    public readonly block: InputSignal<unknown> = input.required<unknown>();

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
            rtAiChatChartSave(this.#document, url, rtAiChatChartFileName(this.spec()?.title));
        }
    }
}
