import { initToday } from '../init-today/index.js';

/**
 * Indicates whether a date falls on the current local calendar day.
 *
 * Compares day, month and year in the local time zone, so the clock time is irrelevant. Passing an
 * Invalid Date yields `false` (its parts are `NaN`, and `NaN !== NaN`); passing anything that is
 * not a `Date` will throw.
 *
 * @param date - the date to test
 * @returns `true` when `date` is on today's calendar day
 *
 * @example
 * isToday(new Date()); // true
 * isToday(new Date(2020, 0, 1)); // false
 */
export function isToday(date: Date): boolean {
    const today: Date = initToday();

    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}
