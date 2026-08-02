/**
 * Parses an ISO 8601 date string into a `Date`.
 *
 * A thin, total wrapper over the `Date` constructor: it never throws and returns an Invalid Date
 * for input the runtime cannot parse, so the caller checks the result rather than catching.
 *
 * @param dateString - ISO date string (e.g. `'2024-01-15'`, `'2024-01-15T14:30:00.000Z'`)
 * @returns a `Date`, or an Invalid Date when parsing fails
 *
 * @example
 * parseISO('2024-01-15'); // Date for Jan 15, 2024 (UTC midnight)
 * parseISO('2024-01-15T14:30:00.000Z'); // Date with time
 * parseISO(''); // Invalid Date
 */
export function parseISO(dateString: string): Date {
    if (!dateString || typeof dateString !== 'string') {
        return new Date(NaN);
    }

    const date: Date = new Date(dateString);
    return date;
}
