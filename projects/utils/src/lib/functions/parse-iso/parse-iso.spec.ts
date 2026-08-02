import { isDate } from '../is-date/index.js';
import { parseISO } from './parse-iso.js';

describe(parseISO.name, () => {
    it('should parse ISO date strings', () => {
        const result: Date = parseISO('2024-01-15');

        expect(isDate(result)).toBe(true);
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(0);
        expect(result.getUTCDate()).toBe(15);
    });

    it('should parse ISO datetime strings', () => {
        const result: Date = parseISO('2024-01-15T14:30:00.000Z');

        expect(isDate(result)).toBe(true);
        expect(result.toISOString()).toBe('2024-01-15T14:30:00.000Z');
    });

    it('should return invalid date for empty string', () => {
        expect(isDate(parseISO(''))).toBe(false);
    });

    it('should return invalid date for non-string values', () => {
        expect(isDate(parseISO(null as unknown as string))).toBe(false);
        expect(isDate(parseISO(undefined as unknown as string))).toBe(false);
        expect(isDate(parseISO(20240115 as unknown as string))).toBe(false);
    });

    it('should return invalid date for unparseable strings', () => {
        expect(isDate(parseISO('not-a-date'))).toBe(false);
    });
});
