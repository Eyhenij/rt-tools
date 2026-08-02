import { areArraysEqualUnordered } from './are-arrays-equal-unordered.js';

describe(areArraysEqualUnordered.name, () => {
    it('should ignore order', () => {
        expect(areArraysEqualUnordered([1, 2, 3], [3, 1, 2])).toBe(true);
        expect(areArraysEqualUnordered([], [])).toBe(true);
    });

    it('should return false when the lengths differ', () => {
        expect(areArraysEqualUnordered([1], [1, 2])).toBe(false);
    });

    it('should count duplicates rather than collapse them', () => {
        expect(areArraysEqualUnordered([1, 1], [1, 2])).toBe(false);
        expect(areArraysEqualUnordered([1, 1, 2], [1, 2, 1])).toBe(true);
    });

    it('should match nested objects structurally, in any position', () => {
        expect(areArraysEqualUnordered<unknown>([{ a: 1 }, 2], [2, { a: 1 }])).toBe(true);
        expect(areArraysEqualUnordered([{ a: 1 }], [{ a: 2 }])).toBe(false);
    });

    it('should match nested arrays irrespective of their own order', () => {
        expect(areArraysEqualUnordered([[1, 2]], [[2, 1]])).toBe(true);
        expect(areArraysEqualUnordered([[1, 2]], [[1, 3]])).toBe(false);
    });

    it('should return false when an element finds no partner of the right kind', () => {
        expect(areArraysEqualUnordered<unknown>([{ a: 1 }], [1])).toBe(false);
        expect(areArraysEqualUnordered<unknown>([[1]], [1])).toBe(false);
    });

    it('should return false for non-array arguments', () => {
        expect(areArraysEqualUnordered(null as unknown as number[], [])).toBe(false);
        expect(areArraysEqualUnordered([], undefined as unknown as number[])).toBe(false);
    });
});
