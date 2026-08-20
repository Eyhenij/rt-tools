/**
 * Two functions of structural comparison — in one module.
 *
 * They call each other: an array element that is an object goes to `areObjectsEqual`, and two
 * arrays inside an object go back to `areArraysEqual`. Kept in two modules, that recursion is a
 * cycle of imports: the bundler breaks it on its own and hands one of the two an unbuilt module.
 * Neither the build nor the linter says a word about it.
 */

/** Non-null object — arrays included where the caller sorts the two kinds out. */
function isRecord(value: unknown): value is object {
    return typeof value === 'object' && value != null;
}

/** An array against a non-array: different kinds of value, nothing to compare. */
function kindsDiffer(f: unknown, s: unknown): boolean {
    return Array.isArray(f) !== Array.isArray(s);
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

    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- сравнение элемента объявлено ниже: оно зовёт обе функции этого модуля
    return f.every((valueF: T, index: number): boolean => sameElement(valueF, s[index]));
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

/**
 * Two elements read as identical: anything object-shaped goes structural, everything else is
 * compared by identity.
 */
function sameElement<T>(one: T, other: T): boolean {
    return isRecord(one) && isRecord(other) ? areObjectsEqual(one, other) : one === other;
}
