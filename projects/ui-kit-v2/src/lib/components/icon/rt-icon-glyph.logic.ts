import { iconMaterialMap, IRtIconMaterialEntry } from './rt-icon-material-map';
import { iconsName } from './rt-icon-names';
import { IRtIcon } from './rt-icon.model';

const KIT_NAMES: ReadonlySet<string> = new Set<string>(iconsName);

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

/**
 * Чем рисуется значок: своим рисунком кита или лигатурой шрифта Material.
 *
 * Имя кита выигрывает у имени Material, если названы оба. Имя Material по способу `map-first`
 * берёт пару из перечня, а без пары — шрифт; по способу `font` — шрифт сразу. Материальный рисунок
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
    if (strategy === 'map-first') {
        const pair: IRtIcon.Name | null = isKitIconName(glyph) ? glyph : materialPairOf(glyph);
        if (pair !== null) {
            return { kind: 'kit', name: pair };
        }
    }
    return { kind: 'font', glyph };
}
