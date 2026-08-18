import { areObjectsEqual } from '../are-objects-equal/index.js';

/**
 * Two elements read as the same value: nested arrays stay order-insensitive, objects go structural,
 * everything else is compared by identity.
 */
function sameElement<T>(one: T, other: T): boolean {
    if (Array.isArray(one) && Array.isArray(other)) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define -- the two declarations recurse into each other, and function declarations are hoisted
        return areArraysEqualUnordered(one, other);
    }

    if (typeof one === 'object' && one != null && typeof other === 'object' && other != null) {
        return areObjectsEqual(one, other);
    }

    return one === other;
}

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

    const used: boolean[] = Array.from({ length: s.length }, (): boolean => false);

    return f.every((valueF: T): boolean => {
        const partner: number = s.findIndex((valueS: T, index: number): boolean => !used[index] && sameElement(valueF, valueS));

        if (partner === -1) {
            return false;
        }

        used[partner] = true;

        return true;
    });
}
