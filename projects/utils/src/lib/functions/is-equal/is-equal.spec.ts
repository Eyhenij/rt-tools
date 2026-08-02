import { isEqual } from './is-equal.js';

describe(isEqual.name, () => {
    it('should report equal objects as equal regardless of key order', () => {
        expect(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    });

    it('should report different objects as different', () => {
        expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('should compare primitives', () => {
        expect(isEqual(1, 1)).toBe(true);
        expect(isEqual('ab', 'ab')).toBe(true);
        expect(isEqual(1, 2)).toBe(false);
    });

    it('should compare arrays irrespective of element order', () => {
        expect(isEqual([1, 2], [2, 1])).toBe(true);
    });

    it('should collide on anagrams — the known limitation of the character-sort approach', () => {
        expect(isEqual({ ab: 1 }, { ba: 1 })).toBe(true);
    });

    it('should throw on a cyclic structure, as JSON.stringify does', () => {
        const cyclic: Record<string, unknown> = {};
        cyclic['self'] = cyclic;

        expect(() => isEqual(cyclic, cyclic)).toThrow(TypeError);
    });
});
