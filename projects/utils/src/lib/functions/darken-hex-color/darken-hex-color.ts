import { parseHexColor, TRgbChannels } from '../internal/hex-color.js';

function toHexPair(channel: number): string {
    return channel.toString(16).padStart(2, '0');
}

/**
 * @description Darkens a hex colour by a percent: every channel is multiplied by
 * `1 - percent / 100` and rounded down.
 *
 * Takes `#rgb` or `#rrggbb`, with or without `#`, and returns `#rrggbb`. A value that is not a hex
 * colour comes back as it came.
 */
export function darkenHexColor(hex: string, percent: number): string {
    const channels: TRgbChannels | null = parseHexColor(hex);

    if (channels === null) {
        return hex;
    }

    const factor: number = 1 - percent / 100;

    return `#${channels.map((channel: number): string => toHexPair(Math.floor(channel * factor))).join('')}`;
}
