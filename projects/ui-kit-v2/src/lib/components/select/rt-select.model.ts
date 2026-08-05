/**
 * Модель `<rt-select>`: один корневой неймспейс с префиксом `I`.
 * Generic-параметр `TValue` повторяет тип значения, который сидит в опциях.
 */
export namespace IRtSelect {
    /** Одна опция dropdown'а. */
    export interface Option<TValue> {
        label: string;
        value: TValue;
        disabled?: boolean;
    }
}
