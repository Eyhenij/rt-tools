import { isDate } from '../is-date/index.js';
import { isDateValid } from './is-date-valid.js';

describe(isDateValid.name, () => {
    it('should return true for a Date holding a real instant', () => {
        expect(isDateValid(new Date(2024, 0, 15))).toBe(true);
    });

    it('should return false for an Invalid Date', () => {
        expect(isDateValid(new Date('nonsense'))).toBe(false);
    });

    it('should return true for the Unix epoch — it is a real instant', () => {
        expect(isDateValid(new Date(0))).toBe(true);
    });

    it('should return false when no date is passed', () => {
        expect(isDateValid()).toBe(false);
        expect(isDateValid(undefined)).toBe(false);
    });

    it('should agree with isDate on every input', () => {
        const values: unknown[] = [new Date(0), new Date(2024, 0, 15), new Date('nonsense'), undefined, '2024-01-15', 0, null];

        for (const value of values) {
            expect(isDateValid(value as Date)).toBe(isDate(value));
        }
    });

    it('should return false for values that merely look like dates', () => {
        expect(isDateValid('2024-01-15' as unknown as Date)).toBe(false);
    });
});
