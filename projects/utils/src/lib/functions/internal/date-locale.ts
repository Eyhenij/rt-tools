/**
 * English month and weekday names shared by `formatDate` (rendering `MMM`/`MMMM`/`EEE`/`EEEE`)
 * and `parseDate` (recognising `MMM`/`MMMM`).
 *
 * Internal: not re-exported from the package barrel. The package deliberately ships a single
 * hard-coded locale rather than depending on `Intl`, so both directions agree on the same
 * spelling and a formatted string round-trips back through the parser.
 */
export const WEEKDAYS_SHORT: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WEEKDAYS_LONG: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MONTHS_SHORT: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MONTHS_LONG: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
