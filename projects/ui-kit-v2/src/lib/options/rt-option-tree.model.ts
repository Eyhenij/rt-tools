/**
 * Дерево вариантов выбора: общий вид опции и видимой строки для всех семей, что раскладывают
 * варианты деревом. Generic-параметр `TValue` повторяет тип значения, который сидит в опциях.
 */
export namespace IRtOptionTree {
    /** Одна опция. */
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
}
