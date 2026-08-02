import { isDate } from '../is-date/index.js';
import { dateStringToDate } from './date-string-to-date.js';

describe(dateStringToDate.name, () => {
    it('should return a copy of a Date argument', () => {
        const date: Date = new Date(2024, 0, 15);
        const result: Date = dateStringToDate(date);

        expect(result).toEqual(date);
        expect(result).not.toBe(date);
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

    it('should return an Invalid Date for an empty or unparseable input', () => {
        expect(isDate(dateStringToDate(''))).toBe(false);
        expect(isDate(dateStringToDate('nonsense'))).toBe(false);
        expect(isDate(dateStringToDate(null as unknown as string))).toBe(false);
    });

    it('should return an Invalid Date for a year beyond 3000', () => {
        expect(isDate(dateStringToDate('15.01.3001'))).toBe(false);
    });

    it('should return an Invalid Date for a year typed with an extra digit', () => {
        expect(isDate(dateStringToDate('15.01.20245'))).toBe(false);
    });
});
