/**
 * Date formatting and parsing utilities (replacement for date-fns)
 *
 * Supported format tokens:
 * - yyyy: 4-digit year (2024)
 * - yy: 2-digit year (24)
 * - MM: 2-digit month (01-12)
 * - M: month (1-12)
 * - dd: 2-digit day (01-31)
 * - d: day (1-31)
 * - HH: 2-digit hour 24h (00-23)
 * - H: hour 24h (0-23)
 * - hh: 2-digit hour 12h (01-12)
 * - h: hour 12h (1-12)
 * - mm: 2-digit minutes (00-59)
 * - m: minutes (0-59)
 * - ss: 2-digit seconds (00-59)
 * - s: seconds (0-59)
 * - SSS: milliseconds (000-999)
 * - a: AM/PM
 * - EEEE: full weekday name (Monday)
 * - EEE: short weekday name (Mon)
 * - MMMM: full month name (January)
 * - MMM: short month name (Jan)
 */

const WEEKDAYS_SHORT: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG: string[] = [
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

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Pads a number with leading zeros
 */
function padStart(value: number, length: number): string {
    return String(value).padStart(length, '0');
}

/**
 * Checks if a value is a valid Date object
 */
export function isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Formats a Date object according to the specified format string
 *
 * @param date - The date to format
 * @param formatStr - The format string (e.g., 'dd.MM.yyyy', 'yyyy-MM-dd HH:mm:ss')
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date(2024, 0, 15), 'dd.MM.yyyy') // '15.01.2024'
 * formatDate(new Date(2024, 0, 15, 14, 30), 'yyyy-MM-dd HH:mm') // '2024-01-15 14:30'
 */
export function formatDate(date: Date, formatStr: string): string {
    if (!isDate(date)) {
        return '';
    }

    const year: number = date.getFullYear();
    const month: number = date.getMonth();
    const day: number = date.getDate();
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();
    const seconds: number = date.getSeconds();
    const milliseconds: number = date.getMilliseconds();
    const dayOfWeek: number = date.getDay();

    const hours12: number = hours % 12 || 12;
    const ampm: string = hours < 12 ? 'AM' : 'PM';

    // Use placeholders to avoid partial replacements
    const placeholders: Map<string, string> = new Map();
    let placeholderIndex: number = 0;

    const createPlaceholder: (value: string) => string = (value: string): string => {
        const placeholder: string = `\x00${placeholderIndex++}\x00`;
        placeholders.set(placeholder, value);
        return placeholder;
    };

    // Order matters: longer tokens must be replaced first
    // Use exact token matching to prevent partial replacements
    let result: string = formatStr;

    // Replace tokens with placeholders (longest first)
    result = result.replace(/yyyy/g, createPlaceholder(String(year)));
    result = result.replace(/yy/g, createPlaceholder(String(year).slice(-2)));
    result = result.replace(/MMMM/g, createPlaceholder(MONTHS_LONG[month]));
    result = result.replace(/MMM/g, createPlaceholder(MONTHS_SHORT[month]));
    result = result.replace(/MM/g, createPlaceholder(padStart(month + 1, 2)));
    result = result.replace(/M/g, createPlaceholder(String(month + 1)));
    result = result.replace(/EEEE/g, createPlaceholder(WEEKDAYS_LONG[dayOfWeek]));
    result = result.replace(/EEE/g, createPlaceholder(WEEKDAYS_SHORT[dayOfWeek]));
    result = result.replace(/dd/g, createPlaceholder(padStart(day, 2)));
    result = result.replace(/d/g, createPlaceholder(String(day)));
    result = result.replace(/HH/g, createPlaceholder(padStart(hours, 2)));
    result = result.replace(/H/g, createPlaceholder(String(hours)));
    result = result.replace(/hh/g, createPlaceholder(padStart(hours12, 2)));
    result = result.replace(/h/g, createPlaceholder(String(hours12)));
    result = result.replace(/mm/g, createPlaceholder(padStart(minutes, 2)));
    result = result.replace(/m/g, createPlaceholder(String(minutes)));
    result = result.replace(/SSS/g, createPlaceholder(padStart(milliseconds, 3)));
    result = result.replace(/ss/g, createPlaceholder(padStart(seconds, 2)));
    result = result.replace(/s/g, createPlaceholder(String(seconds)));
    result = result.replace(/a/g, createPlaceholder(ampm));

    // Replace placeholders with actual values
    for (const [placeholder, value] of placeholders) {
        result = result.replace(placeholder, value);
    }

    return result;
}

/**
 * Parses an ISO 8601 date string into a Date object
 *
 * @param dateString - ISO date string (e.g., '2024-01-15', '2024-01-15T14:30:00.000Z')
 * @returns Date object or Invalid Date if parsing fails
 *
 * @example
 * parseISO('2024-01-15') // Date object for Jan 15, 2024
 * parseISO('2024-01-15T14:30:00.000Z') // Date object with time
 */
export function parseISO(dateString: string): Date {
    if (!dateString || typeof dateString !== 'string') {
        return new Date(NaN);
    }

    const date: Date = new Date(dateString);
    return date;
}

interface TokenPattern {
    token: string;
    pattern: string;
    handler: (val: string) => void;
}

interface PlaceholderItem {
    placeholder: string;
    pattern: string;
    handler: (val: string) => void;
}

interface PositionedHandler {
    placeholder: string;
    handler: (val: string) => void;
    position: number;
}

/**
 * Parses a date string according to the specified format
 *
 * @param dateString - The date string to parse
 * @param formatStr - The format string describing the input
 * @param referenceDate - Reference date for missing parts (defaults to current date)
 * @returns Date object or Invalid Date if parsing fails
 *
 * @example
 * parseDate('15.01.2024', 'dd.MM.yyyy') // Date object for Jan 15, 2024
 * parseDate('2024/01/15 14:30', 'yyyy/MM/dd HH:mm') // Date with time
 */
export function parseDate(dateString: string, formatStr: string, referenceDate: Date = new Date()): Date {
    if (!dateString || typeof dateString !== 'string') {
        return new Date(NaN);
    }

    let year: number = referenceDate.getFullYear();
    let month: number = referenceDate.getMonth();
    let day: number = referenceDate.getDate();
    let hours: number = 0;
    let minutes: number = 0;
    let seconds: number = 0;
    let milliseconds: number = 0;
    let isPM: boolean = false;
    let hasAMPM: boolean = false;

    const tokenPatterns: TokenPattern[] = [
        {
            token: 'yyyy',
            pattern: '(\\d{4})',
            handler: (val: string): void => {
                year = parseInt(val, 10);
            },
        },
        {
            token: 'yy',
            pattern: '(\\d{2})',
            handler: (val: string): void => {
                const parsed: number = parseInt(val, 10);
                year = parsed >= 70 ? 1900 + parsed : 2000 + parsed;
            },
        },
        {
            token: 'MMMM',
            pattern: `(${MONTHS_LONG.join('|')})`,
            handler: (val: string): void => {
                month = MONTHS_LONG.findIndex((m: string) => m.toLowerCase() === val.toLowerCase());
            },
        },
        {
            token: 'MMM',
            pattern: `(${MONTHS_SHORT.join('|')})`,
            handler: (val: string): void => {
                month = MONTHS_SHORT.findIndex((m: string) => m.toLowerCase() === val.toLowerCase());
            },
        },
        {
            token: 'MM',
            pattern: '(\\d{2})',
            handler: (val: string): void => {
                month = parseInt(val, 10) - 1;
            },
        },
        {
            token: 'M',
            pattern: '(\\d{1,2})',
            handler: (val: string): void => {
                month = parseInt(val, 10) - 1;
            },
        },
        {
            token: 'dd',
            pattern: '(\\d{2})',
            handler: (val: string): void => {
                day = parseInt(val, 10);
            },
        },
        {
            token: 'd',
            pattern: '(\\d{1,2})',
            handler: (val: string): void => {
                day = parseInt(val, 10);
            },
        },
        {
            token: 'HH',
            pattern: '(\\d{2})',
            handler: (val: string): void => {
                hours = parseInt(val, 10);
            },
        },
        {
            token: 'H',
            pattern: '(\\d{1,2})',
            handler: (val: string): void => {
                hours = parseInt(val, 10);
            },
        },
        {
            token: 'hh',
            pattern: '(\\d{2})',
            handler: (val: string): void => {
                hours = parseInt(val, 10);
            },
        },
        {
            token: 'h',
            pattern: '(\\d{1,2})',
            handler: (val: string): void => {
                hours = parseInt(val, 10);
            },
        },
        {
            token: 'mm',
            pattern: '(\\d{2})',
            handler: (val: string): void => {
                minutes = parseInt(val, 10);
            },
        },
        {
            token: 'm',
            pattern: '(\\d{1,2})',
            handler: (val: string): void => {
                minutes = parseInt(val, 10);
            },
        },
        {
            token: 'SSS',
            pattern: '(\\d{3})',
            handler: (val: string): void => {
                milliseconds = parseInt(val, 10);
            },
        },
        {
            token: 'ss',
            pattern: '(\\d{2})',
            handler: (val: string): void => {
                seconds = parseInt(val, 10);
            },
        },
        {
            token: 's',
            pattern: '(\\d{1,2})',
            handler: (val: string): void => {
                seconds = parseInt(val, 10);
            },
        },
        {
            token: 'a',
            pattern: '(AM|PM|am|pm)',
            handler: (val: string): void => {
                hasAMPM = true;
                isPM = val.toUpperCase() === 'PM';
            },
        },
    ];

    // Sort by token length (longer first) to avoid partial matches
    const sortedPatterns: TokenPattern[] = [...tokenPatterns].sort((a: TokenPattern, b: TokenPattern) => b.token.length - a.token.length);

    // Build regex from format string using placeholders to avoid double-replacement
    // First, replace all tokens in the original format string with placeholders
    let workingFormat: string = formatStr;
    const placeholderList: PlaceholderItem[] = [];
    let placeholderIndex: number = 0;

    for (const { token, pattern, handler } of sortedPatterns) {
        if (workingFormat.includes(token)) {
            const placeholder: string = `\x00${placeholderIndex++}\x00`;
            workingFormat = workingFormat.split(token).join(placeholder);
            placeholderList.push({ placeholder, pattern, handler });
        }
    }

    // Now escape the remaining literal characters
    let regexStr: string = escapeRegExp(workingFormat);

    // Replace placeholders with actual regex patterns
    for (const { placeholder, pattern } of placeholderList) {
        regexStr = regexStr.replace(escapeRegExp(placeholder), pattern);
    }

    // Sort handlers by their placeholder position in the original working format
    // to match capture group order (left-to-right in the regex)
    const sortedByPosition: PositionedHandler[] = placeholderList
        .map(
            (item: PlaceholderItem): PositionedHandler => ({
                placeholder: item.placeholder,
                handler: item.handler,
                position: escapeRegExp(workingFormat).indexOf(escapeRegExp(item.placeholder)),
            })
        )
        .sort((a: PositionedHandler, b: PositionedHandler) => a.position - b.position);

    const handlers: ((val: string) => void)[] = sortedByPosition.map((item: PositionedHandler) => item.handler);

    const regex: RegExp = new RegExp(`^${regexStr}$`, 'i');
    const match: RegExpMatchArray | null = dateString.match(regex);

    if (!match) {
        return new Date(NaN);
    }

    // Apply handlers in order
    for (let i: number = 0; i < handlers.length; i++) {
        if (match[i + 1]) {
            handlers[i](match[i + 1]);
        }
    }

    // Apply AM/PM adjustment after all handlers
    if (hasAMPM) {
        if (isPM && hours < 12) {
            hours += 12;
        } else if (!isPM && hours === 12) {
            hours = 0;
        }
    }

    return new Date(year, month, day, hours, minutes, seconds, milliseconds);
}
