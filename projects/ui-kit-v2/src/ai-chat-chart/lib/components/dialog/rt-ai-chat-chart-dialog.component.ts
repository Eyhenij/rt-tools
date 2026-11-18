import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal, viewChild, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import {
    RT_DIALOG_DATA,
    RT_KIT_LABELS,
    RtDialogComponent,
    RtDialogContentComponent,
    RtDialogHeaderComponent,
    RtIconButtonComponent,
    TRtKitLabelMap,
} from '@rt-tools/ui-kit-v2';

import { IRtAiChatChart } from '../../ai-chat-chart.model';
import { rtAiChatChartSave } from '../../ai-chat-chart.save';
import { rtAiChatChartFileName } from '../../ai-chat-chart.view';
import { RtAiChatChartPlotComponent } from '../plot/rt-ai-chat-chart-plot.component';

const BEM_BLOCK: string = 'rt-ai-chat-chart-dialog';

/** Высота поля на весь экран: окно за вычетом заголовка, подзаголовка, легенды и полей диалога. */
const FULL_HEIGHT: string = 'calc(100dvh - 16rem)';

/** Ширина диалога: почти весь экран, но не шире, чем читается график. */
const FULL_WIDTH: string = 'min(72rem, calc(100vw - 2rem))';

/** График на весь экран: заголовок спецификации, подзаголовок, поле графика и «Скачать PNG». */
@Component({
    selector: 'rt-ai-chat-chart-dialog',
    templateUrl: './rt-ai-chat-chart-dialog.component.html',
    styleUrl: './rt-ai-chat-chart-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtAiChatChartPlotComponent,
        RtDialogComponent,
        RtDialogContentComponent,
        RtDialogHeaderComponent,
        RtIconButtonComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiChatChartDialogComponent {
    readonly #document: Document = inject(DOCUMENT);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly spec: IRtAiChatChart.Spec = inject<IRtAiChatChart.Spec>(RT_DIALOG_DATA);

    protected readonly FULL_HEIGHT: string = FULL_HEIGHT;

    protected readonly FULL_WIDTH: string = FULL_WIDTH;

    protected readonly plot: Signal<RtAiChatChartPlotComponent | undefined> = viewChild(RtAiChatChartPlotComponent);

    protected readonly title: Signal<string> = computed((): string => this.spec.title || this.t().aiChartLabel);

    protected readonly drawn: Signal<boolean> = computed((): boolean => this.plot()?.drawn() ?? false);

    protected async download(): Promise<void> {
        const url: string | null = (await this.plot()?.toPng()) ?? null;
        if (url) {
            rtAiChatChartSave(this.#document, url, rtAiChatChartFileName(this.spec.title));
        }
    }
}
