import { removeFieldFromObject } from './remove-field-from-object.js';

describe(removeFieldFromObject.name, () => {
    it('should return a copy without the given key', () => {
        expect(removeFieldFromObject({ a: 1, b: 2 }, 'b')).toEqual({ a: 1 });
    });

    it('should leave the source object untouched', () => {
        const source: { a: number; b: number } = { a: 1, b: 2 };

        removeFieldFromObject(source, 'b');

        expect(source).toEqual({ a: 1, b: 2 });
    });

    it('should return an equal copy when the key is absent', () => {
        const source: { a: number } = { a: 1 };
        const result: Omit<{ a: number }, 'missing'> = removeFieldFromObject(source, 'missing');

        expect(result).toEqual({ a: 1 });
        expect(result).not.toBe(source);
    });

    it('should remove a key whose value is undefined', () => {
        expect('a' in removeFieldFromObject({ a: undefined }, 'a')).toBe(false);
    });

    it('should copy shallowly — nested values stay shared', () => {
        const nested: { deep: number } = { deep: 1 };
        const result: Omit<{ a: number; nested: { deep: number } }, 'a'> = removeFieldFromObject({ a: 1, nested }, 'a');

        expect(result.nested).toBe(nested);
    });
});
