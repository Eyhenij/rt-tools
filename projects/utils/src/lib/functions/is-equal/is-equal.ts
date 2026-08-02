/**
 * Indicates whether two values serialise to the same multiset of characters.
 *
 * The comparison is `JSON.stringify` on both sides, then a character-level sort. That makes it
 * insensitive to key order — its purpose — but also blind in ways a structural comparison is not:
 * `{ ab: 1 }` and `{ ba: 1 }` are reported equal, and any value `JSON.stringify` drops
 * (`undefined`, functions, symbols) or rejects (a cyclic object throws) behaves accordingly.
 *
 * Reach for `areObjectsEqual` when the comparison has to be structural.
 *
 * @param f - first value to compare
 * @param s - second value to compare
 * @returns `true` when both serialisations contain the same characters
 *
 * @example
 * isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }); // true — key order ignored
 * isEqual({ ab: 1 }, { ba: 1 }); // true — anagram collision
 */
export function isEqual<T>(f: T, s: T): boolean {
    const s1: string = JSON.stringify(f).split('').sort().join('');
    const s2: string = JSON.stringify(s).split('').sort().join('');
    return s1 === s2;
}
