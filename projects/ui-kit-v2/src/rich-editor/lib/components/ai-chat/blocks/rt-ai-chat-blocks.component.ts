import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RT_KIT_TRANSLATOR, RtKitLabelPipe, RtMarkdownTextComponent, RtMessageComponent, TRtKitTranslator } from '@rt-tools/ui-kit-v2';

import { IRtAiChat } from '../rt-ai-chat.model';
import { RtAiChatBlockCellDirective } from './rt-ai-chat-block-cell.directive';
import { toBlockViews } from './rt-ai-chat-blocks.logic';
import { RT_AI_CHAT_BLOCK_RENDERERS } from './rt-ai-chat-blocks.providers';
import { RtAiChatKpiComponent } from './kpi/rt-ai-chat-kpi.component';
import { RtAiChatLinkComponent } from './link/rt-ai-chat-link.component';
import { RtAiChatSectionComponent } from './section/rt-ai-chat-section.component';
import { RtAiChatTableComponent } from './table/rt-ai-chat-table.component';

const BEM_BLOCK: string = 'rt-ai-chat-blocks';

/**
 * Блоки ответа по порядку: `markdown` — текстом, `notice` — плашкой `rt-message`, `table` —
 * таблицей `rt-ai-chat-table`, `kpi` — карточками `rt-ai-chat-kpi`, `link` — карточкой страницы
 * `rt-ai-chat-link`, `section` — сеткой
 * `rt-ai-chat-section`, остальные — отрисовщиками, которые приложение зарегистрировало через
 * `provideRtAiChatBlock`. Блок без отрисовщика показан заглушкой с именем типа. Блок в ячейке
 * секции рисует тот же шаблон, что и блок ленты.
 */
@Component({
    selector: 'rt-ai-chat-blocks',
    templateUrl: './rt-ai-chat-blocks.component.html',
    styleUrl: './rt-ai-chat-blocks.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgComponentOutlet,
        NgTemplateOutlet,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtMarkdownTextComponent,
        RtMessageComponent,
        RtAiChatTableComponent,
        RtAiChatKpiComponent,
        RtAiChatLinkComponent,
        RtAiChatSectionComponent,
        RtAiChatBlockCellDirective,

        // pipes
        RtKitLabelPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiChatBlocksComponent {
    readonly #renderers: readonly IRtAiChat.BlockRenderer[] = inject(RT_AI_CHAT_BLOCK_RENDERERS, { optional: true }) ?? [];

    protected readonly translate: Signal<TRtKitTranslator> = inject(RT_KIT_TRANSLATOR);

    /** Что рисуется для каждого блока. */
    protected readonly views: Signal<readonly IRtAiChat.BlockView[]> = computed((): readonly IRtAiChat.BlockView[] =>
        toBlockViews(this.blocks(), this.#renderers)
    );

    public readonly blocks: InputSignal<readonly IRtAiChat.Block[]> = input<readonly IRtAiChat.Block[]>([]);

    /** Нажата кнопка карточки ссылки: адрес и нужна ли новая вкладка. */
    public readonly linkOpen: OutputEmitterRef<IRtAiChat.LinkPress> = output<IRtAiChat.LinkPress>();
}
