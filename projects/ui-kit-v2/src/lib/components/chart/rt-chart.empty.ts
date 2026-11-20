import { IRtChart } from './rt-chart.model';

function hasValue(values: ReadonlyArray<number | null | undefined>): boolean {
    return values.some((value: number | null | undefined): boolean => value !== null && value !== undefined);
}

function treeHasValue(nodes: readonly IRtChart.Node[]): boolean {
    return nodes.some((node: IRtChart.Node): boolean => (node.children?.length ? treeHasValue(node.children) : node.value !== undefined));
}

/** Пусты ли данные графика: ни одного значения ни в одной серии, секторе, ячейке или листе. */
export function rtChartIsEmpty(data: IRtChart.TData | null | undefined): boolean {
    if (!data) {
        return true;
    }

    switch (data.kind) {
        case 'cartesian':
            return !data.series.some((item: IRtChart.Series): boolean => hasValue(item.values));
        case 'scatter':
            return !data.series.some((item: IRtChart.ScatterSeries): boolean => item.points.length > 0);
        case 'pie':
            return data.items.length === 0;
        case 'heatmap':
            return !data.values.some((row: ReadonlyArray<number | null>): boolean => hasValue(row));
        default:
            return !treeHasValue(data.nodes);
    }
}
