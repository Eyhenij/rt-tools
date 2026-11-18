import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtAiChatComponent } from '../../../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.component';
import { IRtAiChat } from '../../../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.model';
import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { provideRtAiChatChart } from '../../../../ai-chat-chart.providers';
import { RtAiChatChartComponent } from '../../rt-ai-chat-chart.component';
import {
    AI_CHAT_CHART_ANSWER,
    AI_CHAT_CHART_KINDS,
    AI_CHAT_CHART_STATES,
    AI_CHAT_CHART_WIDTHS,
    IAiChatChartCase,
} from './ai-chat-chart.fixture';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAiChatChartMatrixPart = 'kinds' | 'states' | 'widths' | 'answer' | 'fullScreen' | 'presets' | 'themes';

/**
 * Матрицы блока графика для витрины: десять видов, состояния, три ширины ленты, ответ в беседе
 * и окно на весь экран. Ширина ячейки — ширина ленты панели ассистента, 386 точек.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-chart-matrix',
    templateUrl: './test-ai-chat-chart-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideRtAiChatChart()],
    imports: [
        // Angular
        NgTemplateOutlet,

        // components
        RtAiChatChartComponent,
        RtAiChatComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAiChatChartMatrixComponent {
    public part: TAiChatChartMatrixPart = 'kinds';

    public readonly kinds: readonly IAiChatChartCase[] = AI_CHAT_CHART_KINDS;

    public readonly states: readonly IAiChatChartCase[] = AI_CHAT_CHART_STATES;

    public readonly widths: readonly string[] = AI_CHAT_CHART_WIDTHS;

    public readonly line: IAiChatChartCase = AI_CHAT_CHART_KINDS[0];

    public readonly answer: readonly IRtAiChat.Message[] = AI_CHAT_CHART_ANSWER;

    public readonly caseLabel: (item: IAiChatChartCase) => string = (item: IAiChatChartCase): string => item.name;

    public readonly widthLabel: (item: string) => string = (item: string): string => item;
}
