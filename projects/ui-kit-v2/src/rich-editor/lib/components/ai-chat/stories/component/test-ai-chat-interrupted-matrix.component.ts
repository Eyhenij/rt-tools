import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtAiChatComponent } from '../../rt-ai-chat.component';
import { RtAiChatMessageExtraDirective } from '../../rt-ai-chat.directives';
import {
    AI_CHAT_INTERRUPTED_CASES,
    AI_CHAT_INTERRUPTED_EMPTY_CASES,
    AI_CHAT_INTERRUPTED_RTL_CASES,
    AI_CHAT_INTERRUPTED_STATE_CASES,
    AI_CHAT_INTERRUPTED_THEME_CASES,
    AI_CHAT_INTERRUPTED_WIDTH_CASES,
    IAiChatInterruptedCase,
} from './ai-chat-interrupted.fixture';
import { TestRtAiChatEnglishLabelsComponent } from './test-ai-chat-english-labels.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAiChatInterruptedMatrixPart = 'widths' | 'empty' | 'cases' | 'rtl' | 'states' | 'presets' | 'themes';

/**
 * Матрицы прерванного ответа `rt-ai-chat` для витрины: весь чат в ящике, как на макете. Ширина
 * ящика — ширина ответа плюс поля ленты и рамка, высота — 40rem: лента не прокручивается, и
 * полоса прокрутки не отнимает ширину у ответа. Ячейка помечает ширину ответа атрибутом, и шаг
 * `play` сверяет с ним ответ.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-interrupted-matrix',
    templateUrl: './test-ai-chat-interrupted-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,

        // components
        RtAiChatComponent,
        RtAiChatMessageExtraDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
        TestRtAiChatEnglishLabelsComponent,
    ],
})
export class TestRtAiChatInterruptedMatrixComponent {
    public part: TAiChatInterruptedMatrixPart = 'widths';

    public readonly widthCases: readonly IAiChatInterruptedCase[] = AI_CHAT_INTERRUPTED_WIDTH_CASES;

    public readonly emptyCases: readonly IAiChatInterruptedCase[] = AI_CHAT_INTERRUPTED_EMPTY_CASES;

    public readonly otherCases: readonly IAiChatInterruptedCase[] = AI_CHAT_INTERRUPTED_CASES;

    public readonly rtlCases: readonly IAiChatInterruptedCase[] = AI_CHAT_INTERRUPTED_RTL_CASES;

    public readonly stateCases: readonly IAiChatInterruptedCase[] = AI_CHAT_INTERRUPTED_STATE_CASES;

    public readonly themeCases: readonly IAiChatInterruptedCase[] = AI_CHAT_INTERRUPTED_THEME_CASES;

    public readonly caseLabel: (item: IAiChatInterruptedCase) => string = (item: IAiChatInterruptedCase): string => item.name;
}
