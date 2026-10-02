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
        /** Дети опции того же вида. Хотя бы одна опция с детьми делает список деревом. */
        children?: ReadonlyArray<Option<TValue>>;
    }

    /** Видимая строка дерева: опция, её уровень и то, ветка ли она и раскрыта ли. */
    export interface Row<TValue> {
        readonly option: Option<TValue>;
        readonly level: number;
        readonly branch: boolean;
        readonly open: boolean;
        readonly parent: TValue | null;
    }

    /** Сколько включённых листьев ветки выбрано: все, часть или ни одного. */
    export type TBranchState = 'all' | 'some' | 'none';

    /** Что делать по боковой стрелке: какую ветку переключить и куда увести подсветку. */
    export interface SideKeyAnswer<TValue> {
        readonly toggle: TValue | null;
        readonly index: number;
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
