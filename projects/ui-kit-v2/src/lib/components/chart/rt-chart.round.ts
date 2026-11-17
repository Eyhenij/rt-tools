import { arc, Arc, pie, Pie, PieArcDatum } from 'd3-shape';

import { IRtChart } from './rt-chart.model';
import {
    IRtChartLegendItem,
    IRtChartPath,
    IRtChartScene,
    IRtChartSize,
    RT_CHART_COLOR,
    rtChartFill,
    rtChartSlot,
    rtChartSlotAt,
    rtChartTipLine,
} from './rt-chart.scene';

/** Сектор, готовый к рисованию: углы, радиусы и цвет. */
interface ISector {
    readonly startAngle: number;
    readonly endAngle: number;
    readonly inner: number;
    readonly outer: number;
    readonly padAngle: number;
}

/** Зазор между секторами в радианах. */
const PAD_ANGLE: Readonly<Record<'pie' | 'sunburst', number>> = { pie: 0.03, sunburst: 0.02 };

/** Отступ круга от верхнего и нижнего края поля. */
const PIE_INSET: number = 10;

/** Доля отверстия круга. */
const PIE_HOLE: number = 0.6;

/** Отступ солнечных лучей от края поля. */
const SUNBURST_INSET: number = 8;

/** Кольца солнечных лучей в долях радиуса: внутреннее — группы, внешнее — их дети. */
const RINGS: Readonly<Record<'groups' | 'children', readonly [number, number]>> = { groups: [0.29, 0.65], children: [0.69, 1] };

/** Плотность детей по очереди: соседние доли одной группы различимы. */
const CHILD_OPACITY: readonly number[] = [0.7, 0.45];

/** Подпись в отверстии круга. */
const CENTER_FONT: number = 16;

const sectorPath: Arc<unknown, ISector> = arc<ISector>()
    .innerRadius((sector: ISector): number => sector.inner)
    .outerRadius((sector: ISector): number => sector.outer)
    .padAngle((sector: ISector): number => sector.padAngle);

function centerOf(size: IRtChartSize): string {
    return `translate(${size.width / 2},${size.height / 2})`;
}

function nodeValue(node: IRtChart.Node): number {
    return node.children?.length
        ? node.children.reduce((sum: number, child: IRtChart.Node): number => sum + nodeValue(child), 0)
        : (node.value ?? 0);
}

/** Сцена круга: секторы с зазором, отверстие и подпись в нём. */
export function rtChartPieScene(data: IRtChart.Pie, size: IRtChartSize): IRtChartScene {
    const outer: number = Math.max(0, Math.min(size.width, size.height) / 2 - PIE_INSET);
    const layout: Pie<unknown, IRtChart.Item> = pie<IRtChart.Item>()
        .value((item: IRtChart.Item): number => item.value)
        .sort(null)
        .padAngle(PAD_ANGLE.pie);
    const transform: string = centerOf(size);
    const paths: IRtChartPath[] = layout([...data.items]).map((slice: PieArcDatum<IRtChart.Item>, index: number): IRtChartPath => ({
        ...rtChartFill(
            `slice-${index}`,
            sectorPath({
                outer,
                startAngle: slice.startAngle,
                endAngle: slice.endAngle,
                inner: outer * PIE_HOLE,
                padAngle: slice.padAngle,
            }) ?? '',
            rtChartSlot(rtChartSlotAt(index, slice.data.slot)),
            1,
            [rtChartTipLine(slice.data.name, slice.data.value, data.format)]
        ),
        transform,
    }));

    return {
        paths,
        texts: data.center
            ? [
                  {
                      key: 'center',
                      x: size.width / 2,
                      y: size.height / 2,
                      text: data.center,
                      anchor: 'middle',
                      fill: RT_CHART_COLOR.text,
                      size: CENTER_FONT,
                      weight: 600,
                  },
              ]
            : [],
        legend: data.items.map((item: IRtChart.Item, index: number): IRtChartLegendItem => ({
            name: item.name,
            color: rtChartSlot(rtChartSlotAt(index, item.slot)),
            mark: 'dot',
        })),
    };
}

/** Сцена солнечных лучей: группы во внутреннем кольце, их дети — во внешнем, в цвете группы. */
export function rtChartSunburstScene(data: IRtChart.Tree, size: IRtChartSize): IRtChartScene {
    const radius: number = Math.max(0, Math.min(size.width, size.height) / 2 - SUNBURST_INSET);
    const total: number = data.nodes.reduce((sum: number, node: IRtChart.Node): number => sum + nodeValue(node), 0) || 1;
    const transform: string = centerOf(size);
    const paths: IRtChartPath[] = [];
    let angle: number = 0;

    data.nodes.forEach((node: IRtChart.Node, index: number): void => {
        const value: number = nodeValue(node);
        const span: number = (value / total) * Math.PI * 2;
        const color: string = rtChartSlot(rtChartSlotAt(index, node.slot));
        const sector: ISector = {
            startAngle: angle,
            endAngle: angle + span,
            inner: radius * RINGS.groups[0],
            outer: radius * RINGS.groups[1],
            padAngle: PAD_ANGLE.sunburst,
        };
        let childAngle: number = angle;

        paths.push({
            ...rtChartFill(`group-${index}`, sectorPath(sector) ?? '', color, 1, [rtChartTipLine(node.name, value, data.format)]),
            transform,
        });

        (node.children ?? []).forEach((child: IRtChart.Node, childIndex: number): void => {
            const childSpan: number = value > 0 ? (nodeValue(child) / value) * span : 0;
            const childSector: ISector = {
                startAngle: childAngle,
                endAngle: childAngle + childSpan,
                inner: radius * RINGS.children[0],
                outer: radius * RINGS.children[1],
                padAngle: PAD_ANGLE.sunburst,
            };

            paths.push({
                ...rtChartFill(
                    `child-${index}-${childIndex}`,
                    sectorPath(childSector) ?? '',
                    child.slot ? rtChartSlot(child.slot) : color,
                    CHILD_OPACITY[childIndex % CHILD_OPACITY.length],
                    [node.name, rtChartTipLine(child.name, nodeValue(child), data.format)]
                ),
                transform,
            });
            childAngle += childSpan;
        });

        angle += span;
    });

    return {
        paths,
        texts: [],
        legend: data.nodes.map((node: IRtChart.Node, index: number): IRtChartLegendItem => ({
            name: node.name,
            color: rtChartSlot(rtChartSlotAt(index, node.slot)),
            mark: 'dot',
        })),
    };
}
