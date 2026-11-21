import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { RtAiChatComponent } from '../../rt-ai-chat.component';
import { IRtAiChat } from '../../rt-ai-chat.model';
import { AI_CHAT_DONE, AI_CHAT_RATED, AI_CHAT_SUGGESTIONS, AI_CHAT_THREADS } from './ai-chat.fixture';

/** Какую из трёх историй токенов рисовать. */
export type TAiChatPropertiesPart = 'properties' | 'focus' | 'rowActions';

/** Ячейка: подпись, набор токенов на элементе чата и то, что приходит входами. */
interface IAiChatPropertiesCase {
    readonly name: string;

    /** Значение `data-cell` на `rt-ai-chat`: по нему правило обёртки ставит токены ячейки. */
    readonly cell: string;
    readonly messages: readonly IRtAiChat.Message[];
    readonly suggestions?: readonly string[];
    readonly threadsOpen?: boolean;
    readonly threadMenu?: boolean;
    readonly questionAuthor?: boolean;
    readonly draft?: string;
    readonly sending?: boolean;

    /** Ширина ящика панели, если она уже обычной боковой. */
    readonly width?: string;

    /** Признак состояния для аддона псевдосостояний: фокус поля и наведение на строки. */
    readonly state?: string;
}

const DRAFT: string = 'Compare with the same week last year';

/**
 * Токены вида `rt-ai-chat` для витрины.
 *
 * Токены ставятся так, как их ставит приложение: правилом на элементе `rt-ai-chat`, без селектора
 * внутреннего класса чата и его частей. Поэтому стили обёртки не инкапсулированы: правило обращается
 * к элементу чата, а не к узлам своего шаблона.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-properties',
    templateUrl: './test-ai-chat-properties.component.html',
    styleUrl: './test-ai-chat-properties.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,

        // components
        RtAiChatComponent,

        // showcase
        StoryRowComponent,
    ],
})
export class TestRtAiChatPropertiesComponent {
    public part: TAiChatPropertiesPart = 'properties';

    public readonly threads: readonly IRtAiChat.Thread[] = AI_CHAT_THREADS;

    public readonly propertyCases: readonly IAiChatPropertiesCase[] = [
        { name: 'по умолчанию', cell: 'default', messages: AI_CHAT_DONE },
        { name: 'шрифт и размеры', cell: 'font', messages: AI_CHAT_DONE },
        { name: 'шапка: высота и разделитель', cell: 'header', messages: AI_CHAT_DONE },
        { name: 'подсказки: ширина и скругление', cell: 'suggestions', messages: [], suggestions: AI_CHAT_SUGGESTIONS },
        { name: 'подсказки в узкой панели', cell: 'suggestions', messages: [], suggestions: AI_CHAT_SUGGESTIONS, width: '18rem' },
        { name: 'без подписи автора', cell: 'author', messages: AI_CHAT_DONE, questionAuthor: false },
        { name: 'фон панели и поля', cell: 'backgrounds', messages: AI_CHAT_DONE },
    ];

    public readonly focusCases: readonly IAiChatPropertiesCase[] = [
        { name: 'по умолчанию', cell: 'default', messages: AI_CHAT_RATED, draft: DRAFT, state: 'focus' },
        { name: 'основной цвет', cell: 'primary', messages: AI_CHAT_RATED, draft: DRAFT, state: 'focus' },
        { name: 'основной цвет, «Стоп»', cell: 'primary', messages: AI_CHAT_RATED, sending: true, state: 'focus' },
    ];

    public readonly rowActionCases: readonly IAiChatPropertiesCase[] = [
        { name: 'по умолчанию, меню', cell: 'default', messages: AI_CHAT_DONE, threadsOpen: true, threadMenu: true, state: 'rows' },
        { name: 'действия строки, меню', cell: 'rows', messages: AI_CHAT_DONE, threadsOpen: true, threadMenu: true, state: 'rows' },
        { name: 'действия строки, удаление', cell: 'rows', messages: AI_CHAT_DONE, threadsOpen: true, state: 'rows' },
    ];

    public readonly caseLabel: (value: IAiChatPropertiesCase) => string = (value: IAiChatPropertiesCase): string => value.name;
}
