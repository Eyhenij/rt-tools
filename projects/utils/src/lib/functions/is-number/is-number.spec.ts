import { isNumber } from './is-number.js';

describe(isNumber.name, () => {
    it('should return true for number primitives', () => {
        expect(isNumber(0)).toBe(true);
        expect(isNumber(-1.5)).toBe(true);
    });

    it('should return true for NaN and Infinity — they are numbers', () => {
        expect(isNumber(NaN)).toBe(true);
        expect(isNumber(Infinity)).toBe(true);
    });

    it('should return false for numeric strings and other types', () => {
        expect(isNumber('1')).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber(undefined)).toBe(false);
        expect(isNumber(1n)).toBe(false);
    });
});
