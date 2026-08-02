import { dateStringToDate } from './date-string-to-date.js';

describe(dateStringToDate.name, () => {
    it('should pass a Date through unchanged', () => {
        const date: Date = new Date(2024, 0, 15);

        expect(dateStringToDate(date)).toBe(date);
    });

    it('should parse a dd.MM.yyyy string', () => {
        const result: Date = dateStringToDate('15.01.2024');

        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(15);
    });

    it('should pad a single-digit day and month', () => {
        const result: Date = dateStringToDate('5.9.2024');

        expect(result.getMonth()).toBe(8);
        expect(result.getDate()).toBe(5);
    });

    it('should lift a zero day or month to the first', () => {
        const result: Date = dateStringToDate('00.01.2024');

        expect(result.getDate()).toBe(1);
    });

    it('should fill in missing parts of a partially typed date', () => {
        expect(dateStringToDate('..2024').getFullYear()).toBe(2024);
        expect(dateStringToDate('.01.2024').getFullYear()).toBe(2024);
    });

    it('should fall back to now for an empty or unparseable input', () => {
        const now: Date = new Date();

        expect(dateStringToDate('').getFullYear()).toBe(now.getFullYear());
        expect(dateStringToDate('nonsense').getFullYear()).toBe(now.getFullYear());
        expect(dateStringToDate(null as unknown as string).getFullYear()).toBe(now.getFullYear());
    });

    it('should fall back to now for a year beyond 3000', () => {
        const now: Date = new Date();

        expect(dateStringToDate('15.01.3001').getFullYear()).toBe(now.getFullYear());
    });

    it('should fall back to now for a year typed with an extra digit', () => {
        const now: Date = new Date();

        expect(dateStringToDate('15.01.20245').getFullYear()).toBe(now.getFullYear());
    });
});
