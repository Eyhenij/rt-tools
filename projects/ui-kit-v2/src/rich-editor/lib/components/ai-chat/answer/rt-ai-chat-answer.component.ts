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

import { RT_KIT_LABELS, RtAiRunStatusComponent, RtIconButtonComponent, RtMarkdownTextComponent, TRtKitLabelMap } from '@rt-tools/ui-kit-v2';

import { RtAiChatCopyComponent } from '../copy/rt-ai-chat-copy.component';
import { IRtAiChat } from '../rt-ai-chat.model';

const BEM_BLOCK: string = 'rt-ai-chat-answer';

/**
 * Ответ ассистента в ленте `rt-ai-chat`: ход работы, текст в markdown, вложения приложения и строка
 * действий — копирование и оценка. Строка появляется, когда текст дописан.
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
        RtAiChatCopyComponent,
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

    /** Текст дописан: строка действий с копированием и оценкой. */
    protected readonly isWritten: Signal<boolean> = computed((): boolean => !!this.message().text && !this.message().streaming);

    public readonly message: InputSignal<IRtAiChat.Message> = input.required<IRtAiChat.Message>();

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
}
