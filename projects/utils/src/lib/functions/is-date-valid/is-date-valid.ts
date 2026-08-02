import { isDate } from '../is-date/index.js';

/**
 * Indicates whether an optional value is a `Date` holding a real instant.
 *
 * Exactly [`isDate`](../is-date/index.js) with a narrower parameter type. It exists because callers
 * hold an `Date | undefined` and reads better at those sites; new code can use either, and `isDate`
 * is the more general of the two.
 *
 * @param date - the date to test, if there is one
 * @returns `true` for a valid `Date`, `false` for an Invalid Date and for nothing at all
 *
 * @example
 * isDateValid(new Date(2024, 0, 15)); // true
 * isDateValid(new Date(0)); // true — the Unix epoch is a real instant
 * isDateValid(new Date('nonsense')); // false
 * isDateValid(); // false
 */
export function isDateValid(date?: Date): boolean {
    return isDate(date);
}
