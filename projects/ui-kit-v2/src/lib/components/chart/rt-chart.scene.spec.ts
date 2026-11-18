import { rtChartWidthsAtLeast } from './rt-chart.blocks';
import { rtChartIsEmpty } from './rt-chart.empty';
import { rtChartEstimate, rtChartScene } from './rt-chart.layout';
import { IRtChart } from './rt-chart.model';
import { IRtChartAxis, IRtChartPath, IRtChartScene, IRtChartSize, rtChartAxis } from './rt-chart.scene';

const SIZE: IRtChartSize = { width: 328, height: 188 };

function draw(data: IRtChart.TData): IRtChartScene {
    return rtChartScene(data, SIZE, rtChartEstimate);
}

function keysOf(scene: IRtChartScene, prefix: string): string[] {
    return scene.paths.filter((path: IRtChartPath): boolean => path.key.startsWith(prefix)).map((path: IRtChartPath): string => path.key);
}

const TREE: readonly IRtChart.Node[] = [
    {
        name: 'Проживание',
        children: [
            { name: 'Номера', value: 40 },
            { name: 'Виллы', value: 30 },
        ],
    },
    { name: 'Услуги', children: [{ name: 'Спа', value: 30 }] },
];

describe('rtChartScene', (): void => {
    it('SC-UKV-1340 — наибольшее значение 90 даёт ось от 0 до 100 с шагом 25', (): void => {
        const axis: IRtChartAxis = rtChartAxis(0, 90, 4);

        expect(axis).toEqual({ min: 0, max: 100, step: 25, ticks: [0, 25, 50, 75, 100] });
    });

    it('SC-UKV-1340 — свои границы и шаг оси берутся как есть', (): void => {
        expect(rtChartAxis(0, 38, 4, { min: 0, max: 40, step: 10 }).ticks).toEqual([0, 10, 20, 30, 40]);
        expect(rtChartAxis(0, 180, 4).ticks).toEqual([0, 50, 100, 150, 200]);
    });

    it('SC-UKV-1337 — декартов график рисует полосу, область, столбики, линию и точки', (): void => {
        const scene: IRtChartScene = draw({
            kind: 'cartesian',
            categories: ['Янв', 'Фев', 'Мар'],
            series: [
                { name: 'Факт', type: 'area', values: [10, 20, 15], band: { low: [8, 15, 12], high: [12, 25, 18] }, points: true },
                { name: 'План', type: 'bar', values: [12, 18, 20] },
                { name: 'Цель', type: 'line', values: [15, 15, 15], dashed: true },
            ],
        });

        expect(keysOf(scene, 'band-')).toEqual(['band-0']);
        expect(keysOf(scene, 'area-')).toEqual(['area-0']);
        expect(keysOf(scene, 'bar-')).toHaveLength(3);
        expect(keysOf(scene, 'line-')).toEqual(['line-0', 'line-2']);
        expect(keysOf(scene, 'point-')).toHaveLength(3);
        expect(scene.paths.find((path: IRtChartPath): boolean => path.key === 'line-2')?.dash).toBe('4 4');
    });

    it('SC-UKV-1337 — круг, тепловая карта и точки рисуют секторы, ячейки и точки', (): void => {
        const pie: IRtChartScene = draw({
            kind: 'pie',
            items: [
                { name: 'А', value: 3 },
                { name: 'Б', value: 1 },
            ],
            center: '100%',
        });
        const heat: IRtChartScene = draw({
            kind: 'heatmap',
            columns: ['Пн', 'Вт'],
            rows: ['9', '10'],
            values: [
                [1, 2],
                [3, null],
            ],
        });
        const scatter: IRtChartScene = draw({
            kind: 'scatter',
            series: [
                {
                    name: 'Будни',
                    points: [
                        [10, 20],
                        [30, 40],
                    ],
                },
            ],
        });

        expect(keysOf(pie, 'slice-')).toEqual(['slice-0', 'slice-1']);
        expect(pie.texts.map((text: { text: string }): string => text.text)).toEqual(['100%']);
        expect(keysOf(heat, 'cell-')).toEqual(['cell-0-0', 'cell-0-1', 'cell-1-0']);
        expect(keysOf(scatter, 'point-')).toEqual(['point-0-0', 'point-0-1']);
    });

    it('SC-UKV-1337 — дерево прямоугольников и солнечные лучи рисуют группы и вложенные доли', (): void => {
        const treemap: IRtChartScene = draw({ kind: 'treemap', nodes: TREE });
        const sunburst: IRtChartScene = draw({ kind: 'sunburst', nodes: TREE });

        expect(keysOf(treemap, 'group-')).toEqual(['group-0', 'group-1']);
        expect(keysOf(treemap, 'leaf-')).toEqual(['leaf-0', 'leaf-1', 'leaf-2']);
        expect(treemap.legend.map((item: { name: string }): string => item.name)).toEqual(['Номера', 'Виллы', 'Спа']);
        expect(keysOf(sunburst, 'group-')).toEqual(['group-0', 'group-1']);
        expect(keysOf(sunburst, 'child-')).toEqual(['child-0-0', 'child-0-1', 'child-1-0']);
    });

    it('SC-UKV-1337 — группа дерева не уже своей подписи, остальное делится по значениям', (): void => {
        expect(rtChartWidthsAtLeast([70, 30], [0, 0], 300)).toEqual([210, 90]);
        expect(rtChartWidthsAtLeast([70, 30], [0, 120], 300)).toEqual([180, 120]);
        expect(rtChartWidthsAtLeast([50, 50], [200, 200], 300)).toEqual([150, 150]);
    });

    it('SC-UKV-1337 — тепловая карта даёт шкалу плотности от нуля до круглого верха', (): void => {
        const heatmap: IRtChartScene = draw({
            kind: 'heatmap',
            columns: ['Пн', 'Вт'],
            rows: ['Н1'],
            values: [[0, 90]],
            format: (value: number): string => `${value}%`,
        });

        expect(heatmap.scale?.low).toBe('0%');
        expect(heatmap.scale?.high).toBe('100%');
        expect(heatmap.scale?.steps.map((step: number): number => Number(step.toFixed(2)))).toEqual([0.12, 0.34, 0.56, 0.78, 1]);
        expect(heatmap.paths.map((path: IRtChartPath): number => Number(path.opacity.toFixed(3)))).toEqual([0.12, 0.912]);
    });

    it('SC-UKV-1333 — пустыми считаются данные без единого значения', (): void => {
        expect(rtChartIsEmpty({ kind: 'cartesian', categories: ['А'], series: [{ name: 'А', type: 'line', values: [null] }] })).toBe(true);
        expect(rtChartIsEmpty({ kind: 'cartesian', categories: ['А'], series: [{ name: 'А', type: 'line', values: [0] }] })).toBe(false);
        expect(rtChartIsEmpty({ kind: 'treemap', nodes: [{ name: 'Группа', children: [] }] })).toBe(true);
    });
});
