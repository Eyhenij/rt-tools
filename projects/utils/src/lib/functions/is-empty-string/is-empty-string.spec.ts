import { isEmptyString } from './is-empty-string.js';

describe(isEmptyString.name, () => {
    it('should return true for an empty string', () => {
        expect(isEmptyString('')).toBe(true);
    });

    it('should return false for a populated string', () => {
        expect(isEmptyString('a')).toBe(false);
    });

    it('should return false for a whitespace-only string — it does not trim', () => {
        expect(isEmptyString('   ')).toBe(false);
    });

    it('should treat a nullish argument as empty', () => {
        expect(isEmptyString(null)).toBe(true);
        expect(isEmptyString(undefined)).toBe(true);
    });
});
