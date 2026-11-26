import { menuItemIconName, unpairedGlyph } from './rt-menu-item.logic';

/** Имя, которого в наборе кита нет и не будет: по форме его туда не взять. */
const NO_PAIR: string = 'no_such_glyph_for_test';

describe('rt-menu-item.logic', (): void => {
    describe('menuItemIconName', (): void => {
        it('свой icon сильнее значения glyph', (): void => {
            expect(menuItemIconName('ico-eye', 'check')).toBe('ico-eye');
        });

        it('имя кита на glyph рисуется, а другое имя значка не даёт', (): void => {
            expect(menuItemIconName(null, 'check')).toBe('check');
            expect(menuItemIconName(null, NO_PAIR)).toBeNull();
            expect(menuItemIconName(null, null)).toBeNull();
        });

        it('SC-UKV-1880 — имя первого кита значка пункту не даёт', (): void => {
            expect(menuItemIconName(null, 'done')).toBeNull();
            expect(menuItemIconName(null, 'delete')).toBeNull();
        });
    });

    describe('unpairedGlyph', (): void => {
        it('предупреждает об имени вне набора, когда значка у пункта нет вовсе', (): void => {
            expect(unpairedGlyph(null, NO_PAIR, false)).toBe(NO_PAIR);
        });

        it('молчит, когда значок есть: имя кита, свой icon или свой значок приложения', (): void => {
            expect(unpairedGlyph(null, 'check', false)).toBeNull();
            expect(unpairedGlyph('ico-eye', NO_PAIR, false)).toBeNull();
            expect(unpairedGlyph(null, NO_PAIR, true)).toBeNull();
            expect(unpairedGlyph(null, null, false)).toBeNull();
        });
    });
});
