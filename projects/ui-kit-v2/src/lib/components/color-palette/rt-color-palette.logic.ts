import { RT_COLOR_PALETTE_DEFAULT } from './rt-color-palette.const';
import { IRtColorPalette } from './rt-color-palette.model';

const SHORT_HEX: RegExp = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const FULL_HEX: RegExp = /^#?([0-9a-f]{6})$/i;
const CHANNEL: RegExp = /^\d{1,3}$/;

/** Шаг стрелки: по площади — двадцатая доля насыщенности и яркости, по полосе — шесть градусов оттенка. */
const AREA_STEP: number = 0.05;
const HUE_STEP: number = 6;

/** Сдвиг оттенка стрелкой по полосе: вправо и вверх — дальше по кругу, влево и вниз — назад. */
const HUE_MOVES: Readonly<Partial<Record<string, number>>> = {
    ArrowRight: HUE_STEP,
    ArrowUp: HUE_STEP,
    ArrowLeft: -HUE_STEP,
    ArrowDown: -HUE_STEP,
};

/** Сдвиг стрелкой по площади: вправо и влево — насыщенность, вверх и вниз — яркость. */
const AREA_MOVES: Readonly<Partial<Record<string, readonly ['s' | 'v', number]>>> = {
    ArrowRight: ['s', AREA_STEP],
    ArrowLeft: ['s', -AREA_STEP],
    ArrowUp: ['v', AREA_STEP],
    ArrowDown: ['v', -AREA_STEP],
};

/** Опорные оттенки полосы: шесть вершин круга и возврат к красному. */
const SPECTRUM_HUES: readonly number[] = [0, 60, 120, 180, 240, 300, 0];

/** Доля в пределах от нуля до единицы. */
function clamp(value: number): number {
    return Math.min(1, Math.max(0, value));
}

/**
 * Цвет поля в его единственном виде: `#rrggbb` строчными. Трёхзначная запись разворачивается, решётка
 * дописывается. Всё остальное — не цвет: поле рисует его как «цвет не выбран».
 */
export function colorPaletteHex(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const text: string = value.trim();
    const short: RegExpExecArray | null = SHORT_HEX.exec(text);

    if (short) {
        return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase();
    }

    const full: RegExpExecArray | null = FULL_HEX.exec(text);

    return full ? `#${full[1].toLowerCase()}` : null;
}

/**
 * Образцы палитры: цвета входа по порядку, без них — набор кита. Значение, которого среди них нет,
 * встаёт ещё одним образцом в конце: человек видит, что выбран свой цвет, и может вернуться к нему.
 * Неверные цвета входа и повторы отбрасываются — образцу нужен цвет, а номеру в группе единственность.
 */
export function colorPaletteSwatches(colors: readonly string[], value: string | null): IRtColorPalette.Swatch[] {
    const source: readonly string[] = colors.length > 0 ? colors : RT_COLOR_PALETTE_DEFAULT;
    const seen: Set<string> = new Set<string>();
    const swatches: IRtColorPalette.Swatch[] = [];

    for (const color of source) {
        const hex: string | null = colorPaletteHex(color);

        if (hex !== null && !seen.has(hex)) {
            seen.add(hex);
            swatches.push({ hex, custom: false });
        }
    }

    if (value !== null && !seen.has(value)) {
        swatches.push({ hex: value, custom: true });
    }

    return swatches;
}

/**
 * Куда клавиша переводит выбор среди образцов: стрелки идут по кругу, Home и End берут крайние.
 * Строки образцов зависят от ширины поля, поэтому вверх и вниз значат «назад» и «вперёд», как в
 * группе переключателей. `null` — клавиша не про выбор.
 */
export function colorPaletteNextIndex(key: string, current: number, count: number): number | null {
    if (count === 0) {
        return null;
    }

    switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
            return current < 0 ? 0 : (current + 1) % count;
        case 'ArrowUp':
        case 'ArrowLeft':
            return current < 0 ? count - 1 : (current - 1 + count) % count;
        case 'Home':
            return 0;
        case 'End':
            return count - 1;
        default:
            return null;
    }
}

/** Цвет `#rrggbb` в оттенке, насыщенности и яркости. Оттенок серого — ноль. */
export function colorPaletteToHsv(hex: string): IRtColorPalette.Hsv {
    const r: number = parseInt(hex.slice(1, 3), 16) / 255;
    const g: number = parseInt(hex.slice(3, 5), 16) / 255;
    const b: number = parseInt(hex.slice(5, 7), 16) / 255;
    const max: number = Math.max(r, g, b);
    const delta: number = max - Math.min(r, g, b);

    let h: number = 0;

    if (delta > 0) {
        if (max === r) {
            h = 60 * (((g - b) / delta + 6) % 6);
        } else if (max === g) {
            h = 60 * ((b - r) / delta + 2);
        } else {
            h = 60 * ((r - g) / delta + 4);
        }
    }

    return { h, s: max === 0 ? 0 : delta / max, v: max };
}

/** Оттенок, насыщенность и яркость в цвете `#rrggbb`. */
export function colorPaletteFromHsv(hsv: IRtColorPalette.Hsv): string {
    const h: number = (((hsv.h % 360) + 360) % 360) / 60;
    const s: number = clamp(hsv.s);
    const v: number = clamp(hsv.v);
    const chroma: number = v * s;
    const x: number = chroma * (1 - Math.abs((h % 2) - 1));
    const m: number = v - chroma;
    const sector: number = Math.floor(h);
    const [r, g, b]: [number, number, number] = (
        [
            [chroma, x, 0],
            [x, chroma, 0],
            [0, chroma, x],
            [0, x, chroma],
            [x, 0, chroma],
            [chroma, 0, x],
        ] as [number, number, number][]
    )[sector % 6];

    return `#${[r, g, b]
        .map((channel: number): string =>
            Math.round((channel + m) * 255)
                .toString(16)
                .padStart(2, '0')
        )
        .join('')}`;
}

/**
 * Сдвиг выбранного стрелкой: по площади — насыщенность вправо и влево, яркость вверх и вниз; по полосе —
 * оттенок по кругу. `null` — клавиша не про сдвиг.
 */
export function colorPaletteStep(target: 'area' | 'hue', key: string, hsv: IRtColorPalette.Hsv): IRtColorPalette.Hsv | null {
    if (target === 'hue') {
        const delta: number | undefined = HUE_MOVES[key];

        return delta === undefined ? null : { ...hsv, h: (hsv.h + delta + 360) % 360 };
    }

    const move: readonly ['s' | 'v', number] | undefined = AREA_MOVES[key];

    if (move === undefined) {
        return null;
    }

    const [axis, delta]: readonly ['s' | 'v', number] = move;

    return { ...hsv, [axis]: clamp(hsv[axis] + delta) };
}

/** Цвет `#rrggbb` в каналах красного, зелёного и синего. */
export function colorPaletteToRgb(hex: string): IRtColorPalette.Rgb {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
    };
}

/** Каналы красного, зелёного и синего в цвете `#rrggbb`. */
export function colorPaletteFromRgb(rgb: IRtColorPalette.Rgb): string {
    return `#${[rgb.r, rgb.g, rgb.b].map((channel: number): string => channel.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Значение канала из набранного в поле: целое от 0 до 255 без знаков и дробей. Всё остальное — `null`,
 * и поле не меняет выбранного, пока ввод не окончен.
 */
export function colorPaletteChannel(text: string): number | null {
    const trimmed: string = text.trim();

    if (!CHANNEL.test(trimmed)) {
        return null;
    }

    const value: number = Number(trimmed);

    return value <= 255 ? value : null;
}

/** Полоса оттенков слева направо: градиент по вершинам круга в полной насыщенности и яркости. */
export function colorPaletteSpectrum(): string {
    const stops: string[] = SPECTRUM_HUES.map((h: number): string => colorPaletteFromHsv({ h, s: 1, v: 1 }));

    return `linear-gradient(to right, ${stops.join(', ')})`;
}

/**
 * Площадь насыщенности и яркости для оттенка `hue`: внизу чёрный, и вверх цвет ярче; слева белый, и
 * вправо цвет насыщеннее до чистого оттенка. Это математика цвета, а не оформление: слои — края
 * пространства цвета.
 */
export function colorPaletteArea(hue: string): string {
    const white: string = colorPaletteFromHsv({ h: 0, s: 0, v: 1 });
    const black: string = colorPaletteFromHsv({ h: 0, s: 0, v: 0 });

    return `linear-gradient(to top, ${black}, transparent), linear-gradient(to right, ${white}, ${hue})`;
}
