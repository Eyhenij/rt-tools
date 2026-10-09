import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtAiChatComponent } from '../../rt-ai-chat.component';
import { RtAiChatMessageExtraDirective } from '../../rt-ai-chat.directives';
import { IRtAiChat } from '../../rt-ai-chat.model';
import {
    AI_CHAT_DONE,
    AI_CHAT_ERROR,
    AI_CHAT_FAILED,
    AI_CHAT_LONG,
    AI_CHAT_LONG_DRAFT,
    AI_CHAT_RATED,
    AI_CHAT_STOPPED,
    AI_CHAT_STREAMING,
    AI_CHAT_SUGGESTIONS,
    AI_CHAT_THINKING,
    AI_CHAT_THREADS,
} from './ai-chat.fixture';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAiChatMatrixPart = 'empty' | 'answer' | 'error' | 'threads' | 'fullScreen' | 'long' | 'extra' | 'presets' | 'themes';

/** Случай панели: подпись ячейки и то, что приходит входами. */
interface IAiChatCase {
    readonly name: string;
    readonly messages: readonly IRtAiChat.Message[];
    readonly sending?: boolean;
    readonly loading?: boolean;
    readonly error?: IRtAiChat.RunError | null;
    readonly suggestions?: readonly string[];
    readonly threads?: readonly IRtAiChat.Thread[];
    readonly threadsLoading?: boolean;
    readonly draft?: string;
    readonly copyable?: boolean;
}

/**
 * Матрицы `rt-ai-chat` для витрины.
 *
 * Панель стоит в ящике 420 × 640 — ширина боковой панели ассистента. Высоту панели даёт
 * потребитель: без ящика лента мерилась бы по содержимому. Размеры и фон ящика написаны прямо в
 * разметке, как у обёрток показа переписки.
 *
 * Блик хода работы анимирован; кадр снимается с остановленной анимацией.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-matrix',
    templateUrl: './test-ai-chat-matrix.component.html',
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
    ],
})
export class TestRtAiChatMatrixComponent {
    public part: TAiChatMatrixPart = 'answer';

    public readonly done: readonly IRtAiChat.Message[] = AI_CHAT_DONE;
    public readonly threads: readonly IRtAiChat.Thread[] = AI_CHAT_THREADS;

    public readonly emptyCases: readonly IAiChatCase[] = [
        { name: 'Подсказки', messages: [], suggestions: AI_CHAT_SUGGESTIONS },
        { name: 'Без подсказок', messages: [] },
        { name: 'Загрузка беседы', messages: [], loading: true },
    ];

    public readonly answerCases: readonly IAiChatCase[] = [
        { name: 'Думает', messages: AI_CHAT_THINKING, sending: true },
        { name: 'Пишет', messages: AI_CHAT_STREAMING, sending: true },
        { name: 'Готов', messages: AI_CHAT_DONE },
        { name: 'Оценён', messages: AI_CHAT_RATED },
        { name: 'Остановлен', messages: AI_CHAT_STOPPED },
        { name: 'Не удался', messages: AI_CHAT_FAILED },
        { name: 'Без копирования', messages: AI_CHAT_DONE, copyable: false },
    ];

    public readonly errorCases: readonly IAiChatCase[] = [
        { name: 'С номером и повтором', messages: AI_CHAT_FAILED, error: AI_CHAT_ERROR },
        { name: 'Без номера, без повтора', messages: AI_CHAT_FAILED, error: { message: AI_CHAT_ERROR.message } },
    ];

    public readonly threadCases: readonly IAiChatCase[] = [
        { name: 'Беседы', messages: AI_CHAT_DONE, threads: AI_CHAT_THREADS },
        { name: 'Бесед нет', messages: [], threads: [] },
        { name: 'Загрузка', messages: [], threads: [], threadsLoading: true },
    ];

    public readonly longCases: readonly IAiChatCase[] = [
        { name: 'Длинная лента', messages: AI_CHAT_LONG },
        { name: 'Длинный вопрос в поле', messages: AI_CHAT_DONE, draft: AI_CHAT_LONG_DRAFT },
    ];

    public readonly caseLabel: (c: IAiChatCase) => string = (c: IAiChatCase): string => c.name;
}
