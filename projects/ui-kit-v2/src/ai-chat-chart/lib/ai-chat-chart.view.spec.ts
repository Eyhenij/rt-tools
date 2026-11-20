import { ERtAiChatChartKind } from './ai-chat-chart.enum';
import { IRtAiChatChart } from './ai-chat-chart.model';
import { RT_AI_CHAT_CHART_SAMPLES } from './ai-chat-chart.samples';
import {
    rtAiChatChartBlockText,
    rtAiChatChartFileName,
    rtAiChatChartIsEmpty,
    rtAiChatChartLabelEvery,
    rtAiChatChartState,
    rtAiChatChartText,
} from './ai-chat-chart.view';

const SALES: IRtAiChatChart.Spec = {
    kind: ERtAiChatChartKind.BAR,
    title: 'Sales',
    series: [
        {
            name: 'Units',
            points: [
                { x: 'Jan', y: 3 },
                { x: 'Feb', y: 0 },
            ],
        },
    ],
};

describe('rtAiChatChartState', (): void => {
    it('SC-UKV-1350 — a pending block is pending whatever its spec string holds', (): void => {
        expect(rtAiChatChartState({ type: 'chart', pending: true, spec: '{"kind":"line","ser' })).toEqual({ kind: 'pending' });
    });

    it('SC-UKV-1348 — a block whose spec does not parse is invalid', (): void => {
        expect(rtAiChatChartState({ type: 'chart', spec: '{"kind":"line","ser' }).kind).toBe('invalid');
    });
});

describe('rtAiChatChartIsEmpty', (): void => {
    it('SC-UKV-1363 — a series without points and a pie of zeros are empty, a zero bar is not', (): void => {
        const noPoints: IRtAiChatChart.Spec = { ...SALES, series: [{ name: 'Units', points: [] }] };
        const zeroPie: IRtAiChatChart.Spec = {
            kind: ERtAiChatChartKind.PIE,
            series: [{ name: 'Share', points: [{ x: 'A', y: 0 }] }],
        };

        expect(rtAiChatChartIsEmpty(noPoints)).toBe(true);
        expect(rtAiChatChartIsEmpty(zeroPie)).toBe(true);
        expect(rtAiChatChartIsEmpty(SALES)).toBe(false);
    });
});

describe('rtAiChatChartLabelEvery', (): void => {
    it('SC-UKV-1368 — 60 categories in a narrow feed show every n-th label so that each fits', (): void => {
        const categories: string[] = Array.from({ length: 60 }, (_: unknown, index: number): string => `W${index + 1}`);
        const every: number = rtAiChatChartLabelEvery(categories, 328);
        const shown: number = Math.ceil(categories.length / every);

        expect(every).toBeGreaterThan(1);
        expect(shown * (3 * 7 + 12)).toBeLessThanOrEqual(328);
        expect(rtAiChatChartLabelEvery(['Jan', 'Feb'], 328)).toBe(1);
    });
});

describe('rtAiChatChartFileName', (): void => {
    it('SC-UKV-1357 — the file is named by the title, punctuation alone gives «chart.png»', (): void => {
        expect(rtAiChatChartFileName('Revenue by month')).toBe('Revenue-by-month.png');
        expect(rtAiChatChartFileName('Выручка, тыс. ₽!')).toBe('Выручка-тыс.png');
        expect(rtAiChatChartFileName('?!…')).toBe('chart.png');
        expect(rtAiChatChartFileName(undefined)).toBe('chart.png');
        expect(rtAiChatChartFileName('a'.repeat(100))).toBe(`${'a'.repeat(80)}.png`);
    });
});

describe('rtAiChatChartText', (): void => {
    it('SC-UKV-1359 — the copy gives the title, then one line per series with every point, a zero included', (): void => {
        expect(rtAiChatChartText(SALES, 'en')).toBe('Sales\nUnits: Jan — 3; Feb — 0');
    });

    it('SC-UKV-1366 — the copy of a tree gives one line per leaf, equal paths summed', (): void => {
        const tree: IRtAiChatChart.Spec = {
            kind: ERtAiChatChartKind.TREEMAP,
            title: 'Sales',
            hierarchy: [
                { path: ['Europe', 'France'], value: 1 },
                { path: ['Asia', 'Japan'], value: 4 },
                { path: ['Europe', 'France'], value: 2 },
            ],
        };

        expect(rtAiChatChartText(tree, 'en')).toBe('Sales\nEurope / France — 3\nAsia / Japan — 4');
    });

    it('SC-UKV-1366 — a histogram writes each x as its bin', (): void => {
        expect(rtAiChatChartText(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.HISTOGRAM], 'en')).toBe(
            'Длительность броней, ночей\nБрони: 1–3 — 4; 3–5 — 11; 5–7 — 7; 7–9 — 3'
        );
    });

    it('SC-UKV-1367 — a pending or an invalid block gives nothing to the copy', (): void => {
        expect(rtAiChatChartBlockText({ type: 'chart', pending: true, spec: SALES }, 'en')).toBe('');
        expect(rtAiChatChartBlockText({ type: 'chart', spec: '{' }, 'en')).toBe('');
        expect(rtAiChatChartBlockText({ type: 'chart', spec: JSON.stringify(SALES) }, 'en')).toBe('Sales\nUnits: Jan — 3; Feb — 0');
    });
});
