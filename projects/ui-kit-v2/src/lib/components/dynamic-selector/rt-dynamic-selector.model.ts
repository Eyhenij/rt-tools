/**
 * Модель `rt-dynamic-selector`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtDynamicSelector {
    /** Состояние флажка «Выбрать всё» по видимым пунктам. */
    export type SelectAllState = 'none' | 'some' | 'all';

    /** Как выбирает всплывающий список: один пункт переключателем или несколько флажками. */
    export type Mode = 'single' | 'multi';

    /** Строки всплывающего выбора: отмеченные раньше над разделителем и найденные под ним. */
    export interface PopupRows<T> {
        readonly ticked: ReadonlyArray<T>;
        readonly found: ReadonlyArray<T>;
    }

    /** Правка строки поля списка строк: прежнее значение и новое. */
    export interface TextEdit {
        readonly previous: string;
        readonly next: string;
    }
}
