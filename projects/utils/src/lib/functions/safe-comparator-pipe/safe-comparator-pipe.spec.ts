import { safeComparatorPipe } from './safe-comparator-pipe.js';

describe(safeComparatorPipe.name, () => {
    it('should return 0 for an empty chain', () => {
        expect(safeComparatorPipe()).toBe(0);
    });

    it('should return the first non-zero result', () => {
        expect(
            safeComparatorPipe(
                () => 0,
                () => -1,
                () => 1
            )
        ).toBe(-1);
    });

    it('should return 0 when every comparison ties', () => {
        expect(
            safeComparatorPipe(
                () => 0,
                () => 0
            )
        ).toBe(0);
    });

    it('should stop calling comparators once one is decisive', () => {
        const second: jest.Mock<number, []> = jest.fn<number, []>().mockReturnValue(1);
        const third: jest.Mock<number, []> = jest.fn<number, []>().mockReturnValue(1);

        safeComparatorPipe(() => 5, second, third);

        expect(second).not.toHaveBeenCalled();
        expect(third).not.toHaveBeenCalled();
    });

    it('should fall through to the next field when the first ties', () => {
        const rows: { last: string; first: string }[] = [
            { last: 'Smith', first: 'Zoe' },
            { last: 'Smith', first: 'Adam' },
        ];

        const sorted: { last: string; first: string }[] = rows.sort(
            (a: { last: string; first: string }, b: { last: string; first: string }) =>
                safeComparatorPipe(
                    () => a.last.localeCompare(b.last),
                    () => a.first.localeCompare(b.first)
                )
        );

        expect(sorted[0].first).toBe('Adam');
    });
});
