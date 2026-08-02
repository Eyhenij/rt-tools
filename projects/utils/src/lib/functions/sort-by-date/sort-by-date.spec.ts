import { sortByDate } from './sort-by-date.js';

describe('sortByDate', () => {
    it('should return a negative number when the first date is earlier', () => {
        expect(sortByDate({ birthDate: '1989-05-12' }, { birthDate: '1993-01-24' }, 'birthDate')).toBeLessThan(0);
    });

    it('should return a positive number when the first date is later', () => {
        expect(sortByDate({ birthDate: '2001-11-11' }, { birthDate: '1973-08-12' }, 'birthDate')).toBeGreaterThan(0);
    });

    it('should return 0 for the same instant', () => {
        expect(sortByDate({ birthDate: '2001-11-11' }, { birthDate: '2001-11-11' }, 'birthDate')).toBe(0);
    });

    it('should accept Date instances and timestamps', () => {
        expect(sortByDate({ at: new Date(2020, 0, 1) }, { at: new Date(2021, 0, 1) }, 'at')).toBeLessThan(0);
        expect(sortByDate({ at: 1000 }, { at: 500 }, 'at')).toBe(500);
    });

    it('should return NaN when a value is not a parseable date', () => {
        expect(sortByDate({ at: 'nonsense' }, { at: '2020-01-01' }, 'at')).toBeNaN();
    });

    it('should order a list oldest first', () => {
        const events: { at: string }[] = [{ at: '2021-01-01' }, { at: '2019-01-01' }, { at: '2020-01-01' }];

        expect(
            events.sort((a: { at: string }, b: { at: string }) => sortByDate(a, b, 'at')).map((event: { at: string }) => event.at)
        ).toEqual(['2019-01-01', '2020-01-01', '2021-01-01']);
    });
});
