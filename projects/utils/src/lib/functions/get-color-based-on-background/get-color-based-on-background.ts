import { darkenHexColor } from '../darken-hex-color/index.js';
import { parseHexColor, TRgbChannels } from '../internal/hex-color.js';

/** Relative luminance above which a background counts as light and gets dark text. */
const LIGHT_LUMINANCE: number = 0.179;

/** How much a light background is darkened to become its own text colour, in percent. */
const TEXT_DARKENING_PERCENT: number = 50;

/** Text colour on a dark background. */
const WHITE_TEXT: string = '#fff';

/** One sRGB channel, 0–255, as linear light, 0–1: the formula of the relative luminance. */
function channelToLinear(channel: number): number {
    const srgb: number = channel / 255;

    return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * @description A readable text colour for a background: `#fff` on a dark one, the background
 * darkened by half on a light one.
 *
 * A background is light when its relative luminance is above 0.179. Takes `#rgb` or `#rrggbb`, with
 * or without `#`; a value that is not a hex colour gets `#fff`. On a six-digit colour with `#` it
 * answers as the first kit's function of the same name.
 */
export function getColorBasedOnBackground(backgroundColor: string): string {
    const channels: TRgbChannels | null = parseHexColor(backgroundColor);

    if (channels === null) {
        return WHITE_TEXT;
    }

    const [r, g, b]: number[] = channels.map(channelToLinear);
    const luminance: number = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    return luminance > LIGHT_LUMINANCE ? darkenHexColor(backgroundColor, TEXT_DARKENING_PERCENT) : WHITE_TEXT;
}
