import { areArraysEqual } from './are-arrays-equal.js';

describe(areArraysEqual.name, () => {
    it('should return true for identical primitive arrays', () => {
        expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(areArraysEqual([], [])).toBe(true);
    });

    it('should respect order', () => {
        expect(areArraysEqual([1, 2], [2, 1])).toBe(false);
    });

    it('should return false when the lengths differ', () => {
        expect(areArraysEqual([1], [1, 2])).toBe(false);
    });

    it('should compare nested arrays deeply', () => {
        expect(areArraysEqual([1, [2, [3]]], [1, [2, [3]]])).toBe(true);
        expect(areArraysEqual([1, [2]], [1, [3]])).toBe(false);
    });

    it('should compare nested objects structurally', () => {
        expect(areArraysEqual([{ a: 1 }], [{ a: 1 }])).toBe(true);
        expect(areArraysEqual([{ a: 1 }], [{ a: 2 }])).toBe(false);
    });

    it('should return false when only one side holds an object at a position', () => {
        expect(areArraysEqual<unknown>([{ a: 1 }], [1])).toBe(false);
    });

    it('should treat a null element as a plain value', () => {
        expect(areArraysEqual([null], [null])).toBe(true);
        expect(areArraysEqual<unknown>([null], [{}])).toBe(false);
    });

    it('should return false for non-array arguments', () => {
        expect(areArraysEqual(null as unknown as number[], [])).toBe(false);
        expect(areArraysEqual([], 'ab' as unknown as string[])).toBe(false);
    });

    it('should not consider NaN equal to itself', () => {
        expect(areArraysEqual([NaN], [NaN])).toBe(false);
    });
});
