import { isString } from './is-string.js';

describe(isString.name, () => {
    it('should return true for string primitives', () => {
        expect(isString('')).toBe(true);
        expect(isString('text')).toBe(true);
    });

    it('should return false for non-strings', () => {
        expect(isString(1)).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString(['a'])).toBe(false);
    });

    it('should return false for a boxed String object', () => {
        expect(isString(new String('text'))).toBe(false);
    });
});
