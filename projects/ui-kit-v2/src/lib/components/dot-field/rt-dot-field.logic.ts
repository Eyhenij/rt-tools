/** Сторона клетки сетки в пикселях. */
export const DOT_FIELD_CELL: number = 10;

/** Сторона точки в центре клетки. */
export const DOT_FIELD_DOT: number = 3;

/** Кадр рисуется раз в столько миллисекунд: ступенчатое движение — часть облика. */
export const DOT_FIELD_FRAME_MS: number = 90;

/** На столько сдвигается время шума за кадр. */
export const DOT_FIELD_TIME_STEP: number = 0.035;

const NOISE_SCALE: number = 0.075;
const THRESHOLD: number = 0.64;
const DITHER_SPREAD: number = 0.3;
const BAYER_4X4: readonly number[] = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((value: number): number => value / 16);

function hash(x: number, y: number): number {
    const value: number = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return value - Math.floor(value);
}

function fade(value: number): number {
    return value * value * (3 - 2 * value);
}

function lerp(from: number, to: number, amount: number): number {
    return from + (to - from) * amount;
}

function smoothstep(edge0: number, edge1: number, value: number): number {
    const amount: number = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
    return amount * amount * (3 - 2 * amount);
}

/** Шум значений: гладкая случайная поверхность от 0 до 1. */
function noise(x: number, y: number): number {
    const x0: number = Math.floor(x);
    const y0: number = Math.floor(y);
    const fx: number = fade(x - x0);
    const fy: number = fade(y - y0);

    const top: number = lerp(hash(x0, y0), hash(x0 + 1, y0), fx);
    const bottom: number = lerp(hash(x0, y0 + 1), hash(x0 + 1, y0 + 1), fx);

    return lerp(top, bottom, fy);
}

/**
 * Плотность поля в клетке: два слоя шума, сдвинутые временем, и поляна в центре, где точки редеют.
 *
 * @returns Число от 0 до 1.
 */
export function dotDensity(column: number, row: number, columns: number, rows: number, time: number): number {
    const x: number = column * NOISE_SCALE;
    const y: number = row * NOISE_SCALE;

    const broad: number = noise(x + time * 0.6, y + time * 0.25);
    const detail: number = noise(x * 2.3 - time * 0.4, y * 2.3 + time * 0.35);
    const field: number = broad * 0.72 + detail * 0.28;

    const dx: number = column / columns - 0.5;
    const dy: number = row / rows - 0.5;
    const clearing: number = smoothstep(0.12, 0.42, Math.sqrt(dx * dx + dy * dy));

    return field * (0.6 + 0.4 * clearing);
}

/**
 * Горит ли клетка: плотность сравнивается с порогом, который матрица Байера 4x4 сдвигает по
 * клеткам. Так края облаков выходят рваными, а не гладкими.
 */
export function isDotLit(density: number, column: number, row: number): boolean {
    const dither: number = BAYER_4X4[(row % 4) * 4 + (column % 4)];

    return density > THRESHOLD + (dither - 0.5) * DITHER_SPREAD;
}
