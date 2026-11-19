import type { IRtChart } from '../../lib/components/chart/rt-chart.model';

import { rtAiChatChartData, rtAiChatChartFormat } from './ai-chat-chart.data';
import { ERtAiChatChartFormat, ERtAiChatChartKind } from './ai-chat-chart.enum';
import { IRtAiChatChart } from './ai-chat-chart.model';
import { RT_AI_CHAT_CHART_SAMPLES } from './ai-chat-chart.samples';
import { IRtAiChatChartTable, IRtAiChatChartTableCell, IRtAiChatChartTableWords, rtAiChatChartTable } from './ai-chat-chart.table';

const WORDS: IRtAiChatChartTableWords = {
    category: 'Category',
    bin: 'Bin',
    value: 'Value',
    series: 'Series',
    x: 'X',
    y: 'Y',
    path: 'Path',
};

function texts(cells: readonly IRtAiChatChartTableCell[]): string[] {
    return cells.map((cell: IRtAiChatChartTableCell): string => cell.text);
}

function rowsOf(table: IRtAiChatChartTable): string[][] {
    return table.rows.map(texts);
}

/** Сколько строк даёт таблица по данным графика: записей у вида столько же. */
function entriesOf(data: IRtChart.TData, spec: IRtAiChatChart.Spec): number {
    switch (data.kind) {
        case 'cartesian':
            return data.categories.length - (data.place === 'bins' ? 1 : 0);
        case 'pie':
            return data.items.length;
        case 'heatmap':
            return data.rows.length;
        case 'scatter':
            return data.series.reduce((sum: number, one: IRtChart.ScatterSeries): number => sum + one.points.length, 0);
        default:
            return spec.hierarchy?.length ?? 0;
    }
}

describe('rtAiChatChartTable', (): void => {
    it('SC-UKV-1387 — a cartesian table follows the chart data: categories, a column per series, an empty cell for a missing point', (): void => {
        const spec: IRtAiChatChart.Spec = {
            kind: ERtAiChatChartKind.LINE,
            xLabel: 'Month',
            series: [
                {
                    name: 'Plan',
                    points: [
                        { x: 'Jan', y: 1 },
                        { x: 'Feb', y: 2 },
                        { x: 'Mar', y: 3 },
                    ],
                },
                {
                    name: 'Fact',
                    points: [
                        { x: 'Feb', y: 4 },
                        { x: 'Mar', y: 5 },
                    ],
                },
            ],
        };
        const table: IRtAiChatChartTable = rtAiChatChartTable(spec, 'en', WORDS);

        expect(texts(table.head)).toEqual(['Month', 'Plan', 'Fact']);
        expect(rowsOf(table)).toEqual([
            ['Jan', '1', ''],
            ['Feb', '2', '4'],
            ['Mar', '3', '5'],
        ]);
        expect(table.rows[0].map((cell: IRtAiChatChartTableCell): boolean => cell.numeric)).toEqual([false, true, true]);
    });

    it('SC-UKV-1387 — without an x axis name the first column is «Category», and stacked cells hold their own value', (): void => {
        const table: IRtAiChatChartTable = rtAiChatChartTable(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.STACKED_BAR], 'en', WORDS);

        expect(table.head[0].text).toBe('Category');
        expect(rowsOf(table)[0]).toEqual(['Янв', '10', '5']);
    });

    it('SC-UKV-1387 — for every sample kind the table holds a row per entry of the chart data', (): void => {
        for (const spec of Object.values(RT_AI_CHAT_CHART_SAMPLES)) {
            const data: IRtChart.TData = rtAiChatChartData(spec, 'en');

            expect(rtAiChatChartTable(spec, 'en', WORDS).rows).toHaveLength(entriesOf(data, spec));
        }
    });

    it('SC-UKV-1388 — negatives and zeros stand as the chart format writes them', (): void => {
        const spec: IRtAiChatChart.Spec = RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.GROUPED_BAR];
        const format: IRtChart.TFormat = rtAiChatChartFormat(spec, 'ru');
        const rows: string[][] = rowsOf(rtAiChatChartTable(spec, 'ru', WORDS));

        expect(spec.format).toBe(ERtAiChatChartFormat.CURRENCY);
        expect(rows[2]).toEqual(['Мар', format(-10), format(20)]);
        expect(rows[4]).toEqual(['Май', format(0), format(25)]);
        expect(rows[4][1]).not.toBe('');
    });

    it('SC-UKV-1389 — pie gives a row per sector', (): void => {
        const table: IRtAiChatChartTable = rtAiChatChartTable(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.PIE], 'en', WORDS);

        expect(texts(table.head)).toEqual(['Category', 'Value']);
        expect(rowsOf(table).map((row: string[]): string => row[0])).toEqual(['Апартаменты', 'Виллы', 'Комнаты']);
    });

    it('SC-UKV-1389 — histogram gives a row per bin with the bounds of the chart axis', (): void => {
        const spec: IRtAiChatChart.Spec = {
            kind: ERtAiChatChartKind.HISTOGRAM,
            series: [
                {
                    name: 'Bookings',
                    points: [
                        { x: 0, y: 4 },
                        { x: 10, y: 0 },
                        { x: 20, y: 7 },
                    ],
                },
            ],
        };
        const table: IRtAiChatChartTable = rtAiChatChartTable(spec, 'en', WORDS);

        expect(texts(table.head)).toEqual(['Bin', 'Bookings']);
        expect(rowsOf(table)).toEqual([
            ['0–10', '4'],
            ['10–20', '0'],
            ['20–30', '7'],
        ]);
    });

    it('SC-UKV-1389 — heatmap gives a row per series and a column per x, as the chart columns stand', (): void => {
        const spec: IRtAiChatChart.Spec = RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.HEATMAP];
        const data: IRtChart.TData = rtAiChatChartData(spec, 'en');
        const table: IRtAiChatChartTable = rtAiChatChartTable(spec, 'en', WORDS);

        expect(data.kind).toBe('heatmap');
        expect(table.rows.map((row: readonly IRtAiChatChartTableCell[]): string => row[0].text)).toEqual(
            data.kind === 'heatmap' ? data.rows : []
        );
        expect(texts(table.head).slice(1)).toEqual(data.kind === 'heatmap' ? data.columns : []);
    });

    it('SC-UKV-1389 — scatter gives a row per point with x as given and y formatted', (): void => {
        const spec: IRtAiChatChart.Spec = {
            kind: ERtAiChatChartKind.SCATTER,
            format: ERtAiChatChartFormat.PERCENT,
            series: [{ name: 'Units', points: [{ x: 1234.5, y: 0.5 }] }],
        };
        const table: IRtAiChatChartTable = rtAiChatChartTable(spec, 'ru', WORDS);

        expect(texts(table.head)).toEqual(['Series', 'X', 'Y']);
        expect(rowsOf(table)).toEqual([['Units', '1234.5', rtAiChatChartFormat(spec, 'ru')(0.5)]]);
    });

    it('SC-UKV-1390 — trees give their valued paths, a node before its children', (): void => {
        const spec: IRtAiChatChart.Spec = {
            kind: ERtAiChatChartKind.TREEMAP,
            hierarchy: [
                { path: ['Центр', 'Апартаменты'], value: 120 },
                { path: ['Центр', 'Виллы'], value: 60 },
                { path: ['Побережье', 'Виллы'], value: 90 },
                { path: ['Центр'], value: 30 },
            ],
        };
        const table: IRtAiChatChartTable = rtAiChatChartTable(spec, 'en', WORDS);

        expect(texts(table.head)).toEqual(['Path', 'Value']);
        expect(rowsOf(table)).toEqual([
            ['Центр', '30'],
            ['Центр › Апартаменты', '120'],
            ['Центр › Виллы', '60'],
            ['Побережье › Виллы', '90'],
        ]);
    });
});
