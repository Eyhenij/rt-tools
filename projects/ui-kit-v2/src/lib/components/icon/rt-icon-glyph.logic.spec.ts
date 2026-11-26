import { isKitIconName, kitNameOf, resolveIconGlyph } from './rt-icon-glyph.logic';

/** Имя Material, которого нет в наборе кита. */
const FOREIGN: string = 'arrow_back';

describe('resolveIconGlyph', (): void => {
    it('SC-UKV-540 — имя кита выигрывает у значения glyph, если названы оба', (): void => {
        expect(resolveIconGlyph('close', 'arrow-left', 'map-first')).toEqual({ kind: 'kit', name: 'close' });
        expect(resolveIconGlyph('close', FOREIGN, 'font')).toEqual({ kind: 'kit', name: 'close' });
    });

    it('SC-UKV-541 — по способу map-first имя кита на glyph рисуется рисунком, а другое имя шрифтом', (): void => {
        expect(resolveIconGlyph(null, 'arrow-left', 'map-first')).toEqual({ kind: 'kit', name: 'arrow-left' });
        expect(resolveIconGlyph(null, 'zz_no_such_glyph', 'map-first')).toEqual({ kind: 'font', glyph: 'zz_no_such_glyph' });
        expect(isKitIconName('close')).toBe(true);
        expect(resolveIconGlyph(null, 'close', 'map-first')).toEqual({ kind: 'kit', name: 'close' });
    });

    it.each<[string]>([['arrow_back'], ['delete'], ['add'], ['account_circle']])(
        'SC-UKV-1879 — имя первого кита %s в имя кита не переводится',
        (glyph: string): void => {
            expect(kitNameOf(glyph)).toBeNull();
            expect(resolveIconGlyph(null, glyph, 'map-first')).toEqual({ kind: 'font', glyph });
        }
    );

    it('SC-UKV-542 — по способу font имя кита, совпавшее с лигатурой, рисуется шрифтом', (): void => {
        expect(resolveIconGlyph(null, 'search', 'font')).toEqual({ kind: 'font', glyph: 'search' });
    });

    it('SC-UKV-774 — по способу font имя кита, которое шрифт не нарисует, рисуется рисунком кита', (): void => {
        expect(resolveIconGlyph(null, 'ico-plus', 'font')).toEqual({ kind: 'kit', name: 'ico-plus' });
        expect(resolveIconGlyph(null, 'docBox', 'font')).toEqual({ kind: 'kit', name: 'docBox' });
    });

    it('без имени и без значения glyph значку нечего рисовать', (): void => {
        expect(resolveIconGlyph(null, null, 'map-first')).toBeNull();
        expect(resolveIconGlyph(undefined, '', 'font')).toBeNull();
    });
});
