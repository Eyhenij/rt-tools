/** Быстрый вариант диапазона в панели поля. */
export enum ERtDateRangePreset {
    Today = 'today',
    Yesterday = 'yesterday',
    Last7 = 'last-7',
    Last30 = 'last-30',
    ThisMonth = 'this-month',
    LastMonth = 'last-month',
}

/** Контракт rt-date-range. */
export namespace IRtDateRange {
    /** Значение поля: первый и последний день периода `YYYY-MM-DD`, оба включены, `start <= end`. */
    export interface Value {
        start: string;
        end: string;
    }

    /** Быстрый вариант в панели: его диапазон и выключен ли он границами. */
    export interface PresetCell {
        preset: ERtDateRangePreset;
        range: Value;
        disabled: boolean;
    }

    /** Что месяц панели знает о черновике, наведении и границах. */
    export interface MonthContext {
        locale: string;
        today: string;
        start: string | null;
        end: string | null;
        /** День под указателем, пока выбрано только начало: до него рисуется будущий диапазон. */
        hover: string | null;
        min: string | null;
        max: string | null;
    }

    /** Форма числа дней по правилам множественного числа локали. */
    export type Plural = 'one' | 'few' | 'many' | 'other';
}
