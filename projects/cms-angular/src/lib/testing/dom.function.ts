/** The node a test cannot go on without: a missing one fails the test with a reason instead of a cast. */
export function present<T>(value: T | null | undefined, what: string): T {
    if (value === null || value === undefined) {
        throw new Error(`The test expected ${what}`);
    }
    return value;
}
