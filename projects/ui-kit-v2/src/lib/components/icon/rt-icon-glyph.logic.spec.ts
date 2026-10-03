import { iconMaterialMap, IRtIconMaterialEntry } from './rt-icon-material-map';
import { isKitIconName, materialPairOf, resolveIconGlyph } from './rt-icon-glyph.logic';
import { IRtIcon } from './rt-icon.model';

/** Первая пара перечня — имя Material, у которого точно есть значок кита. */
const PAIRED: IRtIconMaterialEntry = iconMaterialMap.find(
    (entry: IRtIconMaterialEntry): boolean => entry.to !== null
) as IRtIconMaterialEntry;

/** Имя, которого нет ни в наборе кита, ни в перечне: такого имени Material у кита не будет. */
const UNPAIRED: string = 'zz_no_such_material_glyph';

describe('resolveIconGlyph', (): void => {
    it('SC-UKV-540 — имя кита выигрывает у имени Material, если названы оба', (): void => {
        expect(resolveIconGlyph('close', PAIRED.from, 'map-first')).toEqual({ kind: 'kit', name: 'close' });
        expect(resolveIconGlyph('close', UNPAIRED, 'font')).toEqual({ kind: 'kit', name: 'close' });
    });

    it('SC-UKV-541 — по способу map-first имя Material берёт пару, а без пары шрифт', (): void => {
        expect(materialPairOf(PAIRED.from)).toBe(PAIRED.to);
        expect(resolveIconGlyph(null, PAIRED.from, 'map-first')).toEqual({ kind: 'kit', name: PAIRED.to as IRtIcon.Name });
        expect(resolveIconGlyph(null, UNPAIRED, 'map-first')).toEqual({ kind: 'font', glyph: UNPAIRED });
        expect(isKitIconName('close')).toBe(true);
        expect(resolveIconGlyph(null, 'close', 'map-first')).toEqual({ kind: 'kit', name: 'close' });
    });

    it('SC-UKV-542 — по способу font имя Material всегда рисуется шрифтом', (): void => {
        expect(resolveIconGlyph(null, PAIRED.from, 'font')).toEqual({ kind: 'font', glyph: PAIRED.from });
    });

    it('без имени и без имени Material значку нечего рисовать', (): void => {
        expect(resolveIconGlyph(null, null, 'map-first')).toBeNull();
        expect(resolveIconGlyph(undefined, '', 'font')).toBeNull();
    });
});
