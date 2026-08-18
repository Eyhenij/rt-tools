import { MONTHS_LONG, MONTHS_SHORT } from '../internal/date-locale.js';

interface ITokenPattern {
    token: string;
    pattern: string;
    handler: (val: string) => void;
}

interface IPlaceholderItem {
    placeholder: string;
    pattern: string;
    handler: (val: string) => void;
}

interface ILiteralItem {
    placeholder: string;
    literal: string;
}

interface IPositionedHandler {
    placeholder: string;
    handler: (val: string) => void;
    position: number;
}

/**
 * Feeds every capture group to the handler that asked for it — they stand in the same order.
 */
function applyHandlers(handlers: ((val: string) => void)[], match: RegExpExecArray): void {
    handlers.forEach((handler: (val: string) => void, index: number): void => {
        const captured: string | undefined = match[index + 1];

        /* istanbul ignore else -- @preserve: every token contributes exactly one mandatory capture
           group, so a pattern that matched always filled it. The guard stays as a safety net. */
        if (captured) {
            handler(captured);
        }
    });
}

/**
 * Hour of a 12-hour clock read on the 24-hour scale.
 *
 * Noon and the hour before it are the two the shift does not touch: `12 PM` already is the hour it
 * names, and `12 AM` is midnight.
 */
function hoursOn24Scale(hours: number, isPM: boolean = false): number {
    if (isPM && hours < 12) {
        return hours + 12;
    }

    if (!isPM && hours === 12) {
        return 0;
    }

    return hours;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parses a date string according to a format string.
 *
 * The format is turned into an anchored, case-insensitive regular expression, so the whole input
 * must match: trailing or leading junk yields an Invalid Date rather than a partial parse. Parts
 * the format does not mention are taken from `referenceDate` for the date components and default
 * to zero for the time components.
 *
 * Literal text goes in single quotes, exactly as in `formatDate` — `"'Issued on' dd.MM.yyyy"` reads
 * back what that format wrote. Two quotes in a row (`''`) mean one apostrophe.
 *
 * @param dateString - the string to parse
 * @param formatStr - the format describing the input (same tokens as `formatDate`)
 * @param referenceDate - supplies year/month/day when the format omits them (defaults to now)
 * @returns a `Date`, or an Invalid Date when the input does not match the format
 *
 * @example
 * parseDate('15.01.2024', 'dd.MM.yyyy'); // Date for Jan 15, 2024
 * parseDate('2024/01/15 14:30', 'yyyy/MM/dd HH:mm'); // Date with time
 * parseDate('nonsense', 'dd.MM.yyyy'); // Invalid Date
 * parseDate('Issued on 15.01.2024', "'Issued on' dd.MM.yyyy"); // Date for Jan 15, 2024
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

    const tokenPatterns: ITokenPattern[] = [
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
    const sortedPatterns: ITokenPattern[] = [...tokenPatterns].sort(
        (a: ITokenPattern, b: ITokenPattern) => b.token.length - a.token.length
    );

    // Build regex from format string using placeholders to avoid double-replacement
    // First, replace all tokens in the original format string with placeholders
    const placeholderList: IPlaceholderItem[] = [];
    const literalList: ILiteralItem[] = [];
    let placeholderIndex: number = 0;

    const nextPlaceholder: () => string = (): string => {
        const placeholder: string = `\x00${placeholderIndex}\x00`;
        placeholderIndex += 1;

        return placeholder;
    };

    // Quoted text is literal: park it before any token is looked at, so its letters are matched as
    // themselves rather than read as tokens. `''` is an escaped apostrophe.
    let workingFormat: string = formatStr.replace(/'([^']*)'/g, (_match: string, literal: string): string => {
        const placeholder: string = nextPlaceholder();
        literalList.push({ placeholder, literal: literal === '' ? "'" : literal });

        return placeholder;
    });

    // One placeholder per *occurrence*: a token used twice needs two capture groups, otherwise the
    // second occurrence stays in the pattern as a literal placeholder and can never match.
    for (const { token, pattern, handler } of sortedPatterns) {
        while (workingFormat.includes(token)) {
            const placeholder: string = nextPlaceholder();
            workingFormat = workingFormat.replace(token, placeholder);
            placeholderList.push({ placeholder, pattern, handler });
        }
    }

    // Now escape the remaining literal characters
    let regexStr: string = escapeRegExp(workingFormat);

    // Replace placeholders with actual regex patterns
    for (const { placeholder, pattern } of placeholderList) {
        regexStr = regexStr.replace(escapeRegExp(placeholder), pattern);
    }

    // Quoted text matches itself. Restored through a replacer so a `$` in it is not read as a
    // substitution reference.
    for (const { placeholder, literal } of literalList) {
        regexStr = regexStr.replace(escapeRegExp(placeholder), (): string => escapeRegExp(literal));
    }

    // Sort handlers by their placeholder position in the original working format
    // to match capture group order (left-to-right in the regex)
    const sortedByPosition: IPositionedHandler[] = placeholderList
        .map((item: IPlaceholderItem): IPositionedHandler => ({
            placeholder: item.placeholder,
            handler: item.handler,
            position: escapeRegExp(workingFormat).indexOf(escapeRegExp(item.placeholder)),
        }))
        .sort((a: IPositionedHandler, b: IPositionedHandler) => a.position - b.position);

    const handlers: ((val: string) => void)[] = sortedByPosition.map((item: IPositionedHandler) => item.handler);

    const regex: RegExp = new RegExp(`^${regexStr}$`, 'i');
    const match: RegExpExecArray | null = regex.exec(dateString);

    if (!match) {
        return new Date(NaN);
    }

    applyHandlers(handlers, match);

    // Apply AM/PM adjustment after all handlers
    if (hasAMPM) {
        hours = hoursOn24Scale(hours, isPM);
    }

    return new Date(year, month, day, hours, minutes, seconds, milliseconds);
}
