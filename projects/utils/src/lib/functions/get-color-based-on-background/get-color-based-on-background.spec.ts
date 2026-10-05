import { darkenHexColor } from '../darken-hex-color/index.js';
import { getColorBasedOnBackground } from './get-color-based-on-background.js';

/**
 * Answers of the first kit's functions on the same colours: the text colour, then a darkening by
 * 30%. Taken by running the first kit's own code when the functions moved here; the first kit is not
 * imported, because this package must not depend on it.
 */
const FIRST_KIT_ANSWERS: readonly (readonly [string, string, string])[] = [
    ['#000000', '#fff', '#000000'],
    ['#ffffff', '#7f7f7f', '#b2b2b2'],
    ['#1f2937', '#fff', '#151c26'],
    ['#facc15', '#7d660a', '#af8e0e'],
    ['#3b82f6', '#1d417b', '#295bac'],
    ['#22c55e', '#11622f', '#178941'],
    ['#ef4444', '#772222', '#a72f2f'],
    ['#a3a3a3', '#515151', '#727272'],
    ['#757575', '#fff', '#515151'],
    ['#767676', '#3b3b3b', '#525252'],
    ['#f0f0f0', '#787878', '#a8a8a8'],
    ['#123456', '#fff', '#0c243c'],
    ['#ABCDEF', '#556677', '#778fa7'],
];

describe('getColorBasedOnBackground and darkenHexColor', () => {
    it('SC-UT-1 — white text on a dark background', () => {
        expect(getColorBasedOnBackground('#1f2937')).toBe('#fff');
        expect(getColorBasedOnBackground('#000')).toBe('#fff');
    });

    it('SC-UT-2 — darkened text on a light background', () => {
        expect(getColorBasedOnBackground('#ffffff')).toBe('#7f7f7f');
        expect(getColorBasedOnBackground('#facc15')).toBe('#7d660a');
    });

    it.each(['#fff', 'fff', 'ffffff'])('SC-UT-3 — %s is read as #ffffff', (color: string) => {
        expect(getColorBasedOnBackground(color)).toBe('#7f7f7f');
        expect(darkenHexColor(color, 50)).toBe('#7f7f7f');
    });

    it.each(['red', '', '#12345', '#ggg'])('SC-UT-4 — «%s» is not a colour', (value: string) => {
        expect(getColorBasedOnBackground(value)).toBe('#fff');
        expect(darkenHexColor(value, 50)).toBe(value);
    });

    it.each(FIRST_KIT_ANSWERS)('SC-UT-5 — %s answers as in the first kit', (color: string, text: string, darkened: string) => {
        expect(getColorBasedOnBackground(color)).toBe(text);
        expect(darkenHexColor(color, 30)).toBe(darkened);
    });
});
