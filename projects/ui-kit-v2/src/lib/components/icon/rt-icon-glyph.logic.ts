import { iconMaterialMap, IRtIconMaterialEntry } from './rt-icon-material-map';
import { iconsName } from '@rt-tools/ui-kit-v2/core';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

const KIT_NAMES: ReadonlySet<string> = new Set<string>(iconsName);

/** Имя лигатуры Material Symbols: строчные латинские буквы, цифры и подчёркивание. */
const LIGATURE_NAME: RegExp = /^[a-z0-9_]+$/;

/** Имя значка кита — то, что рисует спрайт; остальное кит своим рисунком не закрывает. */
export function isKitIconName(name: string): name is IRtIcon.Name {
    return KIT_NAMES.has(name);
}

/** Пара имени Material из перечня кита; `null` — пары нет или имени нет. */
export function materialPairOf(glyph: string | null | undefined): IRtIcon.Name | null {
    if (!glyph) {
        return null;
    }
    return iconMaterialMap.find((entry: IRtIconMaterialEntry): boolean => entry.from === glyph)?.to ?? null;
}

function kitOrPairOf(glyph: string): IRtIcon.Name | null {
    return isKitIconName(glyph) ? glyph : materialPairOf(glyph);
}

/** Имя кита, которое шрифт нарисовать не может: дефис или заглавная буква. Лигатура — `null`. */
function unlettered(glyph: string): IRtIcon.Name | null {
    return isKitIconName(glyph) && !LIGATURE_NAME.test(glyph) ? glyph : null;
}

/**
 * Чем рисуется значок: своим рисунком кита или лигатурой шрифта Material.
 *
 * Имя кита выигрывает у имени Material, если названы оба. Имя Material по способу `map-first`
 * берёт пару из перечня, а без пары — шрифт; по способу `font` — шрифт сразу. Имя кита, которое шрифт
 * нарисовать не может (`ico-plus`, `docBox`), и по способу `font` рисуется рисунком кита: иначе в
 * значке стоит текст имени. Имя кита, совпавшее с лигатурой (`search`), по `font` — шрифт. Материальный рисунок
 * для пары выбирает уже сам значок по признаку набора над собой: это не дело разбора.
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
    const pair: IRtIcon.Name | null = strategy === 'map-first' ? kitOrPairOf(glyph) : unlettered(glyph);
    return pair === null ? { kind: 'font', glyph } : { kind: 'kit', name: pair };
}
