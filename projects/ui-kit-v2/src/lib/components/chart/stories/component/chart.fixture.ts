import { IRtChart } from '../../rt-chart.model';

/** Карточка витрины: подпись, как в макете, и данные графика в модели кита. */
export interface IChartStoryCase {
    readonly name: string;
    readonly data: IRtChart.TData;
}

const MONTHS: readonly string[] = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];

const ROOMS: string = 'Номера';

const RESTAURANT: string = 'Ресторан';

/** Значения гистограммы: заявки по длительности, колокол со сдвигом; корзина — час. */
const HISTOGRAM: readonly number[] = [3, 6, 11, 18, 26, 33, 36, 30, 21, 13, 8, 5];

/** Границы корзин гистограммы: подписей на одну больше, чем корзин. */
const HOURS: readonly string[] = [...Array.from({ length: 12 }, (_: unknown, hour: number): string => String(hour)), '12 ч'];

/** Тепловая карта: загрузка по дням недели за пять недель, как в макете. */
const HEAT: ReadonlyArray<readonly number[]> = [
    [0, 50, 0, 50, 0, 50, 0],
    [30, 80, 30, 80, 30, 80, 30],
    [60, 10, 60, 10, 60, 10, 60],
    [90, 40, 90, 40, 90, 40, 90],
    [20, 70, 20, 70, 20, 70, 20],
];

function percent(value: number): string {
    return `${Math.round(value * 100)}%`;
}

/** Тринадцать карточек макета в его порядке; последняя — пустые данные. */
export const CHART_CASES: readonly IChartStoryCase[] = [
    {
        name: 'Линия',
        data: {
            kind: 'cartesian',
            categories: MONTHS,
            series: [
                { name: 'Выручка', type: 'line', values: [62, 70, 57, 80, 76, 89] },
                { name: 'Расходы', type: 'line', values: [40, 45, 52, 48, 60, 57] },
            ],
        },
    },
    {
        name: 'Столбики',
        data: {
            kind: 'cartesian',
            categories: MONTHS,
            series: [
                { name: 'План', type: 'bar', values: [55, 68, 47, 80, 72, 90] },
                { name: 'Факт', type: 'bar', values: [38, 42, 51, 46, 58, 61] },
            ],
        },
    },
    {
        name: 'Столбики стопкой',
        data: {
            kind: 'cartesian',
            categories: MONTHS,
            series: [
                { name: ROOMS, type: 'bar', stack: 'sum', values: [60, 70, 55, 80, 75, 90] },
                { name: RESTAURANT, type: 'bar', stack: 'sum', values: [40, 35, 50, 40, 55, 50] },
                { name: 'Услуги', type: 'bar', stack: 'sum', values: [25, 20, 30, 40, 30, 40] },
            ],
        },
    },
    {
        // Факт и прогноз — одна величина: один цвет, прогноз штрихом и полосой разброса.
        name: 'Область с полосой прогноза',
        data: {
            kind: 'cartesian',
            place: 'edge',
            labelEvery: 2,
            categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'],
            series: [
                { name: 'Факт', type: 'area', values: [40, 48, 45, 58, 62, null, null, null] },
                {
                    name: 'Прогноз и полоса',
                    type: 'line',
                    slot: 1,
                    dashed: true,
                    values: [null, null, null, null, 62, 66, 70, 74],
                    band: { low: [null, null, null, null, 62, 58, 59, 60], high: [null, null, null, null, 62, 74, 81, 88] },
                },
            ],
        },
    },
    {
        name: 'Две панели',
        data: {
            kind: 'cartesian',
            categories: MONTHS,
            axes: [
                { min: 0, max: 200, step: 100 },
                { min: 0, max: 1, step: 0.5, format: percent },
            ],
            series: [
                { name: 'Средняя цена, тыс.', type: 'line', points: true, mark: 'line', values: [120, 135, 112, 150, 140, 165] },
                { name: 'Загрузка, %', type: 'bar', panel: 1, values: [0.55, 0.6, 0.5, 0.78, 0.75, 0.88] },
            ],
        },
    },
    {
        name: 'Гистограмма',
        data: {
            kind: 'cartesian',
            place: 'bins',
            labelEvery: 2,
            categories: HOURS,
            series: [{ name: 'Заявки по длительности', type: 'bar', values: HISTOGRAM }],
        },
    },
    {
        name: 'Области стопкой с линиями',
        data: {
            kind: 'cartesian',
            place: 'edge',
            categories: MONTHS,
            series: [
                { name: 'Прямые', type: 'area', stack: 'sum', values: [40, 45, 44, 55, 58, 60] },
                { name: 'Агентства', type: 'area', stack: 'sum', values: [30, 35, 36, 38, 40, 42] },
                { name: 'Группы', type: 'area', stack: 'sum', values: [15, 15, 18, 20, 22, 24] },
                { name: 'Прогноз', type: 'line', dashed: true, mark: 'line', values: [92, 110, 112, 130, 138, 150] },
                // Шестой цвет палитры зелёный, как третий: прошлый год берёт седьмой, как в макете.
                { name: 'Прошлый год', type: 'line', slot: 7, mark: 'line', values: [88, 95, 100, 110, 118, 128] },
            ],
        },
    },
    {
        name: 'Круговая',
        data: {
            kind: 'pie',
            center: '100%',
            items: [
                { name: 'Прямые', value: 38 },
                { name: 'Сайт', value: 27 },
                { name: 'Агентства', value: 18 },
                { name: 'Звонки', value: 10 },
                { name: 'Другое', value: 7 },
            ],
        },
    },
    {
        name: 'Тепловая карта',
        data: {
            kind: 'heatmap',
            columns: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            rows: ['Н1', 'Н2', 'Н3', 'Н4', 'Н5'],
            values: HEAT,
            format: (value: number): string => `${value}%`,
        },
    },
    {
        name: 'Точки',
        data: {
            kind: 'scatter',
            x: { min: 0, max: 100, step: 25 },
            series: [
                {
                    name: 'Будни',
                    points: [
                        [8, 30],
                        [18, 42],
                        [24, 38],
                        [36, 54],
                        [46, 58],
                        [56, 58],
                        [72, 73],
                        [92, 80],
                    ],
                },
                {
                    name: 'Выходные',
                    points: [
                        [12, 62],
                        [22, 70],
                        [30, 66],
                        [40, 76],
                        [52, 79],
                        [70, 87],
                        [80, 92],
                    ],
                },
            ],
        },
    },
    {
        name: 'Дерево прямоугольников',
        data: {
            kind: 'treemap',
            format: (value: number): string => `${value}%`,
            nodes: [
                {
                    name: 'Проживание',
                    children: [
                        { name: ROOMS, value: 40 },
                        { name: 'Апартаменты', value: 15 },
                        { name: 'Виллы', value: 15 },
                    ],
                },
                {
                    name: 'Доп. услуги',
                    children: [
                        { name: RESTAURANT, value: 15 },
                        { name: 'Спа', value: 8 },
                        // Шестой лист берёт седьмой цвет, а не зелёный шестой: так в макете.
                        { name: 'Трансфер', value: 7, slot: 7 },
                    ],
                },
            ],
        },
    },
    {
        name: 'Солнечные лучи',
        data: {
            kind: 'sunburst',
            nodes: [
                {
                    name: ROOMS,
                    children: [
                        { name: 'Будни', value: 28 },
                        { name: 'Выходные', value: 12 },
                    ],
                },
                {
                    name: RESTAURANT,
                    children: [
                        { name: 'Будни', value: 16 },
                        { name: 'Выходные', value: 9 },
                    ],
                },
                {
                    name: 'Услуги',
                    children: [
                        { name: 'Будни', value: 9 },
                        { name: 'Выходные', value: 6 },
                    ],
                },
            ],
        },
    },
    {
        name: 'Пустые данные',
        data: { kind: 'cartesian', categories: MONTHS, series: [{ name: 'Выручка', type: 'line', values: [] }] },
    },
];
