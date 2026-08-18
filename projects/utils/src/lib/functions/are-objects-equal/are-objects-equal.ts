import { areArraysEqual } from '../are-arrays-equal/index.js';

/** Non-null object — the only kind this function compares key by key. */
function isRecord(value: unknown): value is object {
    return typeof value === 'object' && value != null;
}

/** An array against a non-array: different kinds of value, nothing to compare. */
function kindsDiffer(f: unknown, s: unknown): boolean {
    return Array.isArray(f) !== Array.isArray(s);
}

/**
 * Indicates whether two values are structurally equal.
 *
 * Identical references short-circuit to `true`. Two arrays are delegated to `areArraysEqual`; two
 * non-null objects are compared by key count and then key by key, recursing. Anything else — two
 * primitives included — yields `false`, so `areObjectsEqual(1, 1)` is `false`: this function
 * answers a question about objects, not a general equality question.
 *
 * An array is never equal to a non-array: `[1]` and `{ 0: 1 }` are different kinds of value even
 * though their keys and values line up.
 *
 * @param f - first value
 * @param s - second value
 * @returns `true` when both are the same reference, or objects with equal structure
 *
 * @example
 * areObjectsEqual({ a: { b: 1 } }, { a: { b: 1 } }); // true
 * areObjectsEqual({ a: 1 }, { a: 1, b: 2 }); // false — key counts differ
 * areObjectsEqual([1], { 0: 1 }); // false — an array is not a plain object
 * areObjectsEqual(1, 2); // false — primitives are not objects
 */
export function areObjectsEqual<T>(f: T, s: T): boolean {
    /** If it's just the same object - no need to compare */
    if (f === s) {
        return true;
    }

    if (kindsDiffer(f, s)) {
        return false;
    }

    if (Array.isArray(f) && Array.isArray(s)) {
        return areArraysEqual(f, s);
    }

    /** If one of the objects is null or undefined - no need to compare */
    if (!isRecord(f) || !isRecord(s)) {
        return false;
    }

    if (Object.keys(f).length !== Object.keys(s).length) {
        return false;
    }

    for (const key in f) {
        if (!areObjectsEqual(f[key], s[key])) {
            return false;
        }
    }

    return true;
}
