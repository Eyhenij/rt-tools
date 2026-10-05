/** Three channels of an sRGB colour, each 0–255. */
export type TRgbChannels = readonly [number, number, number];

const SHORT_HEX: RegExp = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const FULL_HEX: RegExp = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

/**
 * Reads `#rgb` or `#rrggbb`, with or without the leading `#`, into its three channels — shared by
 * `darkenHex` and `textColorOnBackground`. Anything else is not a colour and yields `null`.
 */
export function parseHexColor(value: string): TRgbChannels | null {
    const short: RegExpExecArray | null = SHORT_HEX.exec(value);
    if (short !== null) {
        return [parseInt(short[1].repeat(2), 16), parseInt(short[2].repeat(2), 16), parseInt(short[3].repeat(2), 16)];
    }

    const full: RegExpExecArray | null = FULL_HEX.exec(value);
    if (full !== null) {
        return [parseInt(full[1], 16), parseInt(full[2], 16), parseInt(full[3], 16)];
    }

    return null;
}
