/**
 * Модель `<rt-ai-prompt-input>`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtAiPromptInput {
    /** Отправка: текст вопроса и приложенные файлы. */
    export interface SubmitPayload {
        text: string;
        files: File[];
    }

    /** Где стоит подсказка: под полем или над ним. */
    export type HintPosition = 'below' | 'above';

    /** Кнопка строки действий, которую нажали: что она открывает, решает приложение. */
    export type Control = 'model' | 'effort' | 'mode';
}
