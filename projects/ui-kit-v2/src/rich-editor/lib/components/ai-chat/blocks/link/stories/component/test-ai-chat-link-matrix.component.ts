import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../../../showcase/story-themes.component';
import { rtLinkData } from '../../../../../../../../lib/util/link-data';
import { IRtAiChat } from '../../../../rt-ai-chat.model';
import { RtAiChatComponent } from '../../../../rt-ai-chat.component';
import { RtAiChatBlocksComponent } from '../../../rt-ai-chat-blocks.component';
import {
    AI_CHAT_LINK_INVALID_CASES,
    AI_CHAT_LINK_LONG_LABEL_CASES,
    AI_CHAT_LINK_MESSAGES,
    AI_CHAT_LINK_PARTS_CASES,
    AI_CHAT_LINK_REFUSAL,
    AI_CHAT_LINK_REFUSES,
    AI_CHAT_LINK_RTL_CASES,
    AI_CHAT_LINK_STATE_CASES,
    AI_CHAT_LINK_THEME_CASES,
    AI_CHAT_LINK_WIDTH_CASES,
    IAiChatLinkCase,
} from './ai-chat-link.fixture';
import { TestRtAiChatLinkLongLabelsComponent } from './test-ai-chat-link-long-labels.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAiChatLinkMatrixPart =
    'widths' | 'states' | 'parts' | 'longLabels' | 'invalid' | 'rtl' | 'panel' | 'fullScreen' | 'presets' | 'themes';

/** Исход, который приложение дописывает блоку ссылки. */
type TOutcome = Pick<IRtAiChat.LinkBlock, 'state' | 'reason'>;

function isSection(block: IRtAiChat.Block): block is IRtAiChat.SectionBlock {
    return block.type === 'section' && Array.isArray(block.blocks);
}

/**
 * Блок с исходом, если это карточка страницы из события. Событие несёт адрес без пробелов по
 * краям, поэтому адрес блока читается так же, как его читает карточка, — через `rtLinkData`.
 */
function settled(block: IRtAiChat.NestedBlock, url: string, outcome: TOutcome): IRtAiChat.NestedBlock {
    return block.type === 'link' && rtLinkData(block)?.url === url ? { ...block, ...outcome } : block;
}

/** Сколько длится «открытие страницы» в истории чата, мс. */
const OPENING_MS: number = 300;

/**
 * Матрицы карточки ссылки для витрины. Карточка рисуется через `rt-ai-chat-blocks` — тем же путём,
 * что в ответе. Истории панели и полного экрана рисуют весь `rt-ai-chat` и ведут круг целиком:
 * нажатие приходит событием `linkOpen`, обёртка ставит `pending`, затем `opened` или `failed` —
 * и карточке в секции тоже.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-chat-link-matrix',
    templateUrl: './test-ai-chat-link-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // Angular
        NgTemplateOutlet,

        // components
        RtAiChatBlocksComponent,
        RtAiChatComponent,
        TestRtAiChatLinkLongLabelsComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAiChatLinkMatrixComponent {
    /** Лента истории чата: её копию с новым исходом ставит обработчик `linkOpen`. */
    protected readonly messages: WritableSignal<readonly IRtAiChat.Message[]> = signal(AI_CHAT_LINK_MESSAGES);

    /** События `linkOpen`, как они пришли: история показывает их строками под чатом. */
    protected readonly log: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

    public part: TAiChatLinkMatrixPart = 'widths';

    public readonly widthCases: readonly IAiChatLinkCase[] = AI_CHAT_LINK_WIDTH_CASES;

    public readonly stateCases: readonly IAiChatLinkCase[] = AI_CHAT_LINK_STATE_CASES;

    public readonly partsCases: readonly IAiChatLinkCase[] = AI_CHAT_LINK_PARTS_CASES;

    public readonly longLabelCases: readonly IAiChatLinkCase[] = AI_CHAT_LINK_LONG_LABEL_CASES;

    public readonly invalidCases: readonly IAiChatLinkCase[] = AI_CHAT_LINK_INVALID_CASES;

    public readonly rtlCases: readonly IAiChatLinkCase[] = AI_CHAT_LINK_RTL_CASES;

    public readonly themeCases: readonly IAiChatLinkCase[] = AI_CHAT_LINK_THEME_CASES;

    public readonly caseLabel: (item: IAiChatLinkCase) => string = (item: IAiChatLinkCase): string => item.name;

    /**
     * То, что делает приложение: по событию ставит `pending`, открывает страницу и пишет исход.
     * Здесь страница «открывается» по таймеру, а вторая карточка получает отказ с причиной.
     */
    protected onLinkOpen(event: IRtAiChat.LinkOpen): void {
        this.log.update((lines: readonly string[]): readonly string[] => [...lines, JSON.stringify(event)]);
        this.#setState(event, { state: 'pending' });
        setTimeout((): void => {
            this.#setState(
                event,
                event.url === AI_CHAT_LINK_REFUSES ? { state: 'failed', reason: AI_CHAT_LINK_REFUSAL } : { state: 'opened' }
            );
        }, OPENING_MS);
    }

    #setState(event: IRtAiChat.LinkOpen, outcome: TOutcome): void {
        this.messages.update((messages: readonly IRtAiChat.Message[]): readonly IRtAiChat.Message[] =>
            messages.map((message: IRtAiChat.Message): IRtAiChat.Message =>
                message.role === 'assistant' && message.id === event.messageId
                    ? {
                          ...message,
                          blocks: message.blocks.map((block: IRtAiChat.Block): IRtAiChat.Block =>
                              isSection(block)
                                  ? {
                                        ...block,
                                        blocks: block.blocks.map((nested: IRtAiChat.NestedBlock): IRtAiChat.NestedBlock =>
                                            settled(nested, event.url, outcome)
                                        ),
                                    }
                                  : settled(block, event.url, outcome)
                          ),
                      }
                    : message
            )
        );
    }
}
