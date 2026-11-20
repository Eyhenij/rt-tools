import type { IRtChart } from '@rt-tools/ui-kit-v2/chart';

import { rtAiChatChartData, rtAiChatChartFormat } from './ai-chat-chart.data';
import { IRtAiChatChart } from './ai-chat-chart.model';

/** Слова шапки из словаря кита: функция строк языка не знает. */
export interface IRtAiChatChartTableWords {
    readonly category: string;
    readonly bin: string;
    readonly value: string;
    readonly series: string;
    readonly x: string;
    readonly y: string;
    readonly path: string;
}

/** Ячейка таблицы данных: текст и признак числа — числа стоят вправо. */
export interface IRtAiChatChartTableCell {
    readonly text: string;
    readonly numeric: boolean;
}

/** Таблица данных графика: шапка и строки. */
export interface IRtAiChatChartTable {
    readonly head: readonly IRtAiChatChartTableCell[];
    readonly rows: ReadonlyArray<readonly IRtAiChatChartTableCell[]>;
}

/** Разделитель частей пути дерева. */
const PATH_JOIN: string = ' › ';

function textCell(text: string): IRtAiChatChartTableCell {
    return { text, numeric: false };
}

function numberCell(text: string): IRtAiChatChartTableCell {
    return { text, numeric: true };
}

/** Пропущенная точка — пустая ячейка; ноль и минус — как их пишет формат графика. */
function valueCell(value: number | null | undefined, format: IRtChart.TFormat): IRtAiChatChartTableCell {
    return numberCell(value === null || value === undefined ? '' : format(value));
}

/** Корзина гистограммы — строка с границами категорий графика `low–high`. */
function binsTable(
    data: IRtChart.Cartesian,
    spec: IRtAiChatChart.Spec,
    words: IRtAiChatChartTableWords,
    format: IRtChart.TFormat
): IRtAiChatChartTable {
    const one: IRtChart.Series | undefined = data.series[0];

    return {
        head: [textCell(spec.xLabel ?? words.bin), numberCell(one?.name ?? '')],
        rows: (one?.values ?? []).map((value: number | null, index: number): IRtAiChatChartTableCell[] => [
            textCell(`${data.categories[index]}–${data.categories[index + 1]}`),
            valueCell(value, format),
        ]),
    };
}

/** Строка на категорию, столбец на ряд; в стопке — значение своего ряда, не сумма. */
function cartesianTable(
    data: IRtChart.Cartesian,
    spec: IRtAiChatChart.Spec,
    words: IRtAiChatChartTableWords,
    format: IRtChart.TFormat
): IRtAiChatChartTable {
    if (data.place === 'bins') {
        return binsTable(data, spec, words, format);
    }

    return {
        head: [
            textCell(spec.xLabel ?? words.category),
            ...data.series.map((one: IRtChart.Series): IRtAiChatChartTableCell => numberCell(one.name)),
        ],
        rows: data.categories.map((category: string, index: number): IRtAiChatChartTableCell[] => [
            textCell(category),
            ...data.series.map((one: IRtChart.Series): IRtAiChatChartTableCell => valueCell(one.values[index], format)),
        ]),
    };
}

function pieTable(data: IRtChart.Pie, words: IRtAiChatChartTableWords, format: IRtChart.TFormat): IRtAiChatChartTable {
    return {
        head: [textCell(words.category), numberCell(words.value)],
        rows: data.items.map((item: IRtChart.Item): IRtAiChatChartTableCell[] => [textCell(item.name), valueCell(item.value, format)]),
    };
}

/** Строка на ряд, столбец на `x` в порядке столбцов графика. */
function heatmapTable(data: IRtChart.Heatmap, spec: IRtAiChatChart.Spec, format: IRtChart.TFormat): IRtAiChatChartTable {
    return {
        head: [textCell(spec.yLabel ?? ''), ...data.columns.map((column: string): IRtAiChatChartTableCell => numberCell(column))],
        rows: data.rows.map((row: string, index: number): IRtAiChatChartTableCell[] => [
            textCell(row),
            ...(data.values[index] ?? []).map((value: number | null): IRtAiChatChartTableCell => valueCell(value, format)),
        ]),
    };
}

/** Строка на точку, ряд за рядом; `x` — как дан, формат подписывает только `y`. */
function scatterTable(
    data: IRtChart.Scatter,
    spec: IRtAiChatChart.Spec,
    words: IRtAiChatChartTableWords,
    format: IRtChart.TFormat
): IRtAiChatChartTable {
    return {
        head: [textCell(words.series), numberCell(spec.xLabel ?? words.x), numberCell(spec.yLabel ?? words.y)],
        rows: data.series.flatMap((one: IRtChart.ScatterSeries): IRtAiChatChartTableCell[][] =>
            one.points.map(([x, y]: readonly [number, number]): IRtAiChatChartTableCell[] => [
                textCell(one.name),
                numberCell(String(x)),
                valueCell(y, format),
            ])
        ),
    };
}

/** Узлы дерева со своим значением: узел раньше своих детей, дети — в порядке графика. */
function treeRows(nodes: readonly IRtChart.Node[], parent: readonly string[], format: IRtChart.TFormat): IRtAiChatChartTableCell[][] {
    return nodes.flatMap((node: IRtChart.Node): IRtAiChatChartTableCell[][] => {
        const path: string[] = [...parent, node.name];
        const own: IRtAiChatChartTableCell[][] =
            node.value === undefined ? [] : [[textCell(path.join(PATH_JOIN)), valueCell(node.value, format)]];

        return [...own, ...treeRows(node.children ?? [], path, format)];
    });
}

/**
 * Таблица данных графика из тех же данных, что получает `rt-chart`: порядок, подписи и формат
 * значений — графика, своих таблица не добавляет.
 */
export function rtAiChatChartTable(spec: IRtAiChatChart.Spec, locale: string, words: IRtAiChatChartTableWords): IRtAiChatChartTable {
    const data: IRtChart.TData = rtAiChatChartData(spec, locale);
    const format: IRtChart.TFormat = rtAiChatChartFormat(spec, locale);

    switch (data.kind) {
        case 'cartesian':
            return cartesianTable(data, spec, words, format);
        case 'pie':
            return pieTable(data, words, format);
        case 'heatmap':
            return heatmapTable(data, spec, format);
        case 'scatter':
            return scatterTable(data, spec, words, format);
        default:
            return { head: [textCell(words.path), numberCell(words.value)], rows: treeRows(data.nodes, [], format) };
    }
}
