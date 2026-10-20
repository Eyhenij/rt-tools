import { IRtOptionTree } from '@rt-tools/ui-kit-v2/core';

/**
 * Модель `<rt-select>`: один корневой неймспейс с префиксом `I`.
 * Generic-параметр `TValue` повторяет тип значения, который сидит в опциях.
 *
 * Опция и строка дерева объявлены в ядре: их раскладывают и деревья кита, а те не берут выбор из
 * списка. Здесь — те же типы под прежними именами.
 */
export namespace IRtSelect {
    /** Одна опция dropdown'а. */
    export type Option<TValue> = IRtOptionTree.Option<TValue>;

    /** Видимая строка дерева: опция, её уровень и то, ветка ли она и раскрыта ли. */
    export type Row<TValue> = IRtOptionTree.Row<TValue>;

    /** Сколько включённых листьев ветки выбрано: все, часть или ни одного. */
    export type TBranchState = IRtOptionTree.TBranchState;

    /** Что делать по боковой стрелке: какую ветку переключить и куда увести подсветку. */
    export type SideKeyAnswer<TValue> = IRtOptionTree.SideKeyAnswer<TValue>;

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
