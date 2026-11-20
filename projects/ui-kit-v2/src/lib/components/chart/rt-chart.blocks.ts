import { hierarchy, HierarchyNode, HierarchyRectangularNode, treemap } from 'd3-hierarchy';

import { IRtChart } from './rt-chart.model';
import {
    IRtChartAxis,
    IRtChartLegendItem,
    IRtChartPath,
    IRtChartScene,
    IRtChartSize,
    IRtChartText,
    RT_CHART_AXIS_FONT,
    RT_CHART_BOTTOM,
    RT_CHART_COLOR,
    RT_CHART_LABEL_GAP,
    RT_CHART_TOP,
    rtChartAxis,
    rtChartAxisText,
    rtChartFill,
    rtChartLeft,
    rtChartNumber,
    rtChartRect,
    rtChartSlot,
    rtChartSlotAt,
    rtChartTipLine,
    TRtChartMeasure,
} from './rt-chart.scene';

/** Промежуток между ячейками карты и между прямоугольниками дерева. */
const GAP: number = 2;

/** Отступ ячеек карты от краёв сетки. */
const HEAT_INSET: number = 1;

/** Скругление ячейки карты и прямоугольника дерева. */
const RADIUS: Readonly<Record<'cell' | 'tree', number>> = { cell: 2, tree: 4 };

/** Плотность первого цвета у нуля и у верха шкалы карты. */
const HEAT_OPACITY: readonly [number, number] = [0.12, 1];

/** Число плашек шкалы плотности под картой. */
const SCALE_STEPS: number = 5;

/** Многоточие на месте отрезанного конца подписи. */
const ELLIPSIS: string = '…';

/** Шапка группы дерева под её подпись и отступ листьев от краёв группы. */
const TREE_GROUP: Readonly<Record<'header' | 'padding', number>> = { header: 22, padding: 4 };

/** Подпись группы дерева: отступ от угла группы. */
const TREE_LABEL: Readonly<Record<'x' | 'y', number>> = { x: 6, y: 11 };

/** Корень дерева для раскладки: у него нет имени, только группы. */
interface IRoot {
    readonly name: string;
    readonly value?: number;
    readonly slot?: IRtChart.TSlot;
    readonly children?: readonly IRtChart.Node[];
}

/** Сцена тепловой карты: подписи строк слева, столбцов снизу, ячейки в плотности первого цвета. */
export function rtChartHeatmapScene(data: IRtChart.Heatmap, size: IRtChartSize, measure: TRtChartMeasure): IRtChartScene {
    const widest: number = Math.max(0, ...data.rows.map((row: string): number => measure(row, RT_CHART_AXIS_FONT)));
    const left: number = rtChartLeft(widest);
    const bottom: number = size.height - RT_CHART_BOTTOM;
    const columns: number = Math.max(data.columns.length, 1);
    const rows: number = Math.max(data.rows.length, 1);
    const cellWidth: number = (size.width - left - 2 * HEAT_INSET - GAP * (columns - 1)) / columns;
    const cellHeight: number = (bottom - RT_CHART_TOP - 2 * HEAT_INSET - GAP * (rows - 1)) / rows;
    const known: number[] = data.values.flatMap((row: ReadonlyArray<number | null>): number[] =>
        row.filter((value: number | null): value is number => value !== null)
    );
    const axis: IRtChartAxis = rtChartAxis(Math.min(...known), Math.max(...known), 4);
    const low: number = axis.min;
    const span: number = axis.max - axis.min || 1;
    const color: string = rtChartSlot(1);
    const label: (value: number) => string = (value: number): string => (data.format ? data.format(value) : rtChartNumber(value));
    const paths: IRtChartPath[] = data.values.flatMap((row: ReadonlyArray<number | null>, r: number): IRtChartPath[] =>
        row.flatMap((value: number | null, c: number): IRtChartPath[] => {
            if (value === null) {
                return [];
            }

            const x: number = left + HEAT_INSET + c * (cellWidth + GAP);
            const y: number = RT_CHART_TOP + HEAT_INSET + r * (cellHeight + GAP);
            const opacity: number = HEAT_OPACITY[0] + ((value - low) / span) * (HEAT_OPACITY[1] - HEAT_OPACITY[0]);

            return [
                rtChartFill(`cell-${r}-${c}`, rtChartRect(x, y, cellWidth, cellHeight, RADIUS.cell), color, opacity, [
                    `${data.rows[r] ?? ''}, ${data.columns[c] ?? ''}`,
                    label(value),
                ]),
            ];
        })
    );
    const rowTexts: IRtChartText[] = data.rows.map((row: string, r: number): IRtChartText =>
        rtChartAxisText(
            `row-${r}`,
            left - RT_CHART_LABEL_GAP,
            RT_CHART_TOP + HEAT_INSET + r * (cellHeight + GAP) + cellHeight / 2,
            row,
            'end'
        )
    );
    const columnTexts: IRtChartText[] = data.columns.map((column: string, c: number): IRtChartText =>
        rtChartAxisText(
            `column-${c}`,
            left + HEAT_INSET + c * (cellWidth + GAP) + cellWidth / 2,
            bottom + 4 + RT_CHART_AXIS_FONT * 0.7,
            column,
            'middle'
        )
    );

    return {
        paths,
        texts: [...rowTexts, ...columnTexts],
        legend: [],
        scale: {
            color,
            low: label(axis.min),
            high: label(axis.max),
            steps: Array.from(
                { length: SCALE_STEPS },
                (_: unknown, index: number): number => HEAT_OPACITY[0] + ((HEAT_OPACITY[1] - HEAT_OPACITY[0]) * index) / (SCALE_STEPS - 1)
            ),
        },
    };
}

function groupPadding(node: HierarchyRectangularNode<IRoot>): number {
    return node.depth === 1 && node.children ? TREE_GROUP.padding : 0;
}

/**
 * Ширины по значениям, где каждая не меньше своей нужды: недостающее у узких забирается у широких
 * в меру их запаса над нуждой. Если нужды не помещаются все, ширины остаются по значениям.
 */
export function rtChartWidthsAtLeast(values: readonly number[], needs: readonly number[], room: number): number[] {
    const total: number = values.reduce((sum: number, value: number): number => sum + value, 0) || 1;
    const shares: number[] = values.map((value: number): number => (room * value) / total);
    const own: number[] = shares.map((_: number, index: number): number => needs[index] ?? 0);
    const deficit: number = shares.reduce((sum: number, share: number, index: number): number => sum + Math.max(0, own[index] - share), 0);
    const spare: number = shares.reduce((sum: number, share: number, index: number): number => sum + Math.max(0, share - own[index]), 0);

    if (deficit <= 0 || spare < deficit) {
        return shares;
    }

    return shares.map((share: number, index: number): number =>
        share < own[index] ? own[index] : share - (deficit * (share - own[index])) / spare
    );
}

/** Узлы рядом слева направо по заданным ширинам. */
function sideBySide(
    nodes: ReadonlyArray<HierarchyRectangularNode<IRoot>>,
    widths: readonly number[],
    x0: number,
    y0: number,
    y1: number
): void {
    let left: number = x0;

    nodes.forEach((child: HierarchyRectangularNode<IRoot>, index: number): void => {
        Object.assign(child, { x0: left, x1: left + widths[index], y0, y1 });
        left += widths[index];
    });
}

/**
 * Раскладка дерева, как в макете: группы стоят рядом, каждая не уже своей подписи; в группе первый
 * лист занимает верхнюю полосу во всю ширину, остальные стоят рядом под ним. Площадь — по значению.
 */
function headFirst(
    need: (node: HierarchyRectangularNode<IRoot>) => number
): (node: HierarchyRectangularNode<IRoot>, x0: number, y0: number, x1: number, y1: number) => void {
    return (node: HierarchyRectangularNode<IRoot>, x0: number, y0: number, x1: number, y1: number): void => {
        const children: Array<HierarchyRectangularNode<IRoot>> = node.children ?? [];
        const value: (child: HierarchyRectangularNode<IRoot>) => number = (child: HierarchyRectangularNode<IRoot>): number =>
            child.value ?? 0;

        if (node.depth === 0 || children.length < 2 || !node.value) {
            sideBySide(children, rtChartWidthsAtLeast(children.map(value), children.map(need), x1 - x0), x0, y0, y1);

            return;
        }

        const head: HierarchyRectangularNode<IRoot> = children[0];
        const rest: Array<HierarchyRectangularNode<IRoot>> = children.slice(1);
        const split: number = y0 + ((y1 - y0) * value(head)) / node.value;

        Object.assign(head, { y1: split, x0, x1, y0 });
        sideBySide(rest, rtChartWidthsAtLeast(rest.map(value), [], x1 - x0), x0, split, y1);
    };
}

/** Подпись, отрезанная многоточием по ширине места; целиком она стоит в подсказке. */
function fitText(text: string, room: number, measure: TRtChartMeasure): string {
    if (measure(text, RT_CHART_AXIS_FONT) <= room) {
        return text;
    }

    let kept: string = text;

    while (kept.length > 1 && measure(`${kept}${ELLIPSIS}`, RT_CHART_AXIS_FONT) > room) {
        kept = kept.slice(0, -1);
    }

    return `${kept.trimEnd()}${ELLIPSIS}`;
}

/** Сцена дерева прямоугольников: группы в цвете линий сетки с подписью в шапке, листья в цветах палитры. */
export function rtChartTreemapScene(data: IRtChart.Tree, size: IRtChartSize, measure: TRtChartMeasure): IRtChartScene {
    const root: HierarchyNode<IRoot> = hierarchy<IRoot>({ name: '', children: data.nodes }, (node: IRoot): readonly IRoot[] | undefined =>
        node.children ? [...node.children] : undefined
    ).sum((node: IRoot): number => (node.children?.length ? 0 : (node.value ?? 0)));
    const groupTitle: (node: HierarchyRectangularNode<IRoot>) => string = (node: HierarchyRectangularNode<IRoot>): string =>
        data.format ? `${node.data.name} ${data.format(node.value ?? 0)}` : node.data.name;
    const need: (node: HierarchyRectangularNode<IRoot>) => number = (node: HierarchyRectangularNode<IRoot>): number =>
        node.depth === 1 && node.children ? measure(groupTitle(node), RT_CHART_AXIS_FONT) + 2 * TREE_LABEL.x + GAP : 0;
    const laid: HierarchyRectangularNode<IRoot> = treemap<IRoot>()
        .size([size.width, Math.max(0, size.height - RT_CHART_TOP)])
        .tile(headFirst(need))
        .paddingInner(GAP)
        .paddingTop((node: HierarchyRectangularNode<IRoot>): number => (node.depth === 1 && node.children ? TREE_GROUP.header : 0))
        .paddingRight(groupPadding)
        .paddingBottom(groupPadding)
        .paddingLeft(groupPadding)(root);
    const leaves: Array<HierarchyRectangularNode<IRoot>> = laid.leaves();
    const groups: Array<HierarchyRectangularNode<IRoot>> = (laid.children ?? []).filter((node: HierarchyRectangularNode<IRoot>): boolean =>
        Boolean(node.children)
    );
    const box: (node: HierarchyRectangularNode<IRoot>) => string = (node: HierarchyRectangularNode<IRoot>): string =>
        rtChartRect(node.x0, node.y0 + RT_CHART_TOP, node.x1 - node.x0, node.y1 - node.y0, RADIUS.tree);

    return {
        paths: [
            ...groups.map((node: HierarchyRectangularNode<IRoot>, index: number): IRtChartPath =>
                rtChartFill(`group-${index}`, box(node), RT_CHART_COLOR.line, 1, [rtChartTipLine(node.data.name, node.value, data.format)])
            ),
            ...leaves.map((node: HierarchyRectangularNode<IRoot>, index: number): IRtChartPath =>
                rtChartFill(`leaf-${index}`, box(node), rtChartSlot(rtChartSlotAt(index, node.data.slot)), 1, [
                    ...(node.parent && node.parent.depth > 0 ? [node.parent.data.name] : []),
                    rtChartTipLine(node.data.name, node.value, data.format),
                ])
            ),
        ],
        texts: groups.map((node: HierarchyRectangularNode<IRoot>, index: number): IRtChartText => ({
            key: `group-${index}`,
            x: node.x0 + TREE_LABEL.x,
            y: node.y0 + RT_CHART_TOP + TREE_LABEL.y,
            text: fitText(groupTitle(node), node.x1 - node.x0 - 2 * TREE_LABEL.x, measure),
            anchor: 'start',
            fill: RT_CHART_COLOR.text,
            size: RT_CHART_AXIS_FONT,
            weight: 500,
        })),
        legend: leaves.map((node: HierarchyRectangularNode<IRoot>, index: number): IRtChartLegendItem => ({
            name: node.data.name,
            color: rtChartSlot(rtChartSlotAt(index, node.data.slot)),
            mark: 'dot',
        })),
    };
}
