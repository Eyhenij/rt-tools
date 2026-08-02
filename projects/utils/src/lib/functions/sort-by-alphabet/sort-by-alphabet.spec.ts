import { sortByAlphabet } from './sort-by-alphabet.js';

describe('sortByAlphabet', () => {
    it('should return -1 when the first value is less than the second', () => {
        expect(sortByAlphabet({ firstName: 'Alex' }, { firstName: 'Nick' }, 'firstName')).toBe(-1);
    });

    it('should return 1 when the first value is greater than the second', () => {
        expect(sortByAlphabet({ firstName: 'Helen' }, { firstName: 'Anna' }, 'firstName')).toBe(1);
    });

    it('should return 0 for equal values', () => {
        expect(sortByAlphabet({ firstName: 'Anna' }, { firstName: 'Anna' }, 'firstName')).toBe(0);
    });

    it('should ignore case', () => {
        expect(sortByAlphabet({ firstName: 'anna' }, { firstName: 'Boris' }, 'firstName')).toBe(-1);
        expect(sortByAlphabet({ firstName: 'ANNA' }, { firstName: 'anna' }, 'firstName')).toBe(0);
    });

    it('should return 0 when either field is missing', () => {
        const withName: { firstName?: string } = { firstName: 'Nick' };
        const withoutName: { firstName?: string } = {};

        expect(sortByAlphabet(withName, withoutName, 'firstName')).toBe(0);
        expect(sortByAlphabet(withoutName, withName, 'firstName')).toBe(0);
    });

    it('should return 0 when either field is empty or not a string', () => {
        expect(sortByAlphabet({ firstName: '' }, { firstName: 'Nick' }, 'firstName')).toBe(0);
        expect(sortByAlphabet({ id: 1 }, { id: 2 }, 'id')).toBe(0);
    });

    it('should order a list', () => {
        const users: { firstName: string }[] = [{ firstName: 'Nick' }, { firstName: 'alex' }, { firstName: 'Boris' }];

        expect(
            users
                .sort((a: { firstName: string }, b: { firstName: string }) => sortByAlphabet(a, b, 'firstName'))
                .map((user: { firstName: string }) => user.firstName)
        ).toEqual(['alex', 'Boris', 'Nick']);
    });
});
