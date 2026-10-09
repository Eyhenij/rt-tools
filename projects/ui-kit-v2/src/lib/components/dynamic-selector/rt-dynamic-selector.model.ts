/**
 * Модель `rt-dynamic-selector`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtDynamicSelector {
    /** Состояние флажка «Выбрать всё» по видимым пунктам. */
    export type SelectAllState = 'none' | 'some' | 'all';

    /** Как выбирает всплывающий список: один пункт переключателем или несколько флажками. */
    export type Mode = 'single' | 'multi';

    /** Регистр подписи кнопки: как есть, каждое слово с заглавной или вся заглавными. */
    export type LabelCase = 'none' | 'title' | 'upper';

    /** Строки всплывающего выбора: отмеченные раньше над разделителем и найденные под ним. */
    export interface PopupRows<T> {
        readonly ticked: ReadonlyArray<T>;
        readonly found: ReadonlyArray<T>;
    }

    /** Кусок подписи пункта: совпал ли он со словом поиска. */
    export interface MatchPart {
        readonly text: string;
        readonly matched: boolean;
    }

    /** Строка всплывающего выбора, готовая для разметки. */
    export interface PopupRow<T> {
        readonly entity: T;
        readonly key: unknown;
        readonly label: string;
        /** Подпись по кускам; без подсветки поиска — один кусок без отметки. */
        readonly parts: ReadonlyArray<MatchPart>;
        readonly ticked: boolean;
        /** Под строкой стоит разделитель. */
        readonly separated: boolean;
    }

    /** Строка списка выбранного, готовая для разметки. */
    export interface ListRow<T> {
        readonly item: T;
        readonly key: unknown;
        readonly label: string;
        /** Строку нельзя убрать из списка. */
        readonly locked: boolean;
    }

    /** Перенос строки списка выбранного: откуда и куда. */
    export interface Move {
        readonly from: number;
        readonly to: number;
    }

    /** Обстановка шаблона строки, который принёс вызывающий. */
    export interface RowContext<T> {
        readonly $implicit: T;
    }

    /** Правка строки поля списка строк: прежнее значение и новое. */
    export interface TextEdit {
        readonly previous: string;
        readonly next: string;
    }
}
