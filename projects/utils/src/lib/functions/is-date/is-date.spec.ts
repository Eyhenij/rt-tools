import { isDate } from './is-date.js';

describe(isDate.name, () => {
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
