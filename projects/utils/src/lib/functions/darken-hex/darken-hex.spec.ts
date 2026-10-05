import { darkenHex } from './darken-hex.js';

describe('darkenHex', () => {
    it('darkens every channel by the percent, rounding down', () => {
        expect(darkenHex('#ffffff', 50)).toBe('#7f7f7f');
        expect(darkenHex('#facc15', 30)).toBe('#af8e0e');
    });

    it('keeps the colour at 0% and gives black at 100%', () => {
        expect(darkenHex('#3b82f6', 0)).toBe('#3b82f6');
        expect(darkenHex('#3b82f6', 100)).toBe('#000000');
    });

    it.each(['#abc', 'abc', 'aabbcc'])('reads %s in full', (color: string) => {
        expect(darkenHex(color, 0)).toBe('#aabbcc');
    });

    it('returns a value that is not a colour as it came', () => {
        expect(darkenHex('transparent', 50)).toBe('transparent');
    });
});
