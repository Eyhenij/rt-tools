import type { ECharts, EChartsCoreOption } from 'echarts/core';

import { RT_CHART_ECHARTS, RT_CHART_KINDS } from './rt-chart.registry';

/** Опция каждого вида: на ней вид обязан нарисовать хотя бы один путь. */
const OPTIONS: Readonly<Record<string, EChartsCoreOption>> = {
    line: { xAxis: { type: 'category', data: ['a', 'b'] }, yAxis: {}, series: [{ type: 'line', data: [1, 3] }] },
    bar: { xAxis: { type: 'category', data: ['a', 'b'] }, yAxis: {}, series: [{ type: 'bar', data: [1, 3] }] },
    pie: {
        series: [
            {
                type: 'pie',
                data: [
                    { name: 'a', value: 1 },
                    { name: 'b', value: 3 },
                ],
            },
        ],
    },
    heatmap: {
        xAxis: { type: 'category', data: ['a', 'b'] },
        yAxis: { type: 'category', data: ['x', 'y'] },
        visualMap: { min: 0, max: 4, calculable: true },
        series: [
            {
                type: 'heatmap',
                data: [
                    [0, 0, 1],
                    [1, 1, 3],
                ],
            },
        ],
    },
    scatter: {
        xAxis: {},
        yAxis: {},
        series: [
            {
                type: 'scatter',
                data: [
                    [1, 2],
                    [3, 4],
                ],
            },
        ],
    },
    treemap: {
        series: [
            {
                type: 'treemap',
                data: [
                    { name: 'a', value: 2 },
                    { name: 'b', value: 3 },
                ],
            },
        ],
    },
    sunburst: { series: [{ type: 'sunburst', data: [{ name: 'a', value: 2, children: [{ name: 'c', value: 1 }] }] }] },
};

function svgOf(option: EChartsCoreOption): string {
    const chart: ECharts = RT_CHART_ECHARTS.init(null, null, { renderer: 'svg', ssr: true, width: 400, height: 240 });

    try {
        chart.setOption({ animation: false, legend: {}, tooltip: {}, ...option });

        return chart.renderToSVGString();
    } finally {
        chart.dispose();
    }
}

describe('RT_CHART_ECHARTS', (): void => {
    beforeAll((): void => {
        // В jsdom нет холста, а им zrender меряет подписи: ширина подписи — по числу знаков.
        RT_CHART_ECHARTS.setPlatformAPI({ measureText: (text: string): { width: number } => ({ width: text.length * 7 }) });
    });

    it('SC-UKV-1337 — регистрирует ровно семь видов', (): void => {
        expect([...RT_CHART_KINDS].sort()).toEqual(Object.keys(OPTIONS).sort());
    });

    it.each(Object.keys(OPTIONS))('SC-UKV-1337 — вид %s рисует пути в SVG', (kind: string): void => {
        expect(svgOf(OPTIONS[kind])).toMatch(/<path /);
    });

    it('SC-UKV-1337 — вид вне набора не зарегистрирован', (): void => {
        const error: jest.SpyInstance = jest.spyOn(console, 'error').mockImplementation((): void => undefined);
        const missing: () => string[] = (): string[] =>
            error.mock.calls
                .map((call: unknown[]): string => String(call[0]))
                .filter((line: string): boolean => line.includes('not imported'));

        try {
            // Пара к отказу: вид из набора отказа не даёт.
            svgOf(OPTIONS['pie']);
            expect(missing()).toEqual([]);

            svgOf({ series: [{ type: 'radar', data: [{ value: [1, 2] }] }] });
            expect(missing().join('\n')).toContain('Series radar is used but not imported');
        } finally {
            error.mockRestore();
        }
    });
});
