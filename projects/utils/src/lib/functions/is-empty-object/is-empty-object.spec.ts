import { isEmptyObject } from './is-empty-object.js';

describe(isEmptyObject.name, () => {
    it('should return true for an object with no own enumerable keys', () => {
        expect(isEmptyObject({})).toBe(true);
        expect(isEmptyObject(Object.create({ inherited: 1 }))).toBe(true);
    });

    it('should return false for an object with own keys', () => {
        expect(isEmptyObject({ a: undefined })).toBe(false);
    });

    it('should ignore symbol keys — Object.keys does not list them', () => {
        expect(isEmptyObject({ [Symbol('key')]: 1 })).toBe(true);
    });

    it('should treat an empty array as empty', () => {
        expect(isEmptyObject([] as unknown as Record<string, unknown>)).toBe(true);
    });

    it('should throw on a nullish argument', () => {
        expect(() => isEmptyObject(null as unknown as Record<string, unknown>)).toThrow(TypeError);
    });
});
