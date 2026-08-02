import { safeStrCompare } from './safe-str-compare.js';

describe(safeStrCompare.name, () => {
    it('should order strings by collation', () => {
        expect(safeStrCompare('apple', 'banana')).toBeLessThan(0);
        expect(safeStrCompare('banana', 'apple')).toBeGreaterThan(0);
        expect(safeStrCompare('apple', 'apple')).toBe(0);
    });

    it('should sort nullish values last', () => {
        expect(safeStrCompare(null as unknown as string, 'a')).toBe(1);
        expect(safeStrCompare('a', undefined as unknown as string)).toBe(-1);
        expect(safeStrCompare(null as unknown as string, null as unknown as string)).toBe(0);
    });

    it('should order a list, nullish last', () => {
        const values: string[] = ['banana', null as unknown as string, 'apple'];

        expect(values.sort(safeStrCompare)).toEqual(['apple', 'banana', null]);
    });
});
