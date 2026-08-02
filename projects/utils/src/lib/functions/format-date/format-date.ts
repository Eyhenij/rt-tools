import { MONTHS_LONG, MONTHS_SHORT, WEEKDAYS_LONG, WEEKDAYS_SHORT } from '../internal/date-locale.js';
import { isDate } from '../is-date/index.js';

/**
 * Pads a number with leading zeros
 */
function padStart(value: number, length: number): string {
    return String(value).padStart(length, '0');
}

/**
 * Formats a `Date` according to a format string.
 *
 * Supported tokens:
 * - `yyyy` 4-digit year, `yy` 2-digit year
 * - `MMMM` full month name, `MMM` short month name, `MM` 2-digit month, `M` month
 * - `EEEE` full weekday name, `EEE` short weekday name
 * - `dd` 2-digit day, `d` day
 * - `HH`/`H` hour 24h, `hh`/`h` hour 12h, `a` AM/PM
 * - `mm`/`m` minutes, `ss`/`s` seconds, `SSS` milliseconds
 *
 * Tokens are substituted through placeholders (longest first), so an already-substituted value can
 * never be re-matched by a shorter token.
 *
 * @param date - the date to format
 * @param formatStr - the format string (e.g. `'dd.MM.yyyy'`, `'yyyy-MM-dd HH:mm:ss'`)
 * @returns the formatted string, or `''` when `date` is not a valid `Date`
 *
 * @example
 * formatDate(new Date(2024, 0, 15), 'dd.MM.yyyy'); // '15.01.2024'
 * formatDate(new Date(2024, 0, 15, 14, 30), 'yyyy-MM-dd HH:mm'); // '2024-01-15 14:30'
 */
export function formatDate(date: Date, formatStr: string): string {
    if (!isDate(date)) {
        return '';
    }

    const year: number = date.getFullYear();
    const month: number = date.getMonth();
    const day: number = date.getDate();
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();
    const seconds: number = date.getSeconds();
    const milliseconds: number = date.getMilliseconds();
    const dayOfWeek: number = date.getDay();

    const hours12: number = hours % 12 || 12;
    const ampm: string = hours < 12 ? 'AM' : 'PM';

    // Use placeholders to avoid partial replacements
    const placeholders: Map<string, string> = new Map();
    let placeholderIndex: number = 0;

    const createPlaceholder: (value: string) => string = (value: string): string => {
        const placeholder: string = `\x00${placeholderIndex++}\x00`;
        placeholders.set(placeholder, value);
        return placeholder;
    };

    // Order matters: longer tokens must be replaced first
    // Use exact token matching to prevent partial replacements
    let result: string = formatStr;

    // Replace tokens with placeholders (longest first)
    result = result.replace(/yyyy/g, createPlaceholder(String(year)));
    result = result.replace(/yy/g, createPlaceholder(String(year).slice(-2)));
    result = result.replace(/MMMM/g, createPlaceholder(MONTHS_LONG[month]));
    result = result.replace(/MMM/g, createPlaceholder(MONTHS_SHORT[month]));
    result = result.replace(/MM/g, createPlaceholder(padStart(month + 1, 2)));
    result = result.replace(/M/g, createPlaceholder(String(month + 1)));
    result = result.replace(/EEEE/g, createPlaceholder(WEEKDAYS_LONG[dayOfWeek]));
    result = result.replace(/EEE/g, createPlaceholder(WEEKDAYS_SHORT[dayOfWeek]));
    result = result.replace(/dd/g, createPlaceholder(padStart(day, 2)));
    result = result.replace(/d/g, createPlaceholder(String(day)));
    result = result.replace(/HH/g, createPlaceholder(padStart(hours, 2)));
    result = result.replace(/H/g, createPlaceholder(String(hours)));
    result = result.replace(/hh/g, createPlaceholder(padStart(hours12, 2)));
    result = result.replace(/h/g, createPlaceholder(String(hours12)));
    result = result.replace(/mm/g, createPlaceholder(padStart(minutes, 2)));
    result = result.replace(/m/g, createPlaceholder(String(minutes)));
    result = result.replace(/SSS/g, createPlaceholder(padStart(milliseconds, 3)));
    result = result.replace(/ss/g, createPlaceholder(padStart(seconds, 2)));
    result = result.replace(/s/g, createPlaceholder(String(seconds)));
    result = result.replace(/a/g, createPlaceholder(ampm));

    // Replace placeholders with actual values
    for (const [placeholder, value] of placeholders) {
        result = result.replace(placeholder, value);
    }

    return result;
}
