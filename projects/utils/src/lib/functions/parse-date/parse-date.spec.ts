import { isDate } from '../is-date/index.js';
import { parseDate } from './parse-date.js';

describe(parseDate.name, () => {
    it('should parse date with dd.MM.yyyy format', () => {
        const result: Date = parseDate('15.01.2024', 'dd.MM.yyyy');

        expect(isDate(result)).toBe(true);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(15);
    });

    it('should parse date with yyyy-MM-dd format', () => {
        const result: Date = parseDate('2024-01-15', 'yyyy-MM-dd');

        expect(isDate(result)).toBe(true);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(15);
    });

    it('should parse date with MM/dd/yyyy format', () => {
        const result: Date = parseDate('01/15/2024', 'MM/dd/yyyy');

        expect(isDate(result)).toBe(true);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(15);
    });

    it('should parse datetime with yyyy-MM-dd HH:mm format', () => {
        const result: Date = parseDate('2024-01-15 14:30', 'yyyy-MM-dd HH:mm');

        expect(result.getHours()).toBe(14);
        expect(result.getMinutes()).toBe(30);
    });

    it('should parse datetime down to milliseconds', () => {
        const result: Date = parseDate('2024-01-15 14:30:45.123', 'yyyy-MM-dd HH:mm:ss.SSS');

        expect(result.getSeconds()).toBe(45);
        expect(result.getMilliseconds()).toBe(123);
    });

    it('should parse date with month names', () => {
        const long: Date = parseDate('15 January 2024', 'dd MMMM yyyy');
        expect(long.getMonth()).toBe(0);
        expect(long.getDate()).toBe(15);

        const short: Date = parseDate('15 Mar 2024', 'dd MMM yyyy');
        expect(short.getMonth()).toBe(2);
    });

    it('should parse 12-hour time with AM/PM', () => {
        expect(parseDate('09:30 AM', 'hh:mm a').getHours()).toBe(9);
        expect(parseDate('02:30 PM', 'hh:mm a').getHours()).toBe(14);
        expect(parseDate('12:00 PM', 'hh:mm a').getHours()).toBe(12);
        expect(parseDate('12:00 AM', 'hh:mm a').getHours()).toBe(0);
    });

    it('should parse a single-digit 12-hour clock', () => {
        expect(parseDate('9:30 pm', 'h:mm a').getHours()).toBe(21);
    });

    it('should split the 2-digit year at 70', () => {
        expect(parseDate('15.01.24', 'dd.MM.yy').getFullYear()).toBe(2024);
        expect(parseDate('15.01.69', 'dd.MM.yy').getFullYear()).toBe(2069);
        expect(parseDate('15.01.70', 'dd.MM.yy').getFullYear()).toBe(1970);
        expect(parseDate('15.01.99', 'dd.MM.yy').getFullYear()).toBe(1999);
    });

    it('should parse single-digit day, month, hour, minute and second', () => {
        const result: Date = parseDate('5/9/2024 3:4:7', 'd/M/yyyy H:m:s');

        expect(result.getDate()).toBe(5);
        expect(result.getMonth()).toBe(8);
        expect(result.getHours()).toBe(3);
        expect(result.getMinutes()).toBe(4);
        expect(result.getSeconds()).toBe(7);
    });

    it('should return invalid date for empty string', () => {
        expect(isDate(parseDate('', 'yyyy-MM-dd'))).toBe(false);
    });

    it('should return invalid date for non-string values', () => {
        expect(isDate(parseDate(null as unknown as string, 'yyyy-MM-dd'))).toBe(false);
        expect(isDate(parseDate(20240115 as unknown as string, 'yyyy-MM-dd'))).toBe(false);
    });

    it('should return invalid date for mismatched format', () => {
        expect(isDate(parseDate('2024-01-15', 'dd.MM.yyyy'))).toBe(false);
        expect(isDate(parseDate('15.01.2024', 'yyyy-MM-dd'))).toBe(false);
    });

    it('should reject trailing input because the pattern is anchored', () => {
        expect(isDate(parseDate('15.01.2024 and more', 'dd.MM.yyyy'))).toBe(false);
    });

    it('should use the reference date for parts the format omits', () => {
        const referenceDate: Date = new Date(2024, 5, 20);
        const result: Date = parseDate('14:30', 'HH:mm', referenceDate);

        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(5);
        expect(result.getDate()).toBe(20);
        expect(result.getHours()).toBe(14);
        expect(result.getMinutes()).toBe(30);
    });

    it('should default the reference date to today', () => {
        const today: Date = new Date();
        const result: Date = parseDate('14:30', 'HH:mm');

        expect(result.getFullYear()).toBe(today.getFullYear());
        expect(result.getDate()).toBe(today.getDate());
    });

    it('should read a token that appears more than once', () => {
        expect(isDate(parseDate('15/15', 'dd/dd'))).toBe(true);
        expect(parseDate('15/16', 'dd/dd').getDate()).toBe(16);
    });

    describe('quoted literals', () => {
        it('should read back what the same quoted format wrote', () => {
            const result: Date = parseDate('Issued on 15.01.2024', "'Issued on' dd.MM.yyyy");

            expect(result.getDate()).toBe(15);
            expect(result.getMonth()).toBe(0);
            expect(result.getFullYear()).toBe(2024);
        });

        it('should require the literal to be present', () => {
            expect(isDate(parseDate('15.01.2024', "'Issued on' dd.MM.yyyy"))).toBe(false);
        });

        it('should protect letters that would otherwise be tokens', () => {
            expect(parseDate('Month: 03', "'Month:' MM").getMonth()).toBe(2);
        });

        it('should read two quotes in a row as one apostrophe', () => {
            expect(isDate(parseDate("15' Jan", "d'' MMM"))).toBe(true);
        });

        it('should match a literal carrying regex metacharacters', () => {
            expect(isDate(parseDate('(2024)', "'(' yyyy ')'"))).toBe(false);
            expect(isDate(parseDate('( 2024 )', "'(' yyyy ')'"))).toBe(true);
        });

        it('should not read a $-substitution out of a literal', () => {
            expect(isDate(parseDate('$& 2024', "'$&' yyyy"))).toBe(true);
        });
    });

    it('should match a format that carries no tokens at all', () => {
        expect(isDate(parseDate('noon', 'noon'))).toBe(true);
        expect(isDate(parseDate('noon', 'midnight'))).toBe(false);
    });
});
