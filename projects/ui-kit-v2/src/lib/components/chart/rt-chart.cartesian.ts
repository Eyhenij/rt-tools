import { area, Area, line, Line } from 'd3-shape';

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
    rtChartCircle,
    rtChartFill,
    rtChartGridLine,
    rtChartLeft,
    rtChartNumber,
    rtChartRect,
    rtChartSlot,
    rtChartSlotAt,
    rtChartTipLine,
    TRtChartMeasure,
} from './rt-chart.scene';

/** Промежуток между двумя панелями. */
const PANEL_GAP: number = 14;

/** Доли высоты двух панелей: верхняя — главная и выше нижней, 78 к 68 в макете. */
const PANEL_SHARES: readonly number[] = [78 / 146, 68 / 146];

/** Промежуток между столбиками группы и между долями стопки. */
const BAR_GAP: number = 2;

/** Ширина столбика: в группе, одиночного и стопки. */
const BAR_WIDTH: Readonly<Record<'group' | 'single' | 'stack', number>> = { group: 12, single: 16, stack: 24 };

/** Плотность заливки: области без стопки, области в стопке и полосы разброса. */
const OPACITY: Readonly<Record<'area' | 'stacked' | 'band', number>> = { area: 0.12, stacked: 0.85, band: 0.16 };

/** Радиус точки на линии и на графике точек. */
const POINT_RADIUS: number = 4;

/** Положение панели по вертикали и её ось. */
interface IPanel {
    readonly top: number;
    readonly height: number;
    readonly axis: IRtChartAxis;
    readonly format: IRtChart.TFormat;
}

/** Где стоят значения и подписи по горизонтали. */
interface IColumns {
    readonly count: number;
    readonly width: number;
    center(index: number): number;
    label(index: number): number;
}

/** Слот столбика в группе категории. */
interface IBarSlot {
    readonly index: number;
    readonly stack: boolean;
}

function slotOf(series: readonly IRtChart.Series[], index: number): IRtChart.TSlot {
    return rtChartSlotAt(index, series[index].slot);
}

/** Сумма серий одной стопки до данной серии включительно — по категориям. */
function stackTops(series: readonly IRtChart.Series[], count: number): number[][] {
    const sums: Map<string, number[]> = new Map<string, number[]>();

    return series.map((item: IRtChart.Series): number[] => {
        if (!item.stack) {
            return item.values.map((value: number | null): number => value ?? 0);
        }

        const key: string = `${item.panel ?? 0}:${item.type}:${item.stack}`;
        const sum: number[] = sums.get(key) ?? Array.from({ length: count }, (): number => 0);
        const next: number[] = sum.map((value: number, index: number): number => value + (item.values[index] ?? 0));

        sums.set(key, next);

        return next;
    });
}

function panelExtent(series: readonly IRtChart.Series[], tops: number[][], panel: number): [number, number] {
    let low: number = 0;
    let high: number = 0;

    series.forEach((item: IRtChart.Series, index: number): void => {
        if ((item.panel ?? 0) !== panel) {
            return;
        }

        const values: number[] = [
            ...tops[index],
            ...(item.band?.low ?? []).filter((v: number | null): v is number => v !== null),
            ...(item.band?.high ?? []).filter((v: number | null): v is number => v !== null),
        ];

        values.forEach((value: number): void => {
            low = Math.min(low, value);
            high = Math.max(high, value);
        });
    });

    return [low, high];
}

function columnsOf(data: IRtChart.Cartesian, left: number, width: number): IColumns {
    const place: IRtChart.TCategoryPlace = data.place ?? 'band';
    const labels: number = data.categories.length;
    const plot: number = width - left;

    if (place === 'edge') {
        const step: number = labels > 1 ? plot / (labels - 1) : plot;

        return {
            count: labels,
            width: step,
            center: (i: number): number => left + i * step,
            label: (i: number): number => left + i * step,
        };
    }

    const count: number = place === 'bins' ? Math.max(labels - 1, 1) : labels;
    const band: number = plot / Math.max(count, 1);

    return {
        count,
        width: band,
        center: (i: number): number => left + (i + 0.5) * band,
        label: (i: number): number => (place === 'bins' ? left + i * band : left + (i + 0.5) * band),
    };
}

function categoryName(data: IRtChart.Cartesian, index: number): string {
    return data.place === 'bins' ? `${data.categories[index]}–${data.categories[index + 1] ?? ''}` : (data.categories[index] ?? '');
}

/** Подписи категорий: каждая n-я, крайняя справа не выходит за поле. */
function categoryTexts(data: IRtChart.Cartesian, columns: IColumns, y: number, width: number, measure: TRtChartMeasure): IRtChartText[] {
    const every: number = Math.max(1, data.labelEvery ?? 1);

    return data.categories.flatMap((name: string, index: number): IRtChartText[] => {
        if (index % every !== 0) {
            return [];
        }

        const x: number = columns.label(index);
        const overflow: boolean = x + measure(name, RT_CHART_AXIS_FONT) / 2 > width;

        return [rtChartAxisText(`x-${index}`, overflow ? width : x, y, name, overflow ? 'end' : 'middle')];
    });
}

function barSlots(series: readonly IRtChart.Series[], panel: number): Map<number, IBarSlot> {
    const slots: Map<number, IBarSlot> = new Map<number, IBarSlot>();
    const stacks: Map<string, number> = new Map<string, number>();
    let next: number = 0;

    series.forEach((item: IRtChart.Series, index: number): void => {
        if (item.type !== 'bar' || (item.panel ?? 0) !== panel) {
            return;
        }

        const known: number | undefined = item.stack ? stacks.get(item.stack) : undefined;

        if (known !== undefined) {
            slots.set(index, { index: known, stack: true });

            return;
        }

        if (item.stack) {
            stacks.set(item.stack, next);
        }

        slots.set(index, { index: next, stack: Boolean(item.stack) });
        next += 1;
    });

    return slots;
}

/** Ширина столбика: корзина — во всю полосу, группа — узкие, прочие шире; в узкой колонке — по ней. */
function barWidth(data: IRtChart.Cartesian, columns: IColumns, groups: number, stacked: boolean): number {
    if (data.place === 'bins') {
        return columns.width - BAR_GAP;
    }
    const fits: number = (columns.width - BAR_GAP * groups) / groups;
    const designed: number = Math.min(BAR_WIDTH[stacked ? 'stack' : 'single'], groups > 1 ? BAR_WIDTH.group : Infinity);

    return Math.max(1, Math.min(designed, fits));
}

function barPaths(
    data: IRtChart.Cartesian,
    tops: number[][],
    columns: IColumns,
    panel: IPanel,
    panelIndex: number,
    yOf: (value: number) => number
): IRtChartPath[] {
    const slots: Map<number, IBarSlot> = barSlots(data.series, panelIndex);
    const groups: number = new Set([...slots.values()].map((slot: IBarSlot): number => slot.index)).size;
    const stacked: boolean = [...slots.values()].some((slot: IBarSlot): boolean => slot.stack);
    const width: number = barWidth(data, columns, groups, stacked);
    const total: number = groups * width + (groups - 1) * BAR_GAP;
    const paths: IRtChartPath[] = [];

    slots.forEach((slot: IBarSlot, seriesIndex: number): void => {
        const item: IRtChart.Series = data.series[seriesIndex];
        const color: string = rtChartSlot(slotOf(data.series, seriesIndex));

        item.values.forEach((value: number | null, i: number): void => {
            if (value === null || value === 0 || i >= columns.count) {
                return;
            }

            const x: number = columns.center(i) - total / 2 + slot.index * (width + BAR_GAP);
            const top: number = yOf(tops[seriesIndex][i]);
            const bottom: number = slot.stack ? yOf(tops[seriesIndex][i] - value) - BAR_GAP : yOf(0);

            paths.push(rtChartFill(`bar-${seriesIndex}-${i}`, rtChartRect(x, Math.min(top, bottom), width, Math.abs(bottom - top)), color));
        });
    });

    return paths.filter((): boolean => panel.height > 0);
}

/** Что серия-линия или серия-область знает о своём месте на поле. */
interface ITrace {
    readonly item: IRtChart.Series;
    readonly index: number;
    readonly color: string;
    readonly top: number[];
    readonly indices: number[];
    x(i: number): number;
    y(v: number): number;
}

function definedAt(values: ReadonlyArray<number | null>, i: number): boolean {
    return values[i] !== null && values[i] !== undefined;
}

function bandPath(trace: ITrace, band: IRtChart.Band): IRtChartPath {
    const shape: Area<number> = area<number>()
        .defined((i: number): boolean => definedAt(band.low, i) && definedAt(band.high, i))
        .x((i: number): number => trace.x(i))
        .y0((i: number): number => trace.y(band.low[i] ?? 0))
        .y1((i: number): number => trace.y(band.high[i] ?? 0));

    return rtChartFill(`band-${trace.index}`, shape(trace.indices) ?? '', trace.color, OPACITY.band);
}

/** Область стопки — плотная с швом цвета подложки; одиночная — прозрачная, линию над ней рисует серия. */
function areaPath(trace: ITrace): IRtChartPath {
    const { item, top }: ITrace = trace;
    const shape: Area<number> = area<number>()
        .defined((i: number): boolean => definedAt(item.values, i))
        .x((i: number): number => trace.x(i))
        .y0((i: number): number => trace.y(item.stack ? top[i] - (item.values[i] ?? 0) : 0))
        .y1((i: number): number => trace.y(top[i]));
    const d: string = shape(trace.indices) ?? '';

    if (!item.stack) {
        return rtChartFill(`area-${trace.index}`, d, trace.color, OPACITY.area);
    }

    return { ...rtChartFill(`area-${trace.index}`, d, trace.color, OPACITY.stacked), stroke: RT_CHART_COLOR.surface, width: 1 };
}

function linePath(trace: ITrace): IRtChartPath {
    const shape: Line<number> = line<number>()
        .defined((i: number): boolean => definedAt(trace.item.values, i))
        .x((i: number): number => trace.x(i))
        .y((i: number): number => trace.y(trace.top[i]));

    return {
        ...rtChartFill(`line-${trace.index}`, shape(trace.indices) ?? '', 'none'),
        stroke: trace.color,
        width: 2,
        dash: trace.item.dashed ? '4 4' : null,
    };
}

function pointPaths(trace: ITrace): IRtChartPath[] {
    return trace.indices
        .filter((i: number): boolean => definedAt(trace.item.values, i))
        .map((i: number): IRtChartPath => ({
            ...rtChartFill(`point-${trace.index}-${i}`, rtChartCircle(trace.x(i), trace.y(trace.top[i]), POINT_RADIUS), trace.color),
            stroke: RT_CHART_COLOR.surface,
            width: 2,
        }));
}

function linePaths(data: IRtChart.Cartesian, tops: number[][], columns: IColumns, yOf: (p: number, v: number) => number): IRtChartPath[] {
    const traces: ITrace[] = data.series.flatMap((item: IRtChart.Series, index: number): ITrace[] => {
        if (item.type === 'bar') {
            return [];
        }

        return [
            {
                item,
                index,
                color: rtChartSlot(slotOf(data.series, index)),
                top: tops[index],
                indices: item.values.map((_value: number | null, i: number): number => i).filter((i: number): boolean => i < columns.count),
                x: (i: number): number => columns.center(i),
                y: (v: number): number => yOf(item.panel ?? 0, v),
            },
        ];
    });
    const drawsLine: (trace: ITrace) => boolean = (trace: ITrace): boolean => trace.item.type === 'line' || !trace.item.stack;

    return [
        ...traces.flatMap((trace: ITrace): IRtChartPath[] => (trace.item.band ? [bandPath(trace, trace.item.band)] : [])),
        ...traces.filter((trace: ITrace): boolean => trace.item.type === 'area').map(areaPath),
        ...traces.filter(drawsLine).map(linePath),
        ...traces.filter((trace: ITrace): boolean => drawsLine(trace) && Boolean(trace.item.points)).flatMap(pointPaths),
    ];
}

/** Невидимые столбцы по категориям: над ними подсказка со значениями всех серий. */
function columnHits(
    data: IRtChart.Cartesian,
    columns: IColumns,
    top: number,
    bottom: number,
    formats: readonly IRtChart.TFormat[]
): IRtChartPath[] {
    return Array.from({ length: columns.count }, (_value: unknown, i: number): IRtChartPath => {
        const tip: string[] = [
            categoryName(data, i),
            ...data.series.map((item: IRtChart.Series): string => rtChartTipLine(item.name, item.values[i], formats[item.panel ?? 0])),
        ];

        return rtChartFill(
            `hit-${i}`,
            rtChartRect(columns.center(i) - columns.width / 2, top, columns.width, bottom - top),
            'transparent',
            1,
            tip
        );
    });
}

function legendOf(series: readonly IRtChart.Series[]): IRtChartLegendItem[] {
    return series.map((item: IRtChart.Series, index: number): IRtChartLegendItem => ({
        name: item.name,
        color: rtChartSlot(slotOf(series, index)),
        mark: item.mark ?? 'dot',
    }));
}

/** Подписи значений слева и ширина под них. */
function valueTexts(panels: readonly IPanel[], measure: TRtChartMeasure): { left: number; texts: (left: number) => IRtChartText[] } {
    const labels: Array<{ panel: number; value: number; text: string }> = panels.flatMap((panel: IPanel, p: number) =>
        panel.axis.ticks.map((value: number) => ({ value, panel: p, text: panel.format(value) }))
    );
    const widest: number = Math.max(0, ...labels.map((label: { text: string }): number => measure(label.text, RT_CHART_AXIS_FONT)));
    const left: number = rtChartLeft(widest);

    return {
        left,
        texts: (x: number): IRtChartText[] =>
            labels.map((label: { panel: number; value: number; text: string }): IRtChartText => {
                const panel: IPanel = panels[label.panel];
                const y: number = panel.top + ((panel.axis.max - label.value) / (panel.axis.max - panel.axis.min || 1)) * panel.height;

                return rtChartAxisText(`y-${label.panel}-${label.value}`, x - RT_CHART_LABEL_GAP, y, label.text, 'end');
            }),
    };
}

/** Сцена декартова графика: сетка, подписи осей, полосы, области, столбики, линии и точки. */
export function rtChartCartesianScene(data: IRtChart.Cartesian, size: IRtChartSize, measure: TRtChartMeasure): IRtChartScene {
    const count: number = data.place === 'bins' ? Math.max(data.categories.length - 1, 1) : data.categories.length;
    const panelCount: number = data.series.some((item: IRtChart.Series): boolean => item.panel === 1) ? 2 : 1;
    const intervals: number = panelCount === 1 ? 4 : 2;
    const bottom: number = size.height - RT_CHART_BOTTOM;
    const room: number = bottom - RT_CHART_TOP - PANEL_GAP * (panelCount - 1);
    const shares: readonly number[] = panelCount === 1 ? [1] : PANEL_SHARES;
    const tops: number[][] = stackTops(data.series, count);
    const panels: IPanel[] = Array.from({ length: panelCount }, (_value: unknown, p: number): IPanel => {
        const [low, high]: [number, number] = panelExtent(data.series, tops, p);
        const own: IRtChart.ValueAxis = data.axes?.[p] ?? {};
        const above: number = shares.slice(0, p).reduce((sum: number, share: number): number => sum + share * room + PANEL_GAP, 0);

        return {
            height: shares[p] * room,
            top: RT_CHART_TOP + above,
            axis: rtChartAxis(low, high, intervals, own),
            format: own.format ?? rtChartNumber,
        };
    });
    const values: { left: number; texts: (left: number) => IRtChartText[] } = valueTexts(panels, measure);
    const left: number = values.left;
    const columns: IColumns = columnsOf(data, left, size.width);
    const yOf: (p: number, v: number) => number = (p: number, v: number): number => {
        const panel: IPanel = panels[p];

        return panel.top + ((panel.axis.max - v) / (panel.axis.max - panel.axis.min || 1)) * panel.height;
    };
    const grid: IRtChartPath[] = panels.flatMap((panel: IPanel, p: number): IRtChartPath[] =>
        panel.axis.ticks.map((value: number): IRtChartPath => rtChartGridLine(`grid-${p}-${value}`, left, yOf(p, value), size.width - left))
    );
    const bars: IRtChartPath[] = panels.flatMap((panel: IPanel, p: number): IRtChartPath[] =>
        barPaths(data, tops, columns, panel, p, (v: number): number => yOf(p, v))
    );

    return {
        paths: [
            ...grid,
            ...bars,
            ...linePaths(data, tops, columns, yOf),
            ...columnHits(
                data,
                columns,
                RT_CHART_TOP,
                bottom,
                panels.map((panel: IPanel): IRtChart.TFormat => panel.format)
            ),
        ],
        texts: [...values.texts(left), ...categoryTexts(data, columns, bottom + 4 + RT_CHART_AXIS_FONT * 0.7, size.width, measure)],
        legend: legendOf(data.series),
    };
}

/** Сцена графика точек: сетка, подписи двух осей значений и точки с обводкой подложки. */
export function rtChartScatterScene(data: IRtChart.Scatter, size: IRtChartSize, measure: TRtChartMeasure): IRtChartScene {
    const all: Array<readonly [number, number]> = data.series.flatMap((item: IRtChart.ScatterSeries) => [...item.points]);
    const xs: number[] = all.map((point: readonly [number, number]): number => point[0]);
    const ys: number[] = all.map((point: readonly [number, number]): number => point[1]);
    const bottom: number = size.height - RT_CHART_BOTTOM;
    const yFormat: IRtChart.TFormat = data.y?.format ?? rtChartNumber;
    const xFormat: IRtChart.TFormat = data.x?.format ?? rtChartNumber;
    const panel: IPanel = {
        top: RT_CHART_TOP,
        height: bottom - RT_CHART_TOP,
        axis: rtChartAxis(Math.min(0, ...ys), Math.max(0, ...ys), 4, data.y),
        format: yFormat,
    };
    const values: { left: number; texts: (left: number) => IRtChartText[] } = valueTexts([panel], measure);
    const left: number = values.left;
    const xAxis: IRtChartAxis = rtChartAxis(Math.min(0, ...xs), Math.max(0, ...xs), 4, data.x);
    const xOf: (v: number) => number = (v: number): number => left + ((v - xAxis.min) / (xAxis.max - xAxis.min || 1)) * (size.width - left);
    const yOf: (v: number) => number = (v: number): number =>
        panel.top + ((panel.axis.max - v) / (panel.axis.max - panel.axis.min || 1)) * panel.height;
    const xTexts: IRtChartText[] = xAxis.ticks.map((value: number): IRtChartText => {
        const text: string = xFormat(value);
        const x: number = xOf(value);
        const overflow: boolean = x + measure(text, RT_CHART_AXIS_FONT) / 2 > size.width;

        return rtChartAxisText(
            `x-${value}`,
            overflow ? size.width : x,
            bottom + 4 + RT_CHART_AXIS_FONT * 0.7,
            text,
            overflow ? 'end' : 'middle'
        );
    });
    const points: IRtChartPath[] = data.series.flatMap((item: IRtChart.ScatterSeries, index: number): IRtChartPath[] =>
        item.points.map((point: readonly [number, number], i: number): IRtChartPath => ({
            ...rtChartFill(
                `point-${index}-${i}`,
                rtChartCircle(xOf(point[0]), yOf(point[1]), POINT_RADIUS),
                rtChartSlot(rtChartSlotAt(index, item.slot)),
                1,
                [item.name, `${xFormat(point[0])}; ${yFormat(point[1])}`]
            ),
            stroke: RT_CHART_COLOR.surface,
            width: 2,
        }))
    );

    return {
        paths: [
            ...panel.axis.ticks.map((value: number): IRtChartPath => rtChartGridLine(`grid-${value}`, left, yOf(value), size.width - left)),
            ...points,
        ],
        texts: [...values.texts(left), ...xTexts],
        legend: data.series.map((item: IRtChart.ScatterSeries, index: number): IRtChartLegendItem => ({
            name: item.name,
            color: rtChartSlot(rtChartSlotAt(index, item.slot)),
            mark: 'dot',
        })),
    };
}
