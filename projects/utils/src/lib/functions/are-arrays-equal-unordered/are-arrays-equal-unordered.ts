import { areObjectsEqual } from '../are-objects-equal/index.js';

/**
 * Indicates whether two arrays hold the same elements regardless of order.
 *
 * Each element of the first array is matched against an as-yet-unused element of the second, so
 * duplicates are counted rather than collapsed: `[1, 1, 2]` and `[1, 2, 2]` are not equal. Nested
 * arrays recurse through this function (their contents are order-insensitive too) and nested
 * objects go to `areObjectsEqual`.
 *
 * Matching is greedy and first-fit, which is exact for the primitive and plain-object values this
 * helper is meant for.
 *
 * @param f - first array
 * @param s - second array
 * @returns `true` when the arrays are the same length and every element finds a distinct partner
 *
 * @example
 * areArraysEqualUnordered([1, 2, 3], [3, 1, 2]); // true
 * areArraysEqualUnordered([{ a: 1 }, 2], [2, { a: 1 }]); // true
 * areArraysEqualUnordered([1, 1], [1, 2]); // false — duplicates are counted
 */
export function areArraysEqualUnordered<T>(f: T[], s: T[]): boolean {
    if (!Array.isArray(f) || !Array.isArray(s)) {
        return false;
    }

    if (f.length !== s.length) {
        return false;
    }

    const used: boolean[] = new Array<boolean>(s.length).fill(false);

    for (const valueF of f) {
        let found: boolean = false;

        for (let i: number = 0; i < s.length; i++) {
            if (used[i]) {
                continue;
            }

            const valueS: T = s[i];

            if (Array.isArray(valueF) && Array.isArray(valueS)) {
                if (areArraysEqualUnordered(valueF, valueS)) {
                    used[i] = true;
                    found = true;
                    break;
                }
            } else if (typeof valueF === 'object' && valueF != null && typeof valueS === 'object' && valueS != null) {
                if (areObjectsEqual(valueF, valueS)) {
                    used[i] = true;
                    found = true;
                    break;
                }
            } else if (valueF === valueS) {
                used[i] = true;
                found = true;
                break;
            }
        }

        if (!found) {
            return false;
        }
    }

    return true;
}
