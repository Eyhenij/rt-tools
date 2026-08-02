/**
 * Returns today's date with the time zeroed to local midnight.
 *
 * Useful as the lower bound of a "from today" range, or as the reference point for day-level
 * comparisons where the clock time would otherwise interfere. The result is in the **local** time
 * zone, not UTC.
 *
 * @returns a fresh `Date` at 00:00:00.000 local time today
 *
 * @example
 * const from: Date = initToday(); // e.g. 2026-08-02T00:00:00.000 local
 */
export function initToday(): Date {
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);

    return today;
}
