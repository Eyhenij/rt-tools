import { safeCompare } from '../safe-compare/index.js';

/**
 * Compares two strings by locale collation, tolerating nullish operands.
 *
 * Ordering follows `String.prototype.localeCompare`, so it is accent- and case-aware in the way the
 * host locale defines — not a raw code-unit comparison. Nullish values sort last, as in
 * `safeCompare`.
 *
 * @param a - first string
 * @param b - second string
 * @returns negative when `a` comes first, positive when `b` does, `0` when they collate equal
 *
 * @example
 * ['banana', null, 'apple'].sort(safeStrCompare); // ['apple', 'banana', null]
 */
export function safeStrCompare(a: string, b: string): number {
    return safeCompare(a, b, () => a.localeCompare(b));
}
