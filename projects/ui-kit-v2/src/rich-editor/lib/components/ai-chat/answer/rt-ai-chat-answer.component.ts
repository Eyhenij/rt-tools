import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    model,
    ModelSignal,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtAiRunStatusComponent, RtIconButtonComponent, RtMarkdownTextComponent, TRtKitLabelMap } from '@rt-tools/ui-kit-v2';

import { IRtAiChat } from '../rt-ai-chat.model';

const BEM_BLOCK: string = 'rt-ai-chat-answer';

/**
 * Ответ ассистента в ленте `rt-ai-chat`: ход работы, текст в markdown, вложения приложения и оценка.
 * Оценка появляется, когда текст дописан.
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
        RtAiRunStatusComponent,
        RtIconButtonComponent,
        RtMarkdownTextComponent,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'article',
        '[attr.data-id]': 'message().id',
    },
})
export class RtAiChatAnswerComponent {
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly isRated: Signal<boolean> = computed((): boolean => !!this.message().text && !this.message().streaming);

    public readonly message: InputSignal<IRtAiChat.Message> = input.required<IRtAiChat.Message>();

    /** Шаблон вложений ответа; `null` — вложений нет. */
    public readonly extra: InputSignal<TemplateRef<IRtAiChat.ExtraContext> | null> = input<TemplateRef<IRtAiChat.ExtraContext> | null>(
        null
    );

    /** Шаги хода работы раскрыты. */
    public readonly expanded: ModelSignal<boolean> = model<boolean>(false);

    /** Нажата оценка; повторное нажатие той же снимает её — решает родитель. */
    public readonly feedbackChange: OutputEmitterRef<Exclude<IRtAiChat.Feedback, null>> = output<Exclude<IRtAiChat.Feedback, null>>();
}
