import { materialPairOf } from '@rt-tools/ui-kit-v2/icon';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

/** Значок пункта: свой `icon`, а без него — пара имени Material из перечня кита. */
export function menuItemIconName(icon: IRtIcon.Name | null, glyph: string | null): IRtIcon.Name | null {
    if (icon !== null) {
        return icon;
    }
    return materialPairOf(glyph);
}

/**
 * Имя Material, о котором пункт должен предупредить: у него нет пары в перечне кита, а ни `icon`,
 * ни своего значка нет. Тогда пункт рисуется без значка, и без предупреждения пропуск не заметен.
 * `null` — предупреждать не о чем.
 */
export function unpairedGlyph(icon: IRtIcon.Name | null, glyph: string | null, hasOwnIcon: boolean): string | null {
    if (!glyph || hasOwnIcon || menuItemIconName(icon, glyph) !== null) {
        return null;
    }
    return glyph;
}
