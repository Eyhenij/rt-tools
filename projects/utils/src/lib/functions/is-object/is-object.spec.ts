import { isObject } from './is-object.js';

describe(isObject.name, () => {
    it('should return true for plain objects, arrays and class instances', () => {
        expect(isObject({})).toBe(true);
        expect(isObject([])).toBe(true);
        expect(isObject(new Date())).toBe(true);
    });

    it('should return false for null', () => {
        expect(isObject(null)).toBe(false);
    });

    it('should return false for primitives and functions', () => {
        expect(isObject(undefined)).toBe(false);
        expect(isObject(1)).toBe(false);
        expect(isObject('text')).toBe(false);
        expect(isObject(() => undefined)).toBe(false);
    });
});
