import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../../../showcase/story-themes.component';
import { RtAiChatComponent } from '../../../../rt-ai-chat.component';
import { IRtAiChat } from '../../../../rt-ai-chat.model';
import { RtAiChatBlocksComponent } from '../../../rt-ai-chat-blocks.component';
import {
    AI_CHAT_SOURCES_INVALID_CASES,
    AI_CHAT_SOURCES_MESSAGES,
    AI_CHAT_SOURCES_PARTS_CASES,
    AI_CHAT_SOURCES_RTL_CASES,
    AI_CHAT_SOURCES_STATE_CASES,
    AI_CHAT_SOURCES_THEME_CASES,
    AI_CHAT_SOURCES_WIDTH_CASES,
    IAiChatSourcesCase,
} from './ai-chat-sources.fixture';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAiChatSourcesMatrixPart = 'widths' | 'states' | 'parts' | 'invalid' | 'rtl' | 'panel' | 'presets' | 'themes';

/**
 * Матрицы блока источников для витрины. Блок рисуется через `rt-ai-chat-blocks` — тем же путём, что
 * в ответе. Ячейка с `open` помечена атрибутом, и шаг `play` раскрывает её список нажатием на
 * заголовок. История панели рисует весь `rt-ai-chat` и показывает события `sourceOpen` строками.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-sources-matrix',
    templateUrl: './test-ai-chat-sources-matrix.component.html',
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
export class TestRtAiChatSourcesMatrixComponent {
    /** Лента истории чата. */
    protected readonly messages: readonly IRtAiChat.Message[] = AI_CHAT_SOURCES_MESSAGES;

    /** События `sourceOpen`, как они пришли: история показывает их строками под чатом. */
    protected readonly log: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

    public part: TAiChatSourcesMatrixPart = 'widths';

    public readonly widthCases: readonly IAiChatSourcesCase[] = AI_CHAT_SOURCES_WIDTH_CASES;

    public readonly stateCases: readonly IAiChatSourcesCase[] = AI_CHAT_SOURCES_STATE_CASES;

    public readonly partsCases: readonly IAiChatSourcesCase[] = AI_CHAT_SOURCES_PARTS_CASES;

    public readonly invalidCases: readonly IAiChatSourcesCase[] = AI_CHAT_SOURCES_INVALID_CASES;

    public readonly rtlCases: readonly IAiChatSourcesCase[] = AI_CHAT_SOURCES_RTL_CASES;

    public readonly themeCases: readonly IAiChatSourcesCase[] = AI_CHAT_SOURCES_THEME_CASES;

    public readonly caseLabel: (item: IAiChatSourcesCase) => string = (item: IAiChatSourcesCase): string => item.name;

    /** То, что делает приложение: получает событие и открывает источник; здесь оно только пишется в журнал. */
    protected onSourceOpen(event: IRtAiChat.SourceOpen): void {
        this.log.update((lines: readonly string[]): readonly string[] => [...lines, JSON.stringify(event)]);
    }
}
