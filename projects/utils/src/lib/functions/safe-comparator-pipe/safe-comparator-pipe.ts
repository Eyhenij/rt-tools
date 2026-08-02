/**
 * Runs a chain of comparisons and returns the first decisive one.
 *
 * Each comparator is a **thunk** — it already closes over the two values being compared — which is
 * what lets the chain mix comparisons over different fields. Evaluation is lazy and left-to-right:
 * as soon as one returns a non-zero result the rest are not called. An empty chain returns `0`.
 *
 * @param comparators - comparisons to try, in priority order
 * @returns the first non-zero result, or `0` when every comparison ties
 *
 * @example
 * rows.sort((a, b) =>
 *     safeComparatorPipe(
 *         () => safeStrCompare(a.lastName, b.lastName),
 *         () => safeStrCompare(a.firstName, b.firstName),
 *         () => safeNumCompare(a.age, b.age)
 *     )
 * );
 */
export function safeComparatorPipe(...comparators: Array<() => number>): number {
    let result: number = 0;

    for (let i: number = 0, len: number = comparators.length; i < len; i++) {
        result = comparators[i]();

        if (result !== 0) {
            break;
        }
    }

    return result;
}
