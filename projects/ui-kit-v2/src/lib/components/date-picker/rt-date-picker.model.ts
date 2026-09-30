/** Контракт rt-date-picker. */
export namespace IRtDatePicker {
    /** Тип значения: дата, время или дата со временем. */
    export type Type = 'date' | 'datetime-local' | 'time';

    /** Часть даты в тексте поля. */
    export type DatePart = 'day' | 'month' | 'year';

    /** Как дата пишется в тексте поля по локали: порядок частей и знак между ними. */
    export interface TextLayout {
        order: readonly DatePart[];
        separator: string;
    }

    /** Буквы подсказки формы текста: `дд`, `мм`, `гггг`, `чч`, `мм` под русскими метками. */
    export interface ShapeLetters {
        day: string;
        month: string;
        year: string;
        hour: string;
        minute: string;
    }

    /** Ячейка колонки часов или минут. */
    export interface TimeCell {
        value: number;
        label: string;
        disabled: boolean;
    }

    /** Колонки времени панели. */
    export interface TimeColumns {
        hours: readonly TimeCell[];
        minutes: readonly TimeCell[];
    }

    /** Ячейка выбора месяца: `key` — `YYYY-MM`. */
    export interface MonthCell {
        key: string;
        label: string;
        disabled: boolean;
    }

    /** Момент, разобранный на день `YYYY-MM-DD` и время `HH:mm`. */
    export interface Moment {
        day: string;
        time: string;
    }

    /** Что месяц панели знает о выборе и границах. */
    export interface MonthContext {
        locale: string;
        today: string;
        chosen: string | null;
        min: string | null;
        max: string | null;
    }

    /** Что колонки времени знают о выбранном дне и границах. */
    export interface TimeContext {
        step: number;
        hour: number | null;
        day: string | null;
        min: string | null;
        max: string | null;
    }
}
