import { rtAiChatChartData, rtAiChatChartFormat } from './ai-chat-chart.data';
import { ERtAiChatChartFormat, ERtAiChatChartKind } from './ai-chat-chart.enum';
import { IRtAiChatChart } from './ai-chat-chart.model';
import { RT_AI_CHAT_CHART_SAMPLES } from './ai-chat-chart.samples';

type TData = ReturnType<typeof rtAiChatChartData>;
type TCartesian = Extract<TData, { kind: 'cartesian' }>;
type TSeries = TCartesian['series'][number];
type TFormat = ReturnType<typeof rtAiChatChartFormat>;

const LOCALE: string = 'en';

function dataOf(kind: ERtAiChatChartKind): TData {
    return rtAiChatChartData(RT_AI_CHAT_CHART_SAMPLES[kind], LOCALE);
}

function cartesianOf(spec: IRtAiChatChart.Spec): TCartesian {
    const data: TData = rtAiChatChartData(spec, LOCALE);
    if (data.kind !== 'cartesian') {
        throw new Error(`cartesian expected, got ${data.kind}`);
    }

    return data;
}

describe('rtAiChatChartData', (): void => {
    it('SC-UKV-1341 — each of the ten kinds becomes its rt-chart shape', (): void => {
        const shapes: Record<string, string> = Object.fromEntries(
            Object.values(ERtAiChatChartKind).map((kind: ERtAiChatChartKind): [string, string] => [kind, dataOf(kind).kind])
        );

        expect(shapes).toEqual({
            line: 'cartesian',
            bar: 'cartesian',
            grouped_bar: 'cartesian',
            stacked_bar: 'cartesian',
            histogram: 'cartesian',
            pie: 'pie',
            heatmap: 'heatmap',
            scatter: 'scatter',
            treemap: 'treemap',
            sunburst: 'sunburst',
        });
    });

    it('SC-UKV-1342 — the series of a cartesian spec become categories and named series', (): void => {
        const data: TCartesian = cartesianOf(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.LINE]);

        expect(data.categories).toEqual(['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн']);
        expect(data.series.map((one: TSeries): string => one.name)).toEqual(['Выручка', 'Расходы']);
        expect(data.series.every((one: TSeries): boolean => one.type === 'line')).toBe(true);
    });

    it('SC-UKV-1343 — a negative grouped bar keeps its sign', (): void => {
        const data: TCartesian = cartesianOf(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.GROUPED_BAR]);

        expect(data.series[0].values[2]).toBe(-10);
        expect(data.series.every((one: TSeries): boolean => one.type === 'bar' && one.stack === undefined)).toBe(true);
    });

    it('SC-UKV-1344 — a zero stays a value, not a missing point', (): void => {
        const data: TCartesian = cartesianOf(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.GROUPED_BAR]);

        expect(data.series[0].values[4]).toBe(0);
    });

    it('SC-UKV-1345 — stacked bars share one stack', (): void => {
        const data: TCartesian = cartesianOf(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.STACKED_BAR]);
        const stacks: Set<string | undefined> = new Set(data.series.map((one: TSeries): string | undefined => one.stack));

        expect(stacks.size).toBe(1);
        expect([...stacks][0]).toBeDefined();
    });

    it('SC-UKV-1346 — the trees nest by their paths, equal paths sum, an inner path keeps its value', (): void => {
        const spec: IRtAiChatChart.Spec = {
            kind: ERtAiChatChartKind.TREEMAP,
            hierarchy: [
                { path: ['A', 'x'], value: 2 },
                { path: ['A', 'x'], value: 3 },
                { path: ['A'], value: 4 },
                { path: ['B'], value: 1 },
            ],
        };

        expect(rtAiChatChartData(spec, LOCALE)).toEqual(
            expect.objectContaining({
                kind: 'treemap',
                nodes: [
                    { name: 'A', value: 4, children: [{ name: 'x', value: 5 }] },
                    { name: 'B', value: 1 },
                ],
            })
        );
    });

    it('SC-UKV-1361 — a later series adds its new categories at the end, a gap is empty', (): void => {
        const spec: IRtAiChatChart.Spec = {
            kind: ERtAiChatChartKind.LINE,
            series: [
                {
                    name: 'A',
                    points: [
                        { x: 'Jan', y: 1 },
                        { x: 'Feb', y: 2 },
                        { x: 'Mar', y: 3 },
                    ],
                },
                {
                    name: 'B',
                    points: [
                        { x: 'Feb', y: 5 },
                        { x: 'Apr', y: 6 },
                    ],
                },
            ],
        };
        const data: TCartesian = cartesianOf(spec);

        expect(data.categories).toEqual(['Jan', 'Feb', 'Mar', 'Apr']);
        expect(data.series[1].values).toEqual([null, 5, null, 6]);
    });

    it('SC-UKV-1362 — a histogram gets one more bound than bars', (): void => {
        const data: TCartesian = cartesianOf(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.HISTOGRAM]);

        expect(data.place).toBe('bins');
        expect(data.categories).toEqual(['1', '3', '5', '7', '9']);
        expect(data.series[0].values).toEqual([4, 11, 7, 3]);
    });

    it('SC-UKV-1352 — the number format groups the digits and keeps up to two fraction digits', (): void => {
        expect(rtAiChatChartFormat({ kind: ERtAiChatChartKind.LINE }, LOCALE)(1250000.567)).toBe('1,250,000.57');
    });

    it('SC-UKV-1353 — the percent format reads 0.25 as 25 %', (): void => {
        const format: TFormat = rtAiChatChartFormat({ kind: ERtAiChatChartKind.PIE, format: ERtAiChatChartFormat.PERCENT }, LOCALE);

        expect(format(0.25)).toBe('25%');
        expect(format(0.1234)).toBe('12.3%');
    });

    it('SC-UKV-1354 — the currency format signs the currency of the spec', (): void => {
        const spec: IRtAiChatChart.Spec = { kind: ERtAiChatChartKind.BAR, format: ERtAiChatChartFormat.CURRENCY, currency: 'EUR' };

        expect(rtAiChatChartFormat(spec, LOCALE)(1200)).toBe('€1,200.00');
    });

    it('SC-UKV-1370 — the formats follow the locale they are given', (): void => {
        expect(rtAiChatChartFormat({ kind: ERtAiChatChartKind.LINE }, 'de')(1234.5)).toBe('1.234,5');
    });

    it('SC-UKV-1377 — a category is never signed by the format', (): void => {
        const spec: IRtAiChatChart.Spec = {
            kind: ERtAiChatChartKind.BAR,
            format: ERtAiChatChartFormat.PERCENT,
            series: [{ name: 'Y', points: [{ x: '2024', y: 0.5 }] }],
        };

        expect(cartesianOf(spec).categories).toEqual(['2024']);
    });
});
