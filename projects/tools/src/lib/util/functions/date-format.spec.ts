import { formatDate, isDate, parseDate, parseISO } from './date-format';

describe('date-format', () => {
    describe('isDate', () => {
        it('should return true for valid Date objects', () => {
            expect(isDate(new Date())).toBe(true);
            expect(isDate(new Date(2024, 0, 15))).toBe(true);
            expect(isDate(new Date('2024-01-15'))).toBe(true);
        });

        it('should return false for invalid Date objects', () => {
            expect(isDate(new Date('invalid'))).toBe(false);
            expect(isDate(new Date(NaN))).toBe(false);
        });

        it('should return false for non-Date values', () => {
            expect(isDate(null)).toBe(false);
            expect(isDate(undefined)).toBe(false);
            expect(isDate('')).toBe(false);
            expect(isDate('2024-01-15')).toBe(false);
            expect(isDate(123456789)).toBe(false);
            expect(isDate({})).toBe(false);
            expect(isDate([])).toBe(false);
        });
    });

    describe('formatDate', () => {
        const testDate: Date = new Date(2024, 0, 15, 14, 30, 45, 123);

        it('should format year tokens', () => {
            expect(formatDate(testDate, 'yyyy')).toBe('2024');
            expect(formatDate(testDate, 'yy')).toBe('24');
        });

        it('should format month tokens', () => {
            expect(formatDate(testDate, 'MM')).toBe('01');
            expect(formatDate(testDate, 'M')).toBe('1');
            expect(formatDate(testDate, 'MMMM')).toBe('January');
            expect(formatDate(testDate, 'MMM')).toBe('Jan');
        });

        it('should format day tokens', () => {
            expect(formatDate(testDate, 'dd')).toBe('15');
            expect(formatDate(testDate, 'd')).toBe('15');

            const singleDigitDay: Date = new Date(2024, 0, 5);
            expect(formatDate(singleDigitDay, 'dd')).toBe('05');
            expect(formatDate(singleDigitDay, 'd')).toBe('5');
        });

        it('should format hour tokens (24h)', () => {
            expect(formatDate(testDate, 'HH')).toBe('14');
            expect(formatDate(testDate, 'H')).toBe('14');

            const morningDate: Date = new Date(2024, 0, 15, 9, 30);
            expect(formatDate(morningDate, 'HH')).toBe('09');
            expect(formatDate(morningDate, 'H')).toBe('9');
        });

        it('should format hour tokens (12h)', () => {
            expect(formatDate(testDate, 'hh')).toBe('02');
            expect(formatDate(testDate, 'h')).toBe('2');

            const morningDate: Date = new Date(2024, 0, 15, 9, 30);
            expect(formatDate(morningDate, 'hh')).toBe('09');
            expect(formatDate(morningDate, 'h')).toBe('9');

            const noonDate: Date = new Date(2024, 0, 15, 12, 0);
            expect(formatDate(noonDate, 'h')).toBe('12');

            const midnightDate: Date = new Date(2024, 0, 15, 0, 0);
            expect(formatDate(midnightDate, 'h')).toBe('12');
        });

        it('should format minute tokens', () => {
            expect(formatDate(testDate, 'mm')).toBe('30');
            expect(formatDate(testDate, 'm')).toBe('30');

            const lowMinutes: Date = new Date(2024, 0, 15, 14, 5);
            expect(formatDate(lowMinutes, 'mm')).toBe('05');
            expect(formatDate(lowMinutes, 'm')).toBe('5');
        });

        it('should format second tokens', () => {
            expect(formatDate(testDate, 'ss')).toBe('45');
            expect(formatDate(testDate, 's')).toBe('45');

            const lowSeconds: Date = new Date(2024, 0, 15, 14, 30, 5);
            expect(formatDate(lowSeconds, 'ss')).toBe('05');
            expect(formatDate(lowSeconds, 's')).toBe('5');
        });

        it('should format millisecond tokens', () => {
            expect(formatDate(testDate, 'SSS')).toBe('123');

            const lowMs: Date = new Date(2024, 0, 15, 14, 30, 45, 5);
            expect(formatDate(lowMs, 'SSS')).toBe('005');
        });

        it('should format AM/PM tokens', () => {
            const morningDate: Date = new Date(2024, 0, 15, 9, 30);
            expect(formatDate(morningDate, 'a')).toBe('AM');

            const afternoonDate: Date = new Date(2024, 0, 15, 14, 30);
            expect(formatDate(afternoonDate, 'a')).toBe('PM');

            const noonDate: Date = new Date(2024, 0, 15, 12, 0);
            expect(formatDate(noonDate, 'a')).toBe('PM');

            const midnightDate: Date = new Date(2024, 0, 15, 0, 0);
            expect(formatDate(midnightDate, 'a')).toBe('AM');
        });

        it('should format weekday tokens', () => {
            const monday: Date = new Date(2024, 0, 15);
            expect(formatDate(monday, 'EEEE')).toBe('Monday');
            expect(formatDate(monday, 'EEE')).toBe('Mon');

            const sunday: Date = new Date(2024, 0, 14);
            expect(formatDate(sunday, 'EEEE')).toBe('Sunday');
            expect(formatDate(sunday, 'EEE')).toBe('Sun');
        });

        it('should handle common format patterns', () => {
            expect(formatDate(testDate, 'dd.MM.yyyy')).toBe('15.01.2024');
            expect(formatDate(testDate, 'yyyy-MM-dd')).toBe('2024-01-15');
            expect(formatDate(testDate, 'MM/dd/yyyy')).toBe('01/15/2024');
            expect(formatDate(testDate, 'yyyy-MM-dd HH:mm:ss')).toBe('2024-01-15 14:30:45');
            expect(formatDate(testDate, 'dd MMM yyyy')).toBe('15 Jan 2024');
            expect(formatDate(testDate, 'EEEE, MMMM d, yyyy')).toBe('Monday, January 15, 2024');
            expect(formatDate(testDate, 'h:mm a')).toBe('2:30 PM');
        });

        it('should return empty string for invalid dates', () => {
            expect(formatDate(new Date('invalid'), 'yyyy-MM-dd')).toBe('');
            expect(formatDate(new Date(NaN), 'yyyy-MM-dd')).toBe('');
        });
    });

    describe('parseISO', () => {
        it('should parse ISO date strings', () => {
            const result: Date = parseISO('2024-01-15');
            expect(isDate(result)).toBe(true);
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(0);
            expect(result.getDate()).toBe(15);
        });

        it('should parse ISO datetime strings', () => {
            const result: Date = parseISO('2024-01-15T14:30:00.000Z');
            expect(isDate(result)).toBe(true);
            expect(result.getFullYear()).toBe(2024);
        });

        it('should return invalid date for empty string', () => {
            expect(isDate(parseISO(''))).toBe(false);
        });

        it('should return invalid date for non-string values', () => {
            expect(isDate(parseISO(null as unknown as string))).toBe(false);
            expect(isDate(parseISO(undefined as unknown as string))).toBe(false);
        });

        it('should return invalid date for invalid strings', () => {
            expect(isDate(parseISO('not-a-date'))).toBe(false);
        });
    });

    describe('parseDate', () => {
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
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(0);
            expect(result.getDate()).toBe(15);
        });

        it('should parse datetime with yyyy-MM-dd HH:mm format', () => {
            const result: Date = parseDate('2024-01-15 14:30', 'yyyy-MM-dd HH:mm');
            expect(isDate(result)).toBe(true);
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(0);
            expect(result.getDate()).toBe(15);
            expect(result.getHours()).toBe(14);
            expect(result.getMinutes()).toBe(30);
        });

        it('should parse datetime with full format', () => {
            const result: Date = parseDate('2024-01-15 14:30:45', 'yyyy-MM-dd HH:mm:ss');
            expect(isDate(result)).toBe(true);
            expect(result.getHours()).toBe(14);
            expect(result.getMinutes()).toBe(30);
            expect(result.getSeconds()).toBe(45);
        });

        it('should parse date with month names', () => {
            const result: Date = parseDate('15 January 2024', 'dd MMMM yyyy');
            expect(isDate(result)).toBe(true);
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(0);
            expect(result.getDate()).toBe(15);
        });

        it('should parse date with short month names', () => {
            const result: Date = parseDate('15 Jan 2024', 'dd MMM yyyy');
            expect(isDate(result)).toBe(true);
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(0);
        });

        it('should parse 12-hour time with AM/PM', () => {
            const resultAM: Date = parseDate('09:30 AM', 'hh:mm a');
            expect(resultAM.getHours()).toBe(9);
            expect(resultAM.getMinutes()).toBe(30);

            const resultPM: Date = parseDate('02:30 PM', 'hh:mm a');
            expect(resultPM.getHours()).toBe(14);
            expect(resultPM.getMinutes()).toBe(30);

            const resultNoon: Date = parseDate('12:00 PM', 'hh:mm a');
            expect(resultNoon.getHours()).toBe(12);

            const resultMidnight: Date = parseDate('12:00 AM', 'hh:mm a');
            expect(resultMidnight.getHours()).toBe(0);
        });

        it('should parse 2-digit year', () => {
            const result24: Date = parseDate('15.01.24', 'dd.MM.yy');
            expect(result24.getFullYear()).toBe(2024);

            const result99: Date = parseDate('15.01.99', 'dd.MM.yy');
            expect(result99.getFullYear()).toBe(1999);

            const result70: Date = parseDate('15.01.70', 'dd.MM.yy');
            expect(result70.getFullYear()).toBe(1970);

            const result69: Date = parseDate('15.01.69', 'dd.MM.yy');
            expect(result69.getFullYear()).toBe(2069);
        });

        it('should parse single-digit day and month', () => {
            const result: Date = parseDate('5/9/2024', 'd/M/yyyy');
            expect(isDate(result)).toBe(true);
            expect(result.getDate()).toBe(5);
            expect(result.getMonth()).toBe(8);
        });

        it('should return invalid date for empty string', () => {
            expect(isDate(parseDate('', 'yyyy-MM-dd'))).toBe(false);
        });

        it('should return invalid date for non-string values', () => {
            expect(isDate(parseDate(null as unknown as string, 'yyyy-MM-dd'))).toBe(false);
        });

        it('should return invalid date for mismatched format', () => {
            expect(isDate(parseDate('2024-01-15', 'dd.MM.yyyy'))).toBe(false);
            expect(isDate(parseDate('15.01.2024', 'yyyy-MM-dd'))).toBe(false);
        });

        it('should use reference date for missing parts', () => {
            const referenceDate: Date = new Date(2024, 5, 20);
            const result: Date = parseDate('14:30', 'HH:mm', referenceDate);
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(5);
            expect(result.getDate()).toBe(20);
            expect(result.getHours()).toBe(14);
            expect(result.getMinutes()).toBe(30);
        });
    });
});
