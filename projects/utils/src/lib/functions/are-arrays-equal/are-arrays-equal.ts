import { areObjectsEqual } from '../are-objects-equal/index.js';

/** Non-null object, arrays included: `areObjectsEqual` sorts out which of the two kinds it is. */
function isRecord(value: unknown): value is object {
    return typeof value === 'object' && value != null;
}

/**
 * Two elements read as identical: anything object-shaped goes structural, everything else is
 * compared by identity.
 */
function sameElement<T>(one: T, other: T): boolean {
    return isRecord(one) && isRecord(other) ? areObjectsEqual(one, other) : one === other;
}

/**
 * Indicates whether two arrays hold identical content at identical positions.
 *
 * Element comparison is deep: nested arrays recurse through this function and nested objects go to
 * `areObjectsEqual`. Anything else is compared with `!==`, so `NaN` never equals `NaN` and `0`
 * equals `-0`.
 *
 * A non-array argument is not an error — it yields `false`.
 *
 * @param f - first array
 * @param s - second array
 * @returns `true` when both arrays are the same length and every position matches
 *
 * @example
 * areArraysEqual([1, [2, 3]], [1, [2, 3]]); // true
 * areArraysEqual([{ a: 1 }], [{ a: 1 }]); // true — objects compared structurally
 * areArraysEqual([1, 2], [2, 1]); // false — order matters, see areArraysEqualUnordered
 */
export function areArraysEqual<T>(f: T[], s: T[]): boolean {
    if (!Array.isArray(f) || !Array.isArray(s)) {
        return false;
    }

    if (f.length !== s.length) {
        return false;
    }

    return f.every((valueF: T, index: number): boolean => sameElement(valueF, s[index]));
}
