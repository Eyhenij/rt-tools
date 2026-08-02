/**
 * A two-argument comparison function of the shape `Array.prototype.sort` expects.
 */
export type ComparatorType<T> = (aa: T, bb: T) => number;

/**
 * Compares two values with the supplied comparator, handling nullish operands first.
 *
 * `null` and `undefined` sort **last** in ascending order: a nullish `a` yields `1`, a nullish `b`
 * yields `-1`, and two nullish operands are equal. The comparator only ever sees two present
 * values, so it does not have to defend against `null` itself.
 *
 * @param a - first value
 * @param b - second value
 * @param comparator - decides the order of two present values
 * @returns negative when `a` comes first, positive when `b` does, `0` when neither
 *
 * @example
 * [3, null, 1].sort((a, b) => safeCompare(a, b, (x, y) => x - y)); // [1, 3, null]
 */
export function safeCompare<T>(a: T, b: T, comparator: ComparatorType<T>): number {
    if (a == null) {
        if (b == null) {
            return 0;
        } else {
            return 1;
        }
    } else {
        if (b == null) {
            return -1;
        } else {
            return comparator(a, b);
        }
    }
}
