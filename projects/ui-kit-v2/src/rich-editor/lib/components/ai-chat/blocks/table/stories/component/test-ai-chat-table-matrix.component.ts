import { Clipboard } from '@angular/cdk/clipboard';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../../../showcase/story-themes.component';
import { IRtAiChat } from '../../../../rt-ai-chat.model';
import { RtAiChatBlocksComponent } from '../../../rt-ai-chat-blocks.component';
import {
    AI_CHAT_TABLE_EMPTY_CASES,
    AI_CHAT_TABLE_INVALID_CASES,
    AI_CHAT_TABLE_MARKDOWN,
    AI_CHAT_TABLE_NEGATIVE_CASES,
    AI_CHAT_TABLE_REVENUE,
    AI_CHAT_TABLE_RTL,
    AI_CHAT_TABLE_TALL,
    AI_CHAT_TABLE_TOTAL_CASES,
    AI_CHAT_TABLE_WIDE,
    AI_CHAT_TABLE_WIDTH_CASES,
    IAiChatTableCase,
} from './ai-chat-table.fixture';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAiChatTableMatrixPart =
    'narrow' | 'wide' | 'total' | 'negatives' | 'scrolled' | 'copied' | 'empty' | 'invalid' | 'markdown' | 'rtl' | 'presets' | 'themes';

/**
 * Буфер обмена витрины. Нажатие из шага `play` — не жест человека, и браузер отказывает такой копии;
 * без подмены история «Copied» показывала бы кнопку, которая ничего не сделала. В пакет не уезжает.
 */
const SHOWCASE_CLIPBOARD: Pick<Clipboard, 'copy'> = { copy: (): boolean => true };

/**
 * Матрицы блока таблицы для витрины. Блок рисуется через `rt-ai-chat-blocks` — тем же путём, что
 * в ответе: заголовок и приведение данных проходят код ленты. Ширина ячейки — узкая лента, 328.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-table-matrix',
    templateUrl: './test-ai-chat-table-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: Clipboard, useValue: SHOWCASE_CLIPBOARD }],
    imports: [
        // Angular
        NgTemplateOutlet,

        // components
        RtAiChatBlocksComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAiChatTableMatrixComponent {
    public part: TAiChatTableMatrixPart = 'narrow';

    public readonly widthCases: readonly IAiChatTableCase[] = AI_CHAT_TABLE_WIDTH_CASES;

    public readonly totalCases: readonly IAiChatTableCase[] = AI_CHAT_TABLE_TOTAL_CASES;

    public readonly negativeCases: readonly IAiChatTableCase[] = AI_CHAT_TABLE_NEGATIVE_CASES;

    public readonly emptyCases: readonly IAiChatTableCase[] = AI_CHAT_TABLE_EMPTY_CASES;

    public readonly invalidCases: readonly IAiChatTableCase[] = AI_CHAT_TABLE_INVALID_CASES;

    public readonly wide: readonly IRtAiChat.Block[] = [AI_CHAT_TABLE_WIDE];

    public readonly tall: readonly IRtAiChat.Block[] = [AI_CHAT_TABLE_TALL];

    public readonly revenue: readonly IRtAiChat.Block[] = [AI_CHAT_TABLE_REVENUE];

    public readonly markdown: readonly IRtAiChat.Block[] = AI_CHAT_TABLE_MARKDOWN;

    public readonly rtl: readonly IRtAiChat.Block[] = AI_CHAT_TABLE_RTL;

    public readonly themeCases: readonly IAiChatTableCase[] = [
        { name: 'с итогом и заголовком', blocks: [AI_CHAT_TABLE_REVENUE] },
        ...AI_CHAT_TABLE_NEGATIVE_CASES,
    ];

    public readonly caseLabel: (item: IAiChatTableCase) => string = (item: IAiChatTableCase): string => item.name;
}
