import { iconsName } from '@rt-tools/ui-kit-v2/core';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

const KIT_NAMES: ReadonlySet<string> = new Set<string>(iconsName);

/** Имя лигатуры Material Symbols: строчные латинские буквы, цифры и подчёркивание. */
const LIGATURE_NAME: RegExp = /^[a-z0-9_]+$/;

/** Имя значка кита — то, что рисует спрайт; остальное кит своим рисунком не закрывает. */
export function isKitIconName(name: string): name is IRtIcon.Name {
    return KIT_NAMES.has(name);
}

/** Значение `glyph`, равное имени кита; `null` — такого рисунка в ките нет. */
export function kitNameOf(glyph: string | null | undefined): IRtIcon.Name | null {
    return glyph && isKitIconName(glyph) ? glyph : null;
}

/** Имя кита, которое шрифт нарисовать не может: дефис или заглавная буква. Лигатура — `null`. */
function unlettered(glyph: string): IRtIcon.Name | null {
    return isKitIconName(glyph) && !LIGATURE_NAME.test(glyph) ? glyph : null;
}

/**
 * Чем рисуется значок: своим рисунком кита или лигатурой шрифта Material.
 *
 * Имя кита выигрывает у `glyph`, если названы оба. По способу `map-first` значение `glyph`, равное
 * имени кита, рисуется рисунком кита, а любое другое — шрифтом Material: перевода имён Material в
 * имена кита кит не делает. По способу `font` — шрифт сразу, но имя кита, которое шрифт нарисовать
 * не может (`ico-plus`, `docBox`), рисуется рисунком кита: иначе в значке стоит текст имени. Имя
 * кита, совпавшее с лигатурой (`search`), по `font` — шрифт.
 *
 * `null` — значку нечего рисовать.
 */
export function resolveIconGlyph(
    name: IRtIcon.Name | null | undefined,
    glyph: string | null | undefined,
    strategy: IRtIcon.GlyphStrategy
): IRtIcon.Resolved | null {
    if (name) {
        return { kind: 'kit', name };
    }
    if (!glyph) {
        return null;
    }
    const kit: IRtIcon.Name | null = strategy === 'map-first' ? kitNameOf(glyph) : unlettered(glyph);
    return kit === null ? { kind: 'font', glyph } : { kind: 'kit', name: kit };
}
