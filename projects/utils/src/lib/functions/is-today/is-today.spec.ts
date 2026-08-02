import { isToday } from './is-today.js';

describe(isToday.name, () => {
    it('should return true for now', () => {
        expect(isToday(new Date())).toBe(true);
    });

    it('should return true regardless of the clock time', () => {
        const now: Date = new Date();

        expect(isToday(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59))).toBe(true);
    });

    it('should return false for another day', () => {
        expect(isToday(new Date(2020, 0, 1))).toBe(false);
    });

    it('should return false for the same day in another year', () => {
        const now: Date = new Date();

        expect(isToday(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()))).toBe(false);
    });

    it('should return false for an Invalid Date', () => {
        expect(isToday(new Date('nonsense'))).toBe(false);
    });
});
