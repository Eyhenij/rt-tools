import { isRecord } from './is-record.js';

describe(isRecord.name, () => {
    it('should return true for object literals', () => {
        expect(isRecord({})).toBe(true);
        expect(isRecord({ a: 1 })).toBe(true);
    });

    it('should return false for arrays, dates and class instances', () => {
        expect(isRecord([])).toBe(false);
        expect(isRecord(new Date())).toBe(false);
        expect(isRecord(new Map())).toBe(false);
    });

    it('should return false for nullish values', () => {
        expect(isRecord(null)).toBe(false);
        expect(isRecord(undefined)).toBe(false);
    });

    it('should return false for primitives', () => {
        expect(isRecord('text')).toBe(false);
        expect(isRecord(1)).toBe(false);
    });

    it('should return false for a prototype-less object', () => {
        expect(isRecord(Object.create(null))).toBe(false);
    });
});
