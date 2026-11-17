import type { ThemeOption } from 'ngx-echarts';

/** Число цветов серий у кита: `--rt-color-chart-series-1…8`. */
export const RT_CHART_SERIES_COUNT: number = 8;

/** Цвета темы, прочитанные с узла графика: серии, подписи, линии сетки, подложка. */
export interface IRtChartColors {
    readonly series: readonly string[];
    readonly text: string;
    readonly muted: string;
    readonly line: string;
    readonly surface: string;
    readonly font: string;
}

/**
 * Читает цвета графика с вычисленного стиля его узла.
 *
 * `echarts` не понимает `var()` и `light-dark()`, поэтому цвет берётся готовым значением с того
 * узла, где стоит график: так тёмное поддерево светлой страницы даёт тёмную палитру.
 */
export function rtChartReadColors(style: CSSStyleDeclaration): IRtChartColors {
    const read: (name: string) => string = (name: string): string => style.getPropertyValue(name).trim();
    const series: string[] = [];

    for (let index: number = 1; index <= RT_CHART_SERIES_COUNT; index++) {
        series.push(read(`--rt-color-chart-series-${index}`));
    }

    return {
        series,
        text: read('--rt-color-text-primary'),
        muted: read('--rt-color-text-muted'),
        line: read('--rt-color-border-subtle'),
        surface: read('--rt-color-bg-surface'),
        font: read('--rt-font-family-sans'),
    };
}

/** Ключ сравнения двух прочтений: тема графика пересобирается, только когда цвета разошлись. */
export function rtChartColorsKey(colors: IRtChartColors): string {
    return [...colors.series, colors.text, colors.muted, colors.line, colors.surface, colors.font].join('|');
}

/** Кегль подписей осей и шкалы цвета по макету графика. */
const AXIS_FONT_SIZE: number = 11;

/** Кегль подписей легенды по макету графика. */
const LEGEND_FONT_SIZE: number = 12;

/** Значок легенды — круг этого диаметра. */
const LEGEND_MARK: number = 8;

/** Толщина линии серии. */
const LINE_WIDTH: number = 2;

/** Наибольшая ширина столбика. */
const BAR_MAX_WIDTH: number = 12;

/**
 * Тема `echarts` из цветов кита: палитра серий, подписи, оси, сетка и легенда.
 *
 * Оси без линии и засечек: опору дают линии сетки, как в макете. Подписи осей и легенды —
 * приглушённым цветом, легенда — слева снизу круглыми значками. Линия серии — 2 точки и без
 * маркеров, столбик — не шире 12.
 */
export function rtChartTheme(colors: IRtChartColors): ThemeOption {
    const axis: ThemeOption = {
        axisLine: { show: false, lineStyle: { color: colors.line } },
        axisTick: { show: false },
        axisLabel: { color: colors.muted, fontSize: AXIS_FONT_SIZE },
        splitLine: { lineStyle: { color: [colors.line], width: 1 } },
        nameTextStyle: { color: colors.muted, fontSize: AXIS_FONT_SIZE },
    };

    return {
        color: [...colors.series],
        backgroundColor: 'transparent',
        textStyle: { color: colors.text, fontFamily: colors.font },
        legend: {
            left: 0,
            bottom: 0,
            icon: 'circle',
            itemWidth: LEGEND_MARK,
            itemHeight: LEGEND_MARK,
            itemGap: 12,
            textStyle: { color: colors.muted, fontSize: LEGEND_FONT_SIZE },
        },
        line: { symbol: 'none', lineStyle: { width: LINE_WIDTH } },
        bar: { barMaxWidth: BAR_MAX_WIDTH },
        // Точки сплошные: у `echarts` по умолчанию прозрачность 0.8, и значок легенды бледнеет вместе с ними.
        scatter: { itemStyle: { opacity: 1 } },
        // Швы между секторами и прямоугольниками — цвет подложки, а не белый по умолчанию: на
        // тёмной поверхности белый шов читается как ещё одна фигура.
        pie: {
            itemStyle: { borderColor: colors.surface },
            label: { color: colors.text, textBorderWidth: 0 },
        },
        sunburst: { itemStyle: { borderColor: colors.surface } },
        treemap: {
            itemStyle: { borderColor: colors.line },
            upperLabel: { color: colors.muted },
        },
        // Шкала цвета — один тон, первый цвет палитры, от прозрачного к плотному: величина, не имя.
        visualMap: {
            color: [colors.series[0], colors.series[0]],
            inRange: { colorAlpha: [0.15, 1] },
            textStyle: { color: colors.muted, fontSize: AXIS_FONT_SIZE },
        },
        tooltip: {
            backgroundColor: colors.surface,
            borderColor: colors.line,
            textStyle: { color: colors.text },
        },
        categoryAxis: axis,
        valueAxis: axis,
        timeAxis: axis,
        logAxis: axis,
    };
}
