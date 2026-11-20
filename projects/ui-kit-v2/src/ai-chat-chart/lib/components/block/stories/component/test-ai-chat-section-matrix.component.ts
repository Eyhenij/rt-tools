import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtAiChatBlocksComponent } from '../../../../../../rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component';
import { RtAiChatComponent } from '../../../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.component';
import { IRtAiChat } from '../../../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.model';
import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { provideRtAiChatChart } from '../../../../ai-chat-chart.providers';
import {
    AI_CHAT_SECTION_INVALID_CASES,
    AI_CHAT_SECTION_KPI_CASES,
    AI_CHAT_SECTION_LONE_CASES,
    AI_CHAT_SECTION_MESSAGES,
    AI_CHAT_SECTION_PLATE_CASES,
    AI_CHAT_SECTION_RTL_CASES,
    AI_CHAT_SECTION_SPAN_CASES,
    AI_CHAT_SECTION_THEME_CASES,
    AI_CHAT_SECTION_THREADS,
    AI_CHAT_SECTION_THRESHOLD_CASES,
    AI_CHAT_SECTION_TITLE_CASES,
    AI_CHAT_SECTION_TWO,
    AI_CHAT_SECTION_WIDTH_CASES,
    IAiChatSectionCase,
} from './ai-chat-section.fixture';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAiChatSectionMatrixPart =
    | 'widths'
    | 'threshold'
    | 'lone'
    | 'span'
    | 'titles'
    | 'plates'
    | 'kpi'
    | 'two'
    | 'rtl'
    | 'invalid'
    | 'panel'
    | 'fullScreen'
    | 'threads'
    | 'readingColumn'
    | 'presets'
    | 'themes';

/**
 * Матрицы блока секции для витрины. Секция рисуется через `rt-ai-chat-blocks` — тем же путём, что
 * в ответе; истории панели и полноэкранного режима рисуют весь `rt-ai-chat` с ответом «обзор
 * месяца». Истории стоят во входе графика: обзору нужны настоящие графики.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-section-matrix',
    templateUrl: './test-ai-chat-section-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideRtAiChatChart()],
    imports: [
        // Angular
        NgTemplateOutlet,

        // components
        RtAiChatBlocksComponent,
        RtAiChatComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAiChatSectionMatrixComponent {
    public part: TAiChatSectionMatrixPart = 'widths';

    public readonly widthCases: readonly IAiChatSectionCase[] = AI_CHAT_SECTION_WIDTH_CASES;

    public readonly thresholdCases: readonly IAiChatSectionCase[] = AI_CHAT_SECTION_THRESHOLD_CASES;

    public readonly loneCases: readonly IAiChatSectionCase[] = AI_CHAT_SECTION_LONE_CASES;

    public readonly spanCases: readonly IAiChatSectionCase[] = AI_CHAT_SECTION_SPAN_CASES;

    public readonly titleCases: readonly IAiChatSectionCase[] = AI_CHAT_SECTION_TITLE_CASES;

    public readonly plateCases: readonly IAiChatSectionCase[] = AI_CHAT_SECTION_PLATE_CASES;

    public readonly kpiCases: readonly IAiChatSectionCase[] = AI_CHAT_SECTION_KPI_CASES;

    public readonly rtlCases: readonly IAiChatSectionCase[] = AI_CHAT_SECTION_RTL_CASES;

    public readonly invalidCases: readonly IAiChatSectionCase[] = AI_CHAT_SECTION_INVALID_CASES;

    public readonly themeCases: readonly IAiChatSectionCase[] = AI_CHAT_SECTION_THEME_CASES;

    public readonly two: readonly IRtAiChat.Block[] = AI_CHAT_SECTION_TWO;

    public readonly messages: readonly IRtAiChat.Message[] = AI_CHAT_SECTION_MESSAGES;

    public readonly threads: readonly IRtAiChat.Thread[] = AI_CHAT_SECTION_THREADS;

    public readonly caseLabel: (item: IAiChatSectionCase) => string = (item: IAiChatSectionCase): string => item.name;
}
