/**
 * Comparator that orders two objects chronologically by a date field.
 *
 * Each field value is handed to the `Date` constructor, so date strings, timestamps and `Date`
 * instances all work. An unparseable value produces `NaN`, and any comparison involving it returns
 * `NaN` — which `Array.prototype.sort` reads as "equal" and which will scramble the result.
 * Filter or normalise invalid dates before sorting.
 *
 * @param a - first object
 * @param b - second object
 * @param field - key of the date field to order by
 * @returns the millisecond difference, ascending (oldest first)
 *
 * @example
 * events.sort((a, b) => sortByDate(a, b, 'createdAt'));
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortByDate: (a: { [field: string]: any }, b: { [field: string]: any }, field: string) => number = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a: { [field: string]: any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    b: { [field: string]: any },
    field: string
) => new Date(a[field]).getTime() - new Date(b[field]).getTime();
