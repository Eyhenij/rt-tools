import Ajv2020 from 'ajv/dist/2020';

import { rtAiChatChartCheck, TRtAiChatChartCheck } from './ai-chat-chart.check';
import { ERtAiChatChartFormat, ERtAiChatChartKind } from './ai-chat-chart.enum';
import { RT_AI_CHAT_CHART_SAMPLES } from './ai-chat-chart.samples';
import { RT_AI_CHAT_CHART_SCHEMA } from './ai-chat-chart.schema';

type TValidate = (value: unknown) => boolean;

function lineOf(count: number, x: (index: number) => string = (index: number): string => `c${index}`): Record<string, unknown> {
    return {
        kind: ERtAiChatChartKind.LINE,
        series: [{ name: 'A', points: Array.from({ length: count }, (_: unknown, index: number) => ({ x: x(index), y: index })) }],
    };
}

function single(kind: ERtAiChatChartKind, x: string | number, y: number): Record<string, unknown> {
    return { kind, series: [{ name: 'S', points: [{ x, y }] }] };
}

function reasonOf(result: TRtAiChatChartCheck): string | null {
    return result.ok ? null : result.reason;
}

function validator(): TValidate {
    return new Ajv2020({ strict: false }).compile(RT_AI_CHAT_CHART_SCHEMA);
}

describe('rtAiChatChartCheck', (): void => {
    it('SC-UKV-1347 — a spec as a JSON string is parsed like the same object', (): void => {
        const spec: TSample = RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.PIE];
        const fromString: TRtAiChatChartCheck = rtAiChatChartCheck(JSON.stringify(spec));

        expect(fromString.ok).toBe(true);
        expect(fromString).toEqual(rtAiChatChartCheck(spec));
    });

    it('SC-UKV-1348 — a string that does not parse is refused', (): void => {
        expect(reasonOf(rtAiChatChartCheck('{"kind":"line","series":[{"na'))).toBe('json');
    });

    it('SC-UKV-1349 — a spec of an unknown kind is refused', (): void => {
        expect(reasonOf(rtAiChatChartCheck({ kind: 'radar', series: [] }))).toBe('kind');
    });

    it('SC-UKV-1360 — a tree over 200 distinct leaves is refused, equal paths count once', (): void => {
        const distinct: unknown[] = Array.from({ length: 201 }, (_: unknown, index: number) => ({ path: ['A', `l${index}`], value: 1 }));
        const repeated: unknown[] = Array.from({ length: 400 }, (_: unknown, index: number) => ({
            path: ['A', `l${index % 200}`],
            value: 1,
        }));

        expect(reasonOf(rtAiChatChartCheck({ kind: ERtAiChatChartKind.TREEMAP, hierarchy: distinct }))).toBe('leaves');
        expect(rtAiChatChartCheck({ kind: ERtAiChatChartKind.TREEMAP, hierarchy: repeated }).ok).toBe(true);
    });

    it('SC-UKV-1362 — a histogram of one point or of uneven steps is refused', (): void => {
        const uneven: Record<string, unknown> = {
            kind: ERtAiChatChartKind.HISTOGRAM,
            series: [
                {
                    name: 'H',
                    points: [
                        { x: 0, y: 3 },
                        { x: 10, y: 1 },
                        { x: 15, y: 2 },
                    ],
                },
            ],
        };

        expect(reasonOf(rtAiChatChartCheck(single(ERtAiChatChartKind.HISTOGRAM, 0, 3)))).toBe('histogram');
        expect(reasonOf(rtAiChatChartCheck(uneven))).toBe('histogram');
        expect(rtAiChatChartCheck(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.HISTOGRAM]).ok).toBe(true);
    });

    it('SC-UKV-1374 — the specs the block refuses name their reason', (): void => {
        const sevenSeries: Record<string, unknown> = {
            kind: ERtAiChatChartKind.LINE,
            series: Array.from({ length: 7 }, () => ({ name: 's', points: [] })),
        };

        expect(reasonOf(rtAiChatChartCheck(lineOf(61)))).toBe('points');
        expect(reasonOf(rtAiChatChartCheck(sevenSeries))).toBe('series');
        expect(reasonOf(rtAiChatChartCheck(single(ERtAiChatChartKind.PIE, 'a', -1)))).toBe('negative');
        expect(reasonOf(rtAiChatChartCheck(single(ERtAiChatChartKind.STACKED_BAR, 'a', -1)))).toBe('negative');
        expect(reasonOf(rtAiChatChartCheck(single(ERtAiChatChartKind.SCATTER, 'a', 1)))).toBe('x');
        expect(reasonOf(rtAiChatChartCheck(lineOf(2, (): string => 'same')))).toBe('repeated x');
        expect(reasonOf(rtAiChatChartCheck({ ...lineOf(2), format: ERtAiChatChartFormat.CURRENCY }))).toBe('currency');
        expect(reasonOf(rtAiChatChartCheck({ ...lineOf(2), format: ERtAiChatChartFormat.CURRENCY, currency: 'eur' }))).toBe('currency');
    });

    it('SC-UKV-1343 — a negative value is accepted by bar and grouped bars', (): void => {
        expect(rtAiChatChartCheck(single(ERtAiChatChartKind.BAR, 'a', -25)).ok).toBe(true);
        expect(rtAiChatChartCheck(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.GROUPED_BAR]).ok).toBe(true);
    });

    it('SC-UKV-1375 — unknown fields are ignored and do not reach the spec', (): void => {
        const result: TRtAiChatChartCheck = rtAiChatChartCheck({ ...lineOf(2), theme: 'neon' });

        expect(result.ok).toBe(true);
        expect(result.ok && Reflect.has(result.spec, 'title')).toBe(true);
        expect(result.ok && Reflect.has(result.spec, 'theme')).toBe(false);
    });
});

describe('RT_AI_CHAT_CHART_SCHEMA', (): void => {
    it('SC-UKV-1358 — every sample spec passes both the schema and the check', (): void => {
        const validate: TValidate = validator();

        for (const kind of Object.values(ERtAiChatChartKind)) {
            const sample: TSample = RT_AI_CHAT_CHART_SAMPLES[kind];
            expect({ kind, schema: validate(sample), check: rtAiChatChartCheck(sample).ok }).toEqual({ kind, schema: true, check: true });
        }
    });

    it('SC-UKV-1358 — the schema refuses what it can express: an unknown kind and a negative pie', (): void => {
        const validate: TValidate = validator();

        expect(validate(RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.PIE])).toBe(true);
        expect(validate({ kind: 'radar', series: [] })).toBe(false);
        expect(validate(single(ERtAiChatChartKind.PIE, 'a', -1))).toBe(false);
    });
});

type TSample = (typeof RT_AI_CHAT_CHART_SAMPLES)[ERtAiChatChartKind];
