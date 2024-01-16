import { sortByAlphabet, sortByDate } from './sorters';

describe(sortByAlphabet.name, () => {
    describe('when the first value is less than the second value', () =>  {
        it('should return -1', () => {
            const mockUserA: object = { firstName: 'Alex' };
            const mockUserB: object = { firstName: 'Nick' };

            expect(sortByAlphabet(mockUserA, mockUserB, 'firstName')).toBe(-1);
        });
    });

    describe('when the first value is greater than the second value', () =>  {
        it('should return 1', () => {
            const mockUserA: object = { firstName: 'Helen' };
            const mockUserB: object = { firstName: 'Anna' };

            expect(sortByAlphabet(mockUserA, mockUserB, 'firstName')).toBe(1);
        });
    });

    describe('when the first value is equal to the second value', () =>  {
        it('should return 0', () => {
            const mockUserA: object = { firstName: 'Anna' };
            const mockUserB: object = { firstName: 'Anna' };

            expect(sortByAlphabet(mockUserA, mockUserB, 'firstName')).toBe(0);
        });
    });

    describe('when the first value or the second value is undefined', () =>  {
        it('should return 0', () => {
            const mockUserA: object = { firstName: 'Nick' };
            const mockUserB: object = {};

            expect(sortByAlphabet(mockUserA, mockUserB, 'firstName')).toBe(0);
        });
    });
});

describe(sortByDate.name, () => {
    describe('when the first value is less than the second value', () =>  {
        it('should return a negative number', () => {
            const mockUserA: object = { birthDate: '1989-05-12' };
            const mockUserB: object = { birthDate: '1993-01-24' };

            expect(sortByAlphabet(mockUserA, mockUserB, 'birthDate')).toBeLessThan(0);
        });
    });

    describe('when the first value is greater than the second value', () =>  {
        it('should return a positive number', () => {
            const mockUserA: object = { birthDate: '2001-11-11' };
            const mockUserB: object = { birthDate: '1973-08-12' };

            expect(sortByAlphabet(mockUserA, mockUserB, 'birthDate')).toBeGreaterThan(0);
        });
    });

    describe('when the first value is equal to the second value', () =>  {
        it('should return 0', () => {
            const mockUserA: object = { birthDate: '2001-11-11' };
            const mockUserB: object = { birthDate: '2001-11-11' };

            expect(sortByAlphabet(mockUserA, mockUserB, 'birthDate')).toBe(0);
        });
    });
});
