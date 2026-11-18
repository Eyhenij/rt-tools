import { IRtChart } from './rt-chart.model';

/** Фигура сцены: путь SVG и то, чем он закрашен. Цвета — значения CSS, токены кита. */
export interface IRtChartPath {
    readonly key: string;
    readonly d: string;
    readonly fill: string;
    readonly stroke: string;
    readonly width: number;
    readonly dash: string | null;
    readonly opacity: number;
    /** Сдвиг фигуры: секторы строятся вокруг нуля. */
    readonly transform: string | null;
    /** Строки подсказки над фигурой; пусто — фигура подсказки не даёт. */
    readonly tip: readonly string[];
}

/** Подпись сцены. */
export interface IRtChartText {
    readonly key: string;
    readonly x: number;
    readonly y: number;
    readonly text: string;
    readonly anchor: 'start' | 'middle' | 'end';
    readonly fill: string;
    readonly size: number;
    readonly weight: number;
}

/** Пункт легенды. */
export interface IRtChartLegendItem {
    readonly name: string;
    readonly color: string;
    readonly mark: IRtChart.TMark;
}

/** Шкала плотности под тепловой картой: подписи краёв и плашки цвета по ступеням плотности. */
export interface IRtChartScale {
    readonly low: string;
    readonly high: string;
    readonly color: string;
    readonly steps: readonly number[];
}

/** Всё, что рисует график: фигуры, подписи, легенда и шкала плотности, если она есть. */
export interface IRtChartScene {
    readonly paths: readonly IRtChartPath[];
    readonly texts: readonly IRtChartText[];
    readonly legend: readonly IRtChartLegendItem[];
    readonly scale?: IRtChartScale;
}

/** Размер поля графика без легенды. */
export interface IRtChartSize {
    readonly width: number;
    readonly height: number;
}

/** Ширина подписи в точках при данном кегле. */
export type TRtChartMeasure = (text: string, size: number) => number;

/** Ось значений после подбора: границы, шаг и отметки. */
export interface IRtChartAxis {
    readonly min: number;
    readonly max: number;
    readonly step: number;
    readonly ticks: readonly number[];
}

/** Кегль подписей осей. */
export const RT_CHART_AXIS_FONT: number = 11;

/** Отступ поля над верхней линией сетки. */
export const RT_CHART_TOP: number = 8;

/** Полоса подписей категорий под нижней линией сетки. */
export const RT_CHART_BOTTOM: number = 20;

/** Наименьший отступ сетки слева, под подписи значений. */
export const RT_CHART_LEFT_MIN: number = 32;

/** Промежуток между подписью значения и сеткой. */
export const RT_CHART_LABEL_GAP: number = 6;

/** На сколько подпись значения может выступать за левый край поля, в отступ контейнера: так в макете. */
const LEFT_HANG: number = 4;

/** Левый край сетки по самой широкой подписи значений: не меньше наименьшего отступа. */
export function rtChartLeft(widest: number): number {
    return Math.max(RT_CHART_LEFT_MIN, Math.ceil(widest) + RT_CHART_LABEL_GAP - LEFT_HANG);
}

/** Цвета кита для сцены: токены CSS, поэтому тёмное поддерево и смена темы не требуют перерисовки. */
export const RT_CHART_COLOR: Readonly<Record<'text' | 'muted' | 'line' | 'surface', string>> = {
    text: 'var(--rt-color-text-primary)',
    muted: 'var(--rt-color-text-muted)',
    line: 'var(--rt-color-border-subtle)',
    surface: 'var(--rt-color-bg-surface)',
};

/** Множители шага оси значений: 1, 2, 2.5 и 5 раз степень десяти. */
const NICE_STEPS: readonly number[] = [1, 2, 2.5, 5, 10];

/** Цвет слота палитры. */
export function rtChartSlot(slot: IRtChart.TSlot): string {
    return `var(--rt-color-chart-series-${slot})`;
}

/** Слот по порядку: первый элемент — первый слот, девятый — снова первый. */
export function rtChartSlotAt(index: number, own?: IRtChart.TSlot): IRtChart.TSlot {
    return own ?? (((index % 8) + 1) as IRtChart.TSlot);
}

/** Наименьший «круглый» шаг не меньше данного. */
export function rtChartNiceStep(raw: number): number {
    if (Number.isNaN(raw) || raw <= 0) {
        return 1;
    }

    const power: number = 10 ** Math.floor(Math.log10(raw));
    const factor: number = NICE_STEPS.find((step: number): boolean => step * power >= raw - power * 1e-9) ?? 10;

    return factor * power;
}

/**
 * Подбирает ось значений: заданное число промежутков с круглым шагом, от нуля или от круглого
 * значения ниже наименьшего. Свои границы и шаг оси берутся как есть.
 */
export function rtChartAxis(low: number, high: number, intervals: number, own: IRtChart.ValueAxis = {}): IRtChartAxis {
    const top: number = Math.max(high, own.max ?? high);
    let step: number = own.step ?? rtChartNiceStep((top - Math.min(0, low)) / intervals);
    let min: number = own.min ?? Math.floor(Math.min(0, low) / step) * step;

    while (own.step === undefined && own.min === undefined && min + step * intervals < top) {
        step = rtChartNiceStep(step * 1.01);
        min = Math.floor(Math.min(0, low) / step) * step;
    }

    const max: number = own.max ?? min + step * intervals;
    const ticks: number[] = [];

    for (let value: number = min; value <= max + step * 1e-9; value += step) {
        ticks.push(Number(value.toFixed(10)));
    }

    return { min, max, step, ticks };
}

/** Число на оси без хвоста плавающей точки. */
export function rtChartNumber(value: number): string {
    return String(Number(value.toFixed(6)));
}

/** Прямоугольник путём; со скруглением углов, если задан радиус. */
export function rtChartRect(x: number, y: number, width: number, height: number, radius: number = 0): string {
    const w: number = Math.max(0, width);
    const h: number = Math.max(0, height);
    const r: number = Math.min(radius, w / 2, h / 2);

    if (r <= 0) {
        return `M${x},${y}h${w}v${h}h${-w}Z`;
    }

    return (
        `M${x + r},${y}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}` +
        `h${-(w - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(h - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z`
    );
}

/** Круг путём. */
export function rtChartCircle(cx: number, cy: number, r: number): string {
    return `M${cx - r},${cy}a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 ${-2 * r},0Z`;
}

/** Залитая фигура без обводки. */
export function rtChartFill(key: string, d: string, fill: string, opacity: number = 1, tip: readonly string[] = []): IRtChartPath {
    return { key, d, fill, opacity, tip, stroke: 'none', width: 0, dash: null, transform: null };
}

/** Горизонтальная линия сетки толщиной 1. */
export function rtChartGridLine(key: string, x: number, y: number, width: number): IRtChartPath {
    return rtChartFill(key, rtChartRect(x, Math.round(y), width, 1), RT_CHART_COLOR.line);
}

/** Подпись оси приглушённым цветом. */
export function rtChartAxisText(key: string, x: number, y: number, text: string, anchor: IRtChartText['anchor']): IRtChartText {
    return { key, x, y, text, anchor, fill: RT_CHART_COLOR.muted, size: RT_CHART_AXIS_FONT, weight: 400 } satisfies IRtChartText;
}

/** Строка подсказки: имя и значение. */
export function rtChartTipLine(name: string, value: number | null | undefined, format?: IRtChart.TFormat): string {
    if (value === null || value === undefined) {
        return `${name}: —`;
    }

    return `${name}: ${format ? format(value) : rtChartNumber(value)}`;
}
