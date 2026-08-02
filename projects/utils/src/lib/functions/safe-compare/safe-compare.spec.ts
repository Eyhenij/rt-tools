import { IComparatorType, safeCompare } from './safe-compare.js';

const numeric: IComparatorType<number> = (a: number, b: number) => a - b;

describe(safeCompare.name, () => {
    it('should delegate to the comparator when both values are present', () => {
        expect(safeCompare(1, 2, numeric)).toBe(-1);
        expect(safeCompare(2, 1, numeric)).toBe(1);
        expect(safeCompare(1, 1, numeric)).toBe(0);
    });

    it('should sort a nullish first operand last', () => {
        expect(safeCompare(null, 1, numeric)).toBe(1);
        expect(safeCompare(undefined, 1, numeric)).toBe(1);
    });

    it('should sort a nullish second operand first', () => {
        expect(safeCompare(1, null, numeric)).toBe(-1);
        expect(safeCompare(1, undefined, numeric)).toBe(-1);
    });

    it('should treat two nullish operands as equal', () => {
        expect(safeCompare(null, undefined, numeric)).toBe(0);
    });

    it('should never call the comparator when either side is nullish', () => {
        const comparator: jest.Mock<number, [number, number]> = jest.fn<number, [number, number]>().mockReturnValue(0);

        safeCompare(null, 1, comparator);
        safeCompare(1, null, comparator);
        safeCompare(null, null, comparator);

        expect(comparator).not.toHaveBeenCalled();
    });

    it('should place nullish values at the end of an ascending sort', () => {
        expect([3, null, 1].sort((a: number | null, b: number | null) => safeCompare(a, b, numeric))).toEqual([1, 3, null]);
    });
});
