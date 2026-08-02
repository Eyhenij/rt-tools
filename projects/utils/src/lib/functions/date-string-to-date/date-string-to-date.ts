import { isDate } from '../is-date/index.js';

const MAX_YEAR: number = 3000;

/**
 * Reads a `dd.MM.yyyy` string that may still be half-typed, repairing the gaps a masked input leaves
 * behind: a single-digit day or month, a `00` segment, a missing leading segment, an over-long one.
 *
 * Failure is **an Invalid Date**, the same way `parseDate` and `parseISO` report it — check the
 * result with `isDate`. A caller that wants today's date as the fallback writes it out:
 * `const value: Date = isDate(parsed) ? parsed : new Date();`
 *
 * @param date - the string to read, or a `Date` to pass through
 * @returns the parsed date, a copy of the `Date` given, or an Invalid Date
 *
 * @example
 * dateStringToDate('5.9.2024'); // 5 September 2024
 * dateStringToDate('..2024'); // a date in 2024, day and month defaulted
 * dateStringToDate('nonsense'); // Invalid Date
 */
export function dateStringToDate(date: string | Date): Date {
    if (date instanceof Date) {
        return new Date(date.getTime());
    }

    const firstItem: number = 1;
    const parsedDate: string = (date || '')
        .replace(/^(\d)/, '0$1')
        .replace(/\.(\d)\./, '.0$1.')
        .replace('..', '.01.')
        .replace(/^\./, '01.')
        .replace(/(\d{3})\./g, (str: string): string => str.slice(firstItem))
        .replace(/(\d{2}).(\d{2}).(\d{4})/, '$2/$1/$3')
        .replace(/00\//g, '01/');

    const dateValue: Date = new Date(parsedDate);

    if (!isDate(dateValue) || dateValue.getFullYear() > MAX_YEAR) {
        return new Date(NaN);
    }

    return dateValue;
}
