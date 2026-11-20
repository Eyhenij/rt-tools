import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ERtAiChatChartKind } from '../../../../ai-chat-chart.enum';
import { IRtAiChatChart } from '../../../../ai-chat-chart.model';
import { RT_AI_CHAT_CHART_SAMPLES } from '../../../../ai-chat-chart.samples';
import { RtAiChatChartComponent } from '../../rt-ai-chat-chart.component';

/** Спецификация, которая не разбирается: на ней видна плашка. */
const BROKEN: string = '{"kind":"line","series":[{"na';

/**
 * Обёртка `Playground`: вид графика, признак ожидания и негодная спецификация — входы витрины.
 * Блок собирается из образца выбранного вида.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-chart',
    templateUrl: './test-ai-chat-chart.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAiChatChartComponent,
    ],
})
export class TestRtAiChatChartComponent {
    protected readonly broken: string = BROKEN;

    protected readonly samples: Readonly<Record<ERtAiChatChartKind, IRtAiChatChart.Spec>> = RT_AI_CHAT_CHART_SAMPLES;

    public kind: ERtAiChatChartKind = ERtAiChatChartKind.LINE;

    public pending: boolean = false;

    public invalid: boolean = false;
}
