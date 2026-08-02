import { areObjectsEqual } from '../are-objects-equal/index.js';

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

    for (let i: number = 0; i < f.length; i++) {
        const valueF: T = f[i];
        const valueS: T = s[i];

        if (Array.isArray(valueF) && Array.isArray(valueS)) {
            if (!areArraysEqual(valueF, valueS)) {
                return false;
            }
        }

        if (typeof valueF === 'object' && valueF != null && typeof valueS === 'object' && valueS != null) {
            if (!areObjectsEqual(valueF, valueS)) {
                return false;
            }
        } else if (valueF !== valueS) {
            return false;
        }
    }

    return true;
}
