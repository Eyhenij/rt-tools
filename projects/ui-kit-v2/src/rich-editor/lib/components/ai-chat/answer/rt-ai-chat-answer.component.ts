import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    model,
    ModelSignal,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import {
    RT_KIT_LABELS,
    RT_KIT_LOCALE,
    RT_KIT_TRANSLATOR,
    RtAiRunStatusComponent,
    RtIconButtonComponent,
    TRtKitLabelMap,
    TRtKitTranslator,
} from '@rt-tools/ui-kit-v2';

import { RtAiChatBlocksComponent } from '../blocks/rt-ai-chat-blocks.component';
import { blocksToPlainText, rtAiChatPointsWriter } from '../blocks/rt-ai-chat-blocks.logic';
import { RT_AI_CHAT_BLOCK_RENDERERS } from '../blocks/rt-ai-chat-blocks.providers';
import { RtAiChatCopyComponent } from '../copy/rt-ai-chat-copy.component';
import { IRtAiChat } from '../rt-ai-chat.model';

const BEM_BLOCK: string = 'rt-ai-chat-answer';

/**
 * Ответ ассистента в ленте `rt-ai-chat`: ход работы, блоки, вложения приложения и строка действий —
 * копирование и оценка. Строка появляется, когда у ответа есть блок и поток кончился; копирование —
 * когда у блоков есть текст.
 */
@Component({
    selector: 'rt-ai-chat-answer',
    templateUrl: './rt-ai-chat-answer.component.html',
    styleUrl: './rt-ai-chat-answer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtAiChatBlocksComponent,
        RtAiChatCopyComponent,
        RtAiRunStatusComponent,
        RtIconButtonComponent,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'article',
        '[attr.data-id]': 'message().id',
    },
})
export class RtAiChatAnswerComponent {
    readonly #renderers: readonly IRtAiChat.BlockRenderer[] = inject(RT_AI_CHAT_BLOCK_RENDERERS, { optional: true }) ?? [];
    readonly #locale: Signal<string> = inject(RT_KIT_LOCALE);
    readonly #translate: Signal<TRtKitTranslator> = inject(RT_KIT_TRANSLATOR);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /** Ответ дописан: есть хотя бы один блок, и поток кончился — строка действий с копированием и оценкой. */
    protected readonly isWritten: Signal<boolean> = computed((): boolean => this.message().blocks.length > 0 && !this.message().streaming);

    /**
     * Что копирует кнопка: видимый текст блоков без знаков разметки — без хода работы и вложений.
     * Значения таблиц и карточек KPI записаны в языке кита на минуту копии: язык и подписи читаются здесь же.
     */
    protected readonly plainText: Signal<string> = computed((): string =>
        blocksToPlainText(
            this.message().blocks,
            this.#renderers,
            this.#locale(),
            rtAiChatPointsWriter(this.#translate()),
            this.t().aiSources
        )
    );

    /** Кнопка копирования видна, когда её не выключили и у блоков есть текст: пустая копия обманула бы. */
    protected readonly canCopy: Signal<boolean> = computed((): boolean => this.copyable() && this.plainText().length > 0);

    public readonly message: InputSignal<IRtAiChat.AssistantMessage> = input.required<IRtAiChat.AssistantMessage>();

    /** Шаблон вложений ответа; `null` — вложений нет. */
    public readonly extra: InputSignal<TemplateRef<IRtAiChat.ExtraContext> | null> = input<TemplateRef<IRtAiChat.ExtraContext> | null>(
        null
    );

    /** Кнопка копирования текста первой в строке действий. */
    public readonly copyable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Шаги хода работы раскрыты. */
    public readonly expanded: ModelSignal<boolean> = model<boolean>(false);

    /** Нажата оценка; повторное нажатие той же снимает её — решает родитель. */
    public readonly feedbackChange: OutputEmitterRef<Exclude<IRtAiChat.Feedback, null>> = output<Exclude<IRtAiChat.Feedback, null>>();

    /** Нажата кнопка карточки ссылки в этом ответе. */
    public readonly linkOpen: OutputEmitterRef<IRtAiChat.LinkPress> = output<IRtAiChat.LinkPress>();

    /** Нажат источник с адресом в этом ответе. */
    public readonly sourceOpen: OutputEmitterRef<IRtAiChat.SourcePress> = output<IRtAiChat.SourcePress>();
}
