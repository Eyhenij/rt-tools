import { safeNumCompare } from './safe-num-compare.js';

describe(safeNumCompare.name, () => {
    it('should order numbers ascending', () => {
        expect(safeNumCompare(1, 2)).toBe(-1);
        expect(safeNumCompare(2, 1)).toBe(1);
        expect(safeNumCompare(1, 1)).toBe(0);
    });

    it('should sort nullish values last', () => {
        expect(safeNumCompare(null as unknown as number, 1)).toBe(1);
        expect(safeNumCompare(1, undefined as unknown as number)).toBe(-1);
        expect(safeNumCompare(null as unknown as number, null as unknown as number)).toBe(0);
    });

    it('should not treat 0 as missing', () => {
        expect(safeNumCompare(0, 1)).toBe(-1);
    });

    it('should return NaN when an operand is NaN', () => {
        expect(safeNumCompare(NaN, 1)).toBeNaN();
    });

    it('should order a list, nullish last', () => {
        const values: number[] = [3, null as unknown as number, 1];

        expect(values.sort(safeNumCompare)).toEqual([1, 3, null]);
    });
});
