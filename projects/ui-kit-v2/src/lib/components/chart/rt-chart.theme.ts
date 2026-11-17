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

/** Тема `echarts` из цветов кита: палитра серий, подписи, оси и сетка. */
export function rtChartTheme(colors: IRtChartColors): ThemeOption {
    const axis: ThemeOption = {
        axisLine: { lineStyle: { color: colors.line } },
        axisTick: { lineStyle: { color: colors.line } },
        axisLabel: { color: colors.muted },
        splitLine: { lineStyle: { color: [colors.line] } },
        nameTextStyle: { color: colors.muted },
    };

    return {
        color: [...colors.series],
        backgroundColor: 'transparent',
        textStyle: { color: colors.text, fontFamily: colors.font },
        legend: { textStyle: { color: colors.text } },
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
