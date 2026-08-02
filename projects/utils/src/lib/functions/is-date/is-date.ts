/**
 * Checks if a value is a `Date` instance that holds a real point in time.
 *
 * Unlike a bare `instanceof Date`, this rejects an Invalid Date — the object `new Date('nonsense')`
 * returns, whose `getTime()` is `NaN`.
 *
 * @param value - the value to test
 * @returns `true` for a valid `Date`, `false` for everything else
 *
 * @example
 * isDate(new Date()); // true
 * isDate(new Date('nonsense')); // false
 * isDate('2024-01-15'); // false
 */
export function isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
}
