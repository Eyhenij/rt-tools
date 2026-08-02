/**
 * Comparator that orders two objects by a string field, case-insensitively.
 *
 * Only string values participate: if either side's field is missing, empty, or not a string, the
 * pair is reported as equal (`0`) and the surrounding sort leaves their relative order to the
 * engine. Comparison is a plain `<`/`>` on the lower-cased values, i.e. by code unit — not locale
 * collation. Use `safeStrCompare` when accents or locale rules matter.
 *
 * @param a - first object
 * @param b - second object
 * @param field - key of the string field to order by
 * @returns `-1`, `1`, or `0` when the pair is not comparable
 *
 * @example
 * users.sort((a, b) => sortByAlphabet(a, b, 'name'));
 */
export const sortByAlphabet: <T extends object>(a: T, b: T, field: keyof T) => number = <T extends object>(
    a: T,
    b: T,
    field: keyof T
): number => {
    if (a[field] && typeof a[field] === 'string' && b[field] && typeof b[field] === 'string') {
        if ((a[field] as string).toLowerCase() < (b[field] as string).toLowerCase()) {
            return -1;
        }
        if ((a[field] as string).toLowerCase() > (b[field] as string).toLowerCase()) {
            return 1;
        }
    }

    return 0;
};
