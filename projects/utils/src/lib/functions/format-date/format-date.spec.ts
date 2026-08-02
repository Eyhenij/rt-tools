import { formatDate } from './format-date.js';

describe(formatDate.name, () => {
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

    describe('quoted literals', () => {
        it('should render quoted text as itself', () => {
            expect(formatDate(testDate, "'Issued on' dd.MM.yyyy")).toBe('Issued on 15.01.2024');
        });

        it('should protect letters that would otherwise be tokens', () => {
            expect(formatDate(testDate, "'Month:' MM")).toBe('Month: 01');
            expect(formatDate(testDate, "'dd MM yyyy'")).toBe('dd MM yyyy');
        });

        it('should render two quotes in a row as one apostrophe', () => {
            expect(formatDate(testDate, "''")).toBe("'");
            expect(formatDate(testDate, "d'' MMM")).toBe("15' Jan");
        });

        it('should render a token that appears more than once', () => {
            expect(formatDate(testDate, 'dd/dd')).toBe('15/15');
            expect(formatDate(testDate, 'yyyy yyyy yyyy')).toBe('2024 2024 2024');
        });

        it('should handle several quoted runs', () => {
            expect(formatDate(testDate, "'from' dd 'to' dd")).toBe('from 15 to 15');
        });

        it('should not read a $-substitution out of a literal', () => {
            expect(formatDate(testDate, "'$&' yyyy")).toBe('$& 2024');
        });
    });

    it('should leave a format without tokens untouched', () => {
        expect(formatDate(testDate, '--')).toBe('--');
        expect(formatDate(testDate, '')).toBe('');
    });

    it('should return empty string for invalid dates', () => {
        expect(formatDate(new Date('invalid'), 'yyyy-MM-dd')).toBe('');
        expect(formatDate(new Date(NaN), 'yyyy-MM-dd')).toBe('');
        expect(formatDate(null as unknown as Date, 'yyyy-MM-dd')).toBe('');
    });
});
