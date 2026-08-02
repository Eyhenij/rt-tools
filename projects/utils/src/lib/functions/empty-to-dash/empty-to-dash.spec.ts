import { DASH } from '../../const/index.js';
import { emptyToDash } from './empty-to-dash.js';

describe(emptyToDash.name, () => {
    it('should replace null and undefined with a dash', () => {
        expect(emptyToDash(null)).toBe(DASH);
        expect(emptyToDash(undefined)).toBe(DASH);
    });

    it('should replace an empty string with a dash', () => {
        expect(emptyToDash('')).toBe(DASH);
    });

    it('should keep other falsy values as they are', () => {
        expect(emptyToDash(0)).toBe(0);
        expect(emptyToDash(false)).toBe(false);
    });

    it('should pass through present values unchanged', () => {
        const value: { a: number } = { a: 1 };

        expect(emptyToDash('text')).toBe('text');
        expect(emptyToDash(value)).toBe(value);
    });

    it('should not treat an empty array or object as empty', () => {
        expect(emptyToDash([])).toEqual([]);
        expect(emptyToDash({})).toEqual({});
    });
});
