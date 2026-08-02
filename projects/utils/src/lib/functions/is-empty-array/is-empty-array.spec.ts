import { isEmptyArray } from './is-empty-array.js';

describe(isEmptyArray.name, () => {
    it('should return true for an empty array', () => {
        expect(isEmptyArray([])).toBe(true);
    });

    it('should return false for a populated array', () => {
        expect(isEmptyArray([1])).toBe(false);
        expect(isEmptyArray([undefined])).toBe(false);
    });

    it('should treat a nullish argument as empty', () => {
        expect(isEmptyArray(null)).toBe(true);
        expect(isEmptyArray(undefined)).toBe(true);
    });
});
