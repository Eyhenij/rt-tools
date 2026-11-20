import type { IRtChart } from '@rt-tools/ui-kit-v2/chart';

import { ERtAiChatChartFormat, ERtAiChatChartKind } from './ai-chat-chart.enum';
import { IRtAiChatChart } from './ai-chat-chart.model';

const STACK: string = 'stack';
const PERCENT_DIGITS: number = 1;
const NUMBER_DIGITS: number = 2;

function optionsOf(spec: IRtAiChatChart.Spec): Intl.NumberFormatOptions {
    if (spec.format === ERtAiChatChartFormat.PERCENT) {
        return { style: 'percent', maximumFractionDigits: PERCENT_DIGITS };
    }
    if (spec.format === ERtAiChatChartFormat.CURRENCY && spec.currency) {
        return { style: 'currency', currency: spec.currency };
    }

    return { maximumFractionDigits: NUMBER_DIGITS };
}

/** Подпись значений по формату спецификации: число, доля или деньги в валюте спецификации. */
export function rtAiChatChartFormat(spec: IRtAiChatChart.Spec, locale: string): IRtChart.TFormat {
    const formatter: Intl.NumberFormat = new Intl.NumberFormat(locale, optionsOf(spec));

    return (value: number): string => formatter.format(value);
}

/** Категории в порядке первого появления, ряд за рядом. */
function categoriesOf(series: readonly IRtAiChatChart.Series[]): string[] {
    const seen: Set<string> = new Set<string>();
    for (const one of series) {
        for (const point of one.points) {
            seen.add(String(point.x));
        }
    }

    return [...seen];
}

function valuesOf(one: IRtAiChatChart.Series, categories: readonly string[]): Array<number | null> {
    const byX: Map<string, number> = new Map<string, number>(
        one.points.map((point: IRtAiChatChart.Point): [string, number] => [String(point.x), point.y])
    );

    return categories.map((category: string): number | null => byX.get(category) ?? null);
}

function cartesianOf(spec: IRtAiChatChart.Spec, format: IRtChart.TFormat): IRtChart.Cartesian {
    const series: readonly IRtAiChatChart.Series[] = spec.series ?? [];
    const categories: string[] = categoriesOf(series);
    const type: IRtChart.TSeriesType = spec.kind === ERtAiChatChartKind.LINE ? 'line' : 'bar';
    const stack: string | undefined = spec.kind === ERtAiChatChartKind.STACKED_BAR ? STACK : undefined;

    return {
        categories,
        kind: 'cartesian',
        axes: [{ format }],
        series: series.map((one: IRtAiChatChart.Series): IRtChart.Series => ({
            stack,
            type,
            name: one.name,
            values: valuesOf(one, categories),
        })),
    };
}

/** Гистограмма: X каждой точки — нижняя граница корзины, верхняя граница последней — X плюс шаг. */
function histogramOf(spec: IRtAiChatChart.Spec, format: IRtChart.TFormat): IRtChart.Cartesian {
    const points: readonly IRtAiChatChart.Point[] = spec.series?.[0]?.points ?? [];
    const xs: number[] = points.map((point: IRtAiChatChart.Point): number => Number(point.x));
    const step: number = xs.length > 1 ? xs[xs.length - 1] - xs[xs.length - 2] : 0;

    return {
        kind: 'cartesian',
        place: 'bins',
        axes: [{ format }],
        categories: [...xs, xs[xs.length - 1] + step].map(String),
        series: [
            {
                name: spec.series?.[0]?.name ?? '',
                type: 'bar',
                values: points.map((point: IRtAiChatChart.Point): number => point.y),
            },
        ],
    };
}

function pieOf(spec: IRtAiChatChart.Spec, format: IRtChart.TFormat): IRtChart.Pie {
    const points: readonly IRtAiChatChart.Point[] = spec.series?.[0]?.points ?? [];

    return {
        format,
        kind: 'pie',
        items: points.map((point: IRtAiChatChart.Point): IRtChart.Item => ({ name: String(point.x), value: point.y })),
    };
}

function heatmapOf(spec: IRtAiChatChart.Spec, format: IRtChart.TFormat): IRtChart.Heatmap {
    const series: readonly IRtAiChatChart.Series[] = spec.series ?? [];
    const columns: string[] = categoriesOf(series);

    return {
        columns,
        format,
        kind: 'heatmap',
        rows: series.map((one: IRtAiChatChart.Series): string => one.name),
        values: series.map((one: IRtAiChatChart.Series): Array<number | null> => valuesOf(one, columns)),
    };
}

function scatterOf(spec: IRtAiChatChart.Spec, format: IRtChart.TFormat): IRtChart.Scatter {
    return {
        kind: 'scatter',
        y: { format },
        series: (spec.series ?? []).map((one: IRtAiChatChart.Series): IRtChart.ScatterSeries => ({
            name: one.name,
            points: one.points.map((point: IRtAiChatChart.Point): readonly [number, number] => [Number(point.x), point.y]),
        })),
    };
}

interface IDraftNode {
    value: number;
    readonly children: Map<string, IDraftNode>;
}

function draftNode(): IDraftNode {
    return { value: 0, children: new Map<string, IDraftNode>() };
}

function nodesOf(children: Map<string, IDraftNode>): IRtChart.Node[] {
    return [...children].map(([name, node]: [string, IDraftNode]): IRtChart.Node => {
        if (node.children.size === 0) {
            return { name, value: node.value };
        }

        return node.value > 0 ? { name, value: node.value, children: nodesOf(node.children) } : { name, children: nodesOf(node.children) };
    });
}

/** Дерево из листьев: равные пути складываются, путь до внутреннего узла оставляет значение на узле. */
function treeOf(spec: IRtAiChatChart.Spec, format: IRtChart.TFormat): IRtChart.Tree {
    const root: IDraftNode = draftNode();
    for (const leaf of spec.hierarchy ?? []) {
        let node: IDraftNode = root;
        for (const part of leaf.path) {
            const next: IDraftNode = node.children.get(part) ?? draftNode();
            node.children.set(part, next);
            node = next;
        }
        node.value += leaf.value;
    }
    const kind: 'treemap' | 'sunburst' = spec.kind === ERtAiChatChartKind.SUNBURST ? 'sunburst' : 'treemap';

    return { format, kind, nodes: nodesOf(root.children) };
}

type TBuild = (spec: IRtAiChatChart.Spec, format: IRtChart.TFormat) => IRtChart.TData;

const BUILDS: Readonly<Record<ERtAiChatChartKind, TBuild>> = {
    [ERtAiChatChartKind.LINE]: cartesianOf,
    [ERtAiChatChartKind.BAR]: cartesianOf,
    [ERtAiChatChartKind.GROUPED_BAR]: cartesianOf,
    [ERtAiChatChartKind.STACKED_BAR]: cartesianOf,
    [ERtAiChatChartKind.HISTOGRAM]: histogramOf,
    [ERtAiChatChartKind.PIE]: pieOf,
    [ERtAiChatChartKind.HEATMAP]: heatmapOf,
    [ERtAiChatChartKind.SCATTER]: scatterOf,
    [ERtAiChatChartKind.TREEMAP]: treeOf,
    [ERtAiChatChartKind.SUNBURST]: treeOf,
};

/** Данные `rt-chart` из проверенной спецификации. */
export function rtAiChatChartData(spec: IRtAiChatChart.Spec, locale: string): IRtChart.TData {
    return BUILDS[spec.kind](spec, rtAiChatChartFormat(spec, locale));
}
