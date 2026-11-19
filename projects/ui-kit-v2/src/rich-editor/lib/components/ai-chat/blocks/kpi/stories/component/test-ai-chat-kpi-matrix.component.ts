import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../../../showcase/story-themes.component';
import { IRtAiChat } from '../../../../rt-ai-chat.model';
import { RtAiChatComponent } from '../../../../rt-ai-chat.component';
import { RtAiChatBlocksComponent } from '../../../rt-ai-chat-blocks.component';
import {
    AI_CHAT_KPI_BELOW_CASES,
    AI_CHAT_KPI_DELTA_CASES,
    AI_CHAT_KPI_INVALID_CASES,
    AI_CHAT_KPI_LONG_CASES,
    AI_CHAT_KPI_MESSAGES,
    AI_CHAT_KPI_MONTH,
    AI_CHAT_KPI_ODD_CASES,
    AI_CHAT_KPI_PARTS_CASES,
    AI_CHAT_KPI_SEVERAL,
    AI_CHAT_KPI_SHORT_CASES,
    AI_CHAT_KPI_THRESHOLD_CASES,
    AI_CHAT_KPI_WIDTH_CASES,
    IAiChatKpiCase,
} from './ai-chat-kpi.fixture';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAiChatKpiMatrixPart =
    | 'widths'
    | 'threshold'
    | 'below'
    | 'deltas'
    | 'short'
    | 'parts'
    | 'odd'
    | 'long'
    | 'invalid'
    | 'several'
    | 'rtl'
    | 'panel'
    | 'fullScreen'
    | 'readingColumn'
    | 'presets'
    | 'themes';

/**
 * Матрицы блока KPI для витрины. Блок рисуется через `rt-ai-chat-blocks` — тем же путём, что в
 * ответе; истории панели и полноэкранного режима рисуют весь `rt-ai-chat` с ответом из карточек.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-kpi-matrix',
    templateUrl: './test-ai-chat-kpi-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
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
export class TestRtAiChatKpiMatrixComponent {
    public part: TAiChatKpiMatrixPart = 'widths';

    public readonly widthCases: readonly IAiChatKpiCase[] = AI_CHAT_KPI_WIDTH_CASES;

    public readonly thresholdCases: readonly IAiChatKpiCase[] = AI_CHAT_KPI_THRESHOLD_CASES;

    public readonly belowCases: readonly IAiChatKpiCase[] = AI_CHAT_KPI_BELOW_CASES;

    public readonly deltaCases: readonly IAiChatKpiCase[] = AI_CHAT_KPI_DELTA_CASES;

    public readonly shortCases: readonly IAiChatKpiCase[] = AI_CHAT_KPI_SHORT_CASES;

    public readonly partsCases: readonly IAiChatKpiCase[] = AI_CHAT_KPI_PARTS_CASES;

    public readonly oddCases: readonly IAiChatKpiCase[] = AI_CHAT_KPI_ODD_CASES;

    public readonly longCases: readonly IAiChatKpiCase[] = AI_CHAT_KPI_LONG_CASES;

    public readonly invalidCases: readonly IAiChatKpiCase[] = AI_CHAT_KPI_INVALID_CASES;

    public readonly several: readonly IRtAiChat.Block[] = AI_CHAT_KPI_SEVERAL;

    public readonly month: readonly IRtAiChat.Block[] = [AI_CHAT_KPI_MONTH];

    public readonly messages: readonly IRtAiChat.Message[] = AI_CHAT_KPI_MESSAGES;

    /** Темы и наборы: обе ширины макета, 328 и 728. */
    public readonly themeCases: readonly IAiChatKpiCase[] = [AI_CHAT_KPI_WIDTH_CASES[0], AI_CHAT_KPI_WIDTH_CASES[2]];

    public readonly caseLabel: (item: IAiChatKpiCase) => string = (item: IAiChatKpiCase): string => item.name;
}
