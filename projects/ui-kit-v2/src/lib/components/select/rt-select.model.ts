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

    /**
     * Что кит отдаёт своей разметке указателя. Три значения и не больше: большее привязало бы
     * разметку потребителя к устройству семьи, и семью стало бы не поправить, не сломав её.
     */
    export interface TriggerState<TValue> {
        /** Открыт ли список: по нему потребитель крутит шеврон. */
        readonly isOpen: boolean;
        /** Что выбрано. У выбора нескольких это все выбранные значения. */
        readonly value: TValue | null;
        /** Подпись выбранного — та же, что кит рисует в своём указателе. */
        readonly label: string;
        /** Отключён ли выбор. */
        readonly isDisabled: boolean;
    }

    /** Обстановка шаблона указателя: состояние приходит как `$implicit`. */
    export interface TriggerContext<TValue> {
        readonly $implicit: TriggerState<TValue>;
    }
}
