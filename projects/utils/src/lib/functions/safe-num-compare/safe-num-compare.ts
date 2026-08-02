import { safeCompare } from '../safe-compare/index.js';

/**
 * Compares two numbers ascending, tolerating nullish operands.
 *
 * The difference `a - b` is returned, so a `NaN` operand produces `NaN` — a value `sort` treats as
 * "equal" and which will scramble the order. Filter `NaN` out before sorting. Nullish values sort
 * last, as in `safeCompare`.
 *
 * @param a - first number
 * @param b - second number
 * @returns `a - b`, or the nullish ordering when either side is missing
 *
 * @example
 * [3, null, 1].sort(safeNumCompare); // [1, 3, null]
 */
export function safeNumCompare(a: number, b: number): number {
    return safeCompare(a, b, () => a - b);
}
