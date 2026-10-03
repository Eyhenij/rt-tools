import { inject, DestroyRef } from '@angular/core';

/** Пауза без ввода, после которой отрезок набора считается законченным. */
export const RT_CHAT_TYPING_PAUSE_MS: number = 3000;

/**
 * Текст поля ответа из узла, где случился ввод. Поле обычного режима — textarea, поле с
 * оформлением — редактируемый узел; всё прочее, например выбор файла, набором не считается и
 * даёт `null`.
 */
export function typingDraft(target: EventTarget | null): string | null {
    if (target instanceof HTMLTextAreaElement) {
        return target.value;
    }
    const editor: Element | null = target instanceof HTMLElement ? target.closest('[contenteditable="true"]') : null;
    return editor === null ? null : (editor.textContent ?? '');
}

/**
 * Отрезок набора: одно «начал» и одно «перестал» на отрезок, а не событие на каждую клавишу.
 * Отрезок кончается пустым полем, отправкой или паузой без ввода. Создаётся в контексте
 * внедрения: таймер паузы снимается вместе с компонентом, и выход уничтоженного компонента не
 * зовётся.
 */
export class RtChatTypingTracker {
    #typing: boolean = false;

    #timer: ReturnType<typeof setTimeout> | null = null;

    readonly #notify: (typing: boolean) => void;

    readonly #pauseMs: number;

    constructor(notify: (typing: boolean) => void, pauseMs: number = RT_CHAT_TYPING_PAUSE_MS) {
        this.#notify = notify;
        this.#pauseMs = pauseMs;
        inject(DestroyRef).onDestroy((): void => this.#clearTimer());
    }

    /** Ввод в поле ответа с его текущим текстом: пустой текст кончает отрезок. */
    public input(draft: string): void {
        if (draft.trim().length === 0) {
            this.stop();
            return;
        }
        if (!this.#typing) {
            this.#typing = true;
            this.#notify(true);
        }
        this.#clearTimer();
        this.#timer = setTimeout((): void => this.stop(), this.#pauseMs);
    }

    /** Конец отрезка; отрезок, который уже кончился, ничего не шлёт. */
    public stop(): void {
        this.#clearTimer();
        if (this.#typing) {
            this.#typing = false;
            this.#notify(false);
        }
    }

    #clearTimer(): void {
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    }
}
