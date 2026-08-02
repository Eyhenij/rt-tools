import { areObjectsEqual } from './are-objects-equal.js';

describe(areObjectsEqual.name, () => {
    it('should return true for the same reference', () => {
        const value: Record<string, unknown> = { a: 1 };

        expect(areObjectsEqual(value, value)).toBe(true);
        expect(areObjectsEqual(null, null)).toBe(true);
        expect(areObjectsEqual(1, 1)).toBe(true);
    });

    it('should compare distinct objects structurally', () => {
        expect(areObjectsEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
        expect(areObjectsEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('should return false when the key counts differ', () => {
        expect(areObjectsEqual({ a: 1 }, { a: 1, b: 2 } as unknown as { a: number })).toBe(false);
    });

    it('should delegate arrays to the ordered array comparison', () => {
        expect(areObjectsEqual([1, 2], [1, 2])).toBe(true);
        expect(areObjectsEqual([1, 2], [2, 1])).toBe(false);
    });

    it('should return false for two distinct primitives', () => {
        expect(areObjectsEqual(1, 2)).toBe(false);
        expect(areObjectsEqual('a', 'b')).toBe(false);
    });

    it('should return false when only one side is an object', () => {
        expect(areObjectsEqual<unknown>({ a: 1 }, 'a')).toBe(false);
        expect(areObjectsEqual<unknown>(null, {})).toBe(false);
        expect(areObjectsEqual<unknown>({}, null)).toBe(false);
    });

    it('should return false when one side is an array and the other is not', () => {
        expect(areObjectsEqual<unknown>([1], { 0: 1 })).toBe(false);
        expect(areObjectsEqual<unknown>({ 0: 1 }, [1])).toBe(false);
        expect(areObjectsEqual<unknown>([], {})).toBe(false);
    });
});
