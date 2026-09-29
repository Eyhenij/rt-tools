/**
 * Модель `<rt-message-composer>`: один корневой неймспейс с
 * префиксом `I`.
 */
export namespace IRtMessageComposer {
    /** Полезная нагрузка отправки: текст сообщения + прикреплённые файлы. */
    export interface SubmitPayload {
        text: string;
        files: File[];
        /**
         * Rich-тело строкой JSON (при `formatting`-режиме) — взаимоисключимо с
         * непустым `text`. `null`/отсутствует ⇒ отправляется plain-текст.
         */
        delta?: string | null;
    }
}
