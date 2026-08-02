import { isNil } from './is-nil.js';

describe(isNil.name, () => {
    it('should return true for null and undefined', () => {
        expect(isNil(null)).toBe(true);
        expect(isNil(undefined)).toBe(true);
    });

    it('should return false for falsy values that are present', () => {
        expect(isNil(0)).toBe(false);
        expect(isNil('')).toBe(false);
        expect(isNil(false)).toBe(false);
        expect(isNil(NaN)).toBe(false);
    });

    it('should return false for objects and arrays', () => {
        expect(isNil({})).toBe(false);
        expect(isNil([])).toBe(false);
    });

    it('should narrow the type for the caller', () => {
        const value: string | null = 'text' as string | null;

        if (!isNil(value)) {
            expect(value.length).toBe(4);
        }
    });
});
