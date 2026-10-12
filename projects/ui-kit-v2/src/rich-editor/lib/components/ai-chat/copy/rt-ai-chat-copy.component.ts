import { Clipboard } from '@angular/cdk/clipboard';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    InputSignal,
    signal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { IRtIcon, RtIconButtonComponent, rtKitLabel } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-ai-chat-copy';

/** Сколько держать состояние «скопировано» перед сбросом значка и подписи — как у `rt-copy-value`. */
const RESET_DELAY_MS: number = 2000;

/**
 * Кнопка копирования текста сообщения `rt-ai-chat`: у вопроса под пузырём, у ответа первой в строке
 * оценки. После нажатия значок на две секунды меняется на галочку, подпись — на «Copied».
 */
@Component({
    selector: 'rt-ai-chat-copy',
    templateUrl: './rt-ai-chat-copy.component.html',
    styleUrl: './rt-ai-chat-copy.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconButtonComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiChatCopyComponent {
    readonly #clipboard: Clipboard = inject(Clipboard);

    #resetTimer: ReturnType<typeof setTimeout> | null = null;

    readonly #t_uiCopy: Signal<string> = rtKitLabel('uiCopy');
    readonly #t_uiCopied: Signal<string> = rtKitLabel('uiCopied');

    protected readonly copied: WritableSignal<boolean> = signal(false);

    protected readonly iconName: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => (this.copied() ? 'check' : 'copy'));

    protected readonly actionLabel: Signal<string> = computed((): string => (this.copied() ? this.#t_uiCopied() : this.#t_uiCopy()));

    /** Что уходит в буфер: у вопроса — его текст как есть, у ответа — видимый текст без знаков разметки. */
    public readonly text: InputSignal<string> = input.required<string>();

    constructor() {
        inject(DestroyRef).onDestroy((): void => this.#clearTimer());
    }

    protected onCopy(): void {
        this.#clipboard.copy(this.text());
        this.copied.set(true);

        this.#clearTimer();
        this.#resetTimer = setTimeout((): void => this.copied.set(false), RESET_DELAY_MS);
    }

    #clearTimer(): void {
        if (this.#resetTimer !== null) {
            clearTimeout(this.#resetTimer);
            this.#resetTimer = null;
        }
    }
}
