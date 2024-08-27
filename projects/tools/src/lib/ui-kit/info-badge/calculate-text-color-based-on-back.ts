export function darkenHexColor(hex: string, percent: number): string {
    /**
     * returns a darkened color depending on the color and percentage
     */
    hex = hex.replace(/^#/, '');

    if (hex.length === 3) {
        hex = hex
            .split('')
            .map((char: string) => char + char)
            .join('');
    }

    let r: number = parseInt(hex.substring(0, 2), 16);
    let g: number = parseInt(hex.substring(2, 4), 16);
    let b: number = parseInt(hex.substring(4, 6), 16);

    r = Math.floor(r * (1 - percent / 100));
    g = Math.floor(g * (1 - percent / 100));
    b = Math.floor(b * (1 - percent / 100));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function getColorBasedOnBackground(backgroundColor: string): string {
    backgroundColor = backgroundColor.substring(1);
    const r: number = parseInt(backgroundColor.substring(0, 2), 16);
    const g: number = parseInt(backgroundColor.substring(2, 4), 16);
    const b: number = parseInt(backgroundColor.substring(4, 6), 16);

    const srgb: number[] = [r / 255, g / 255, b / 255];
    const x: number[] = srgb.map((i: number): number => {
        if (i <= 0.04045) {
            return i / 12.92;
        } else {
            return Math.pow((i + 0.055) / 1.055, 2.4);
        }
    });

    const L: number = 0.2126 * x[0] + 0.7152 * x[1] + 0.0722 * x[2];

    /**
     * if the background color is light, it returns a darkened value, otherwise it is light
     */

    if (L > 0.179) {
        return darkenHexColor(backgroundColor, 50);
    }
    return '#fff';
}
