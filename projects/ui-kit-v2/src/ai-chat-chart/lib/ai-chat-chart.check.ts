import { ERtAiChatChartFormat, ERtAiChatChartKind } from './ai-chat-chart.enum';
import { IRtAiChatChart, RT_AI_CHAT_CHART_LIMITS } from './ai-chat-chart.model';

/** Итог проверки: разобранная спецификация или причина отказа. */
export type TRtAiChatChartCheck =
    { readonly ok: true; readonly spec: IRtAiChatChart.Spec } | { readonly ok: false; readonly reason: string };

const TREE_KINDS: ReadonlySet<ERtAiChatChartKind> = new Set([ERtAiChatChartKind.TREEMAP, ERtAiChatChartKind.SUNBURST]);
const NUMERIC_X_KINDS: ReadonlySet<ERtAiChatChartKind> = new Set([ERtAiChatChartKind.SCATTER, ERtAiChatChartKind.HISTOGRAM]);
const NEGATIVE_KINDS: ReadonlySet<ERtAiChatChartKind> = new Set([
    ERtAiChatChartKind.BAR,
    ERtAiChatChartKind.GROUPED_BAR,
    ERtAiChatChartKind.LINE,
    ERtAiChatChartKind.SCATTER,
    ERtAiChatChartKind.HEATMAP,
]);
const KINDS: ReadonlySet<string> = new Set(Object.values(ERtAiChatChartKind));
const FORMATS: ReadonlySet<string> = new Set(Object.values(ERtAiChatChartFormat));
const STEP_TOLERANCE: number = 1e-9;

function fail(reason: string): TRtAiChatChartCheck {
    return { ok: false, reason };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): boolean {
    return value === undefined || typeof value === 'string';
}

function parse(raw: unknown): unknown {
    if (typeof raw !== 'string') {
        return raw;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}

/** Код валюты, который принимает Intl.NumberFormat: три заглавные латинские буквы. */
export function rtAiChatChartIsCurrency(code: unknown): boolean {
    if (typeof code !== 'string' || !/^[A-Z]{3}$/.test(code)) {
        return false;
    }
    try {
        new Intl.NumberFormat('en', { style: 'currency', currency: code });

        return true;
    } catch {
        return false;
    }
}

function checkHead(value: Record<string, unknown>): string | null {
    if (typeof value['kind'] !== 'string' || !KINDS.has(value['kind'])) {
        return 'kind';
    }
    for (const key of ['title', 'subtitle', 'xLabel', 'yLabel']) {
        if (!optionalString(value[key])) {
            return key;
        }
    }
    const format: unknown = value['format'];
    if (format !== undefined && (typeof format !== 'string' || !FORMATS.has(format))) {
        return 'format';
    }
    if (format === ERtAiChatChartFormat.CURRENCY && !rtAiChatChartIsCurrency(value['currency'])) {
        return 'currency';
    }

    return null;
}

/** X точки на числовой оси: конечное число. */
function isNumericX(x: unknown): x is number {
    return typeof x === 'number' && Number.isFinite(x);
}

/** X точки на оси категорий: строка. */
function isCategoryX(x: unknown): x is string {
    return typeof x === 'string';
}

function checkPoint(point: unknown, kind: ERtAiChatChartKind, seen: Set<string | number>): string | null {
    if (!isRecord(point) || typeof point['y'] !== 'number' || !Number.isFinite(point['y'])) {
        return 'point';
    }
    const x: unknown = point['x'];
    const isX: (value: unknown) => value is string | number = NUMERIC_X_KINDS.has(kind) ? isNumericX : isCategoryX;
    if (!isX(x)) {
        return 'x';
    }
    if (point['y'] < 0 && !NEGATIVE_KINDS.has(kind)) {
        return 'negative';
    }
    if (seen.has(x)) {
        return 'repeated x';
    }
    seen.add(x);

    return null;
}

function checkHistogram(series: readonly IRtAiChatChart.Series[]): string | null {
    if (series.length !== 1 || series[0].points.length < 2) {
        return 'histogram';
    }
    const xs: number[] = series[0].points.map((point: IRtAiChatChart.Point): number => Number(point.x));
    const step: number = xs[1] - xs[0];
    for (let i: number = 1; i < xs.length; i++) {
        const gap: number = xs[i] - xs[i - 1];
        if (gap <= 0 || Math.abs(gap - step) > STEP_TOLERANCE * Math.max(1, Math.abs(step))) {
            return 'histogram';
        }
    }

    return null;
}

function textOf(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

/** Ряды уже проверенной спецификации, без лишних полей. */
function seriesOf(raw: unknown): IRtAiChatChart.Series[] {
    const list: unknown[] = Array.isArray(raw) ? raw : [];

    return list.filter(isRecord).map((one: Record<string, unknown>): IRtAiChatChart.Series => ({
        name: String(one['name']),
        points: (Array.isArray(one['points']) ? one['points'] : [])
            .filter(isRecord)
            .map((point: Record<string, unknown>): IRtAiChatChart.Point => ({
                x: typeof point['x'] === 'number' ? point['x'] : String(point['x']),
                y: Number(point['y']),
            })),
    }));
}

function hierarchyOf(raw: unknown): IRtAiChatChart.Leaf[] {
    const list: unknown[] = Array.isArray(raw) ? raw : [];

    return list.filter(isRecord).map((leaf: Record<string, unknown>): IRtAiChatChart.Leaf => ({
        path: (Array.isArray(leaf['path']) ? leaf['path'] : []).map(String),
        value: Number(leaf['value']),
    }));
}

function checkOneSeries(one: unknown, kind: ERtAiChatChartKind): string | null {
    if (!isRecord(one) || typeof one['name'] !== 'string' || !Array.isArray(one['points'])) {
        return 'series';
    }
    if (one['points'].length > RT_AI_CHAT_CHART_LIMITS.points) {
        return 'points';
    }
    const seen: Set<string | number> = new Set<string | number>();
    for (const point of one['points']) {
        const reason: string | null = checkPoint(point, kind, seen);
        if (reason) {
            return reason;
        }
    }

    return null;
}

function checkSeries(raw: unknown, kind: ERtAiChatChartKind): string | null {
    if (!Array.isArray(raw) || raw.length > RT_AI_CHAT_CHART_LIMITS.series) {
        return 'series';
    }
    if (kind === ERtAiChatChartKind.PIE && raw.length > 1) {
        return 'pie';
    }
    for (const one of raw) {
        const reason: string | null = checkOneSeries(one, kind);
        if (reason) {
            return reason;
        }
    }

    return kind === ERtAiChatChartKind.HISTOGRAM ? checkHistogram(seriesOf(raw)) : null;
}

function checkLeaf(leaf: unknown): string | null {
    if (!isRecord(leaf) || !Array.isArray(leaf['path']) || typeof leaf['value'] !== 'number') {
        return 'hierarchy';
    }
    const path: unknown[] = leaf['path'];
    const depthFits: boolean = path.length > 0 && path.length <= RT_AI_CHAT_CHART_LIMITS.depth;
    if (!depthFits || !path.every((part: unknown): boolean => typeof part === 'string') || !Number.isFinite(leaf['value'])) {
        return 'hierarchy';
    }

    return leaf['value'] < 0 ? 'negative' : null;
}

function checkHierarchy(raw: unknown): string | null {
    if (!Array.isArray(raw) || raw.length > RT_AI_CHAT_CHART_LIMITS.hierarchyEntries) {
        return 'hierarchy';
    }
    const leaves: Set<string> = new Set<string>();
    for (const leaf of raw) {
        const reason: string | null = checkLeaf(leaf);
        if (reason) {
            return reason;
        }
        leaves.add(JSON.stringify(Reflect.get(leaf, 'path')));
    }

    return leaves.size > RT_AI_CHAT_CHART_LIMITS.leaves ? 'leaves' : null;
}

function specOf(value: Record<string, unknown>, kind: ERtAiChatChartKind): IRtAiChatChart.Spec {
    const format: ERtAiChatChartFormat | undefined = Object.values(ERtAiChatChartFormat).find(
        (one: ERtAiChatChartFormat): boolean => one === value['format']
    );

    return {
        kind,
        format,
        title: textOf(value['title']),
        subtitle: textOf(value['subtitle']),
        xLabel: textOf(value['xLabel']),
        yLabel: textOf(value['yLabel']),
        currency: textOf(value['currency']),
        series: TREE_KINDS.has(kind) ? undefined : seriesOf(value['series']),
        hierarchy: TREE_KINDS.has(kind) ? hierarchyOf(value['hierarchy']) : undefined,
    };
}

/** Разбирает спецификацию из строки JSON или объекта и проверяет её по договорённости блока. */
export function rtAiChatChartCheck(raw: unknown): TRtAiChatChartCheck {
    const value: unknown = parse(raw);
    if (!isRecord(value)) {
        return fail('json');
    }
    const head: string | null = checkHead(value);
    if (head) {
        return fail(head);
    }
    const kind: ERtAiChatChartKind | undefined = Object.values(ERtAiChatChartKind).find(
        (one: ERtAiChatChartKind): boolean => one === value['kind']
    );
    if (!kind) {
        return fail('kind');
    }
    const body: string | null = TREE_KINDS.has(kind) ? checkHierarchy(value['hierarchy']) : checkSeries(value['series'], kind);

    return body ? fail(body) : { ok: true, spec: specOf(value, kind) };
}
