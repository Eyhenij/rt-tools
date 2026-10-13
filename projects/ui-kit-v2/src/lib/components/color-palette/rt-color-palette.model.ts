/**
 * Модель `<rt-color-palette>`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtColorPalette {
    /** Один образец палитры. */
    export interface Swatch {
        /** Цвет образца, `#rrggbb` строчными. */
        hex: string;
        /** Образец своего цвета: значения, которого нет среди цветов палитры. */
        custom: boolean;
    }

    /** Цвет в оттенке (градусы, 0–360), насыщенности и яркости (доли, 0–1) — так его держит выбор своего цвета. */
    export interface Hsv {
        h: number;
        s: number;
        v: number;
    }

    /** Цвет в каналах красного, зелёного и синего, каждый — целое от 0 до 255. */
    export interface Rgb {
        r: number;
        g: number;
        b: number;
    }

    /** Канал цвета, который правится своим полем выбора. */
    export type Channel = keyof Rgb;
}
