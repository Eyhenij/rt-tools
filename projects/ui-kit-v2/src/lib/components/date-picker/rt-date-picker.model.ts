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

    /** Части подсказки формы текста: `--`, `--`, `----`, `--`, `--` у маски пустого поля. */
    export interface ShapeLetters {
        day: string;
        month: string;
        year: string;
        hour: string;
        minute: string;
    }

    /** С какого времени барабан шторки начинает у поля без значения: с текущего или с `00:00`. */
    export type TimeStart = 'now' | 'midnight';

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

    /** Ячейка выбора года: `key` — `YYYY`. */
    export interface YearCell {
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
        /** Выбранная минута, которой колонка обязана иметь строку, даже когда она не на шаге. */
        minute?: number | null;
        day: string | null;
        min: string | null;
        max: string | null;
    }
}
