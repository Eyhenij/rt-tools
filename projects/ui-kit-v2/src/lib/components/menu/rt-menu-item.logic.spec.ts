import { menuItemIconName, unpairedGlyph } from './rt-menu-item.logic';

/** Имя, которого в перечне кита нет и не будет: по форме его туда не взять. */
const NO_PAIR: string = 'no_such_glyph_for_test';

describe('rt-menu-item.logic', (): void => {
    describe('menuItemIconName', (): void => {
        it('свой icon сильнее имени Material', (): void => {
            expect(menuItemIconName('ico-eye', 'done')).toBe('ico-eye');
        });

        it('имя Material рисуется своей парой, а имя без пары — ничем', (): void => {
            expect(menuItemIconName(null, 'done')).toBe('check');
            expect(menuItemIconName(null, NO_PAIR)).toBeNull();
            expect(menuItemIconName(null, null)).toBeNull();
        });
    });

    describe('unpairedGlyph', (): void => {
        it('предупреждает об имени без пары, когда значка у пункта нет вовсе', (): void => {
            expect(unpairedGlyph(null, NO_PAIR, false)).toBe(NO_PAIR);
        });

        it('молчит, когда значок есть: пара, свой icon или свой значок приложения', (): void => {
            expect(unpairedGlyph(null, 'done', false)).toBeNull();
            expect(unpairedGlyph('ico-eye', NO_PAIR, false)).toBeNull();
            expect(unpairedGlyph(null, NO_PAIR, true)).toBeNull();
            expect(unpairedGlyph(null, null, false)).toBeNull();
        });
    });
});
