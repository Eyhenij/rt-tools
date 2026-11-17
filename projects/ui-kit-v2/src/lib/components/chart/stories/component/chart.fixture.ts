import type { EChartsCoreOption } from 'echarts/core';

/**
 * Карточка витрины: подпись, как в макете, и опция графика. Опция, которой нужны цвета палитры по
 * именам, собирается из палитры, прочитанной с узла карточки.
 */
export interface IChartStoryCase {
    readonly name: string;
    readonly option?: EChartsCoreOption;
    readonly build?: (palette: readonly string[]) => EChartsCoreOption;
}

const MONTHS: readonly string[] = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];

const ROOMS: string = 'Номера';

const RESTAURANT: string = 'Ресторан';

/** Листья дерева прямоугольников в порядке палитры. */
const TREEMAP_LEAVES: readonly string[] = [ROOMS, 'Апартаменты', 'Виллы', RESTAURANT, 'Спа', 'Трансфер'];

/** Группы солнечных лучей в порядке палитры. */
const SUNBURST_GROUPS: readonly string[] = [ROOMS, RESTAURANT, 'Услуги'];

/**
 * Общее для карточек: без анимации, сетка держит подписи осей внутри поля. Поле графика в макете —
 * 188 из 217, ниже промежуток 12 и легенда 17. Вид осей и легенды даёт тема графика.
 */
const BASE: EChartsCoreOption = {
    animation: false,
    legend: {},
    tooltip: { trigger: 'axis' },
    grid: { top: 8, right: 0, bottom: 29, left: 0, containLabel: true },
};

/**
 * Пустая серия ради строки легенды: у дерева и солнечных лучей своей легенды нет. Пустой круг
 * такая серия не рисует.
 */
function legendOnly(name: string): EChartsCoreOption {
    return { name, type: 'pie', data: [], showEmptyCircle: false };
}

function card(name: string, option: EChartsCoreOption): IChartStoryCase {
    return { name, option: { ...BASE, ...option } };
}

/** Значения гистограммы: длительность заявок по часам, колокол со сдвигом. */
const HISTOGRAM: readonly number[] = [3, 6, 11, 18, 26, 33, 36, 30, 21, 13, 8, 5, 2];

/** Подпись оси гистограммы: каждый второй час, последний — с единицей. */
function histogramLabel(value: string): string {
    if (Number(value) % 2 !== 0) {
        return '';
    }

    return value === '12' ? '12 ч' : value;
}

/** Тепловая карта: пять ступеней загрузки, неделя на пять недель. */
const HEAT: readonly (readonly number[])[] = [
    [10, 70, 30, 90, 50, 70, 10],
    [30, 90, 10, 70, 30, 90, 30],
    [50, 70, 30, 90, 50, 70, 50],
    [90, 90, 50, 70, 90, 90, 70],
    [30, 10, 50, 10, 30, 10, 30],
];

/** Тринадцать карточек макета в его порядке; последняя — пустые данные. */
export const CHART_CASES: readonly IChartStoryCase[] = [
    card('Линия', {
        xAxis: { type: 'category', data: MONTHS, boundaryGap: false },
        yAxis: { type: 'value', min: 0, max: 100, interval: 25 },
        series: [
            { name: 'Выручка', type: 'line', data: [62, 70, 57, 80, 76, 89] },
            { name: 'Расходы', type: 'line', data: [40, 45, 52, 48, 60, 57] },
        ],
    }),
    card('Столбики', {
        xAxis: { type: 'category', data: MONTHS },
        yAxis: { type: 'value', min: 0, max: 100, interval: 25 },
        series: [
            { name: 'План', type: 'bar', data: [55, 68, 47, 80, 72, 90] },
            { name: 'Факт', type: 'bar', data: [38, 42, 51, 46, 58, 61] },
        ],
    }),
    card('Столбики стопкой', {
        xAxis: { type: 'category', data: MONTHS },
        yAxis: { type: 'value', min: 0, max: 200, interval: 50 },
        series: [
            { name: ROOMS, type: 'bar', stack: 'sum', data: [60, 70, 55, 80, 75, 90] },
            { name: RESTAURANT, type: 'bar', stack: 'sum', data: [40, 35, 50, 40, 55, 50] },
            { name: 'Услуги', type: 'bar', stack: 'sum', data: [25, 20, 30, 40, 30, 40] },
        ],
    }),
    {
        name: 'Область с полосой прогноза',
        // Факт и прогноз — одна величина: один цвет, прогноз штрихом и полосой.
        build: (palette: readonly string[]): EChartsCoreOption => ({
            ...BASE,
            xAxis: { type: 'category', data: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'], boundaryGap: false },
            yAxis: { type: 'value', min: 0, max: 100, interval: 25 },
            legend: { data: ['Факт', 'Прогноз и полоса'] },
            series: [
                { name: 'Факт', type: 'line', data: [40, 48, 45, 58, 62, null, null, null], areaStyle: { opacity: 0.16 } },
                {
                    name: 'Прогноз и полоса',
                    type: 'line',
                    data: [null, null, null, null, 62, 66, 70, 74],
                    lineStyle: { type: 'dashed' },
                },
                {
                    name: 'Нижняя граница',
                    type: 'line',
                    stack: 'band',
                    data: [null, null, null, null, 62, 58, 59, 60],
                    lineStyle: { opacity: 0 },
                },
                {
                    name: 'Ширина полосы',
                    type: 'line',
                    stack: 'band',
                    data: [null, null, null, null, 0, 16, 22, 28],
                    lineStyle: { opacity: 0 },
                    areaStyle: { opacity: 0.16 },
                },
            ].map((series: EChartsCoreOption): EChartsCoreOption => ({ ...series, color: palette[0] })),
        }),
    },
    card('Две панели', {
        grid: [
            { top: 8, right: 0, left: 0, height: 64, containLabel: true },
            { top: 92, right: 0, left: 0, bottom: 29, containLabel: true },
        ],
        xAxis: [
            { type: 'category', data: MONTHS, gridIndex: 0, axisLabel: { show: false } },
            { type: 'category', data: MONTHS, gridIndex: 1 },
        ],
        yAxis: [
            { type: 'value', min: 0, max: 200, interval: 100, gridIndex: 0 },
            {
                type: 'value',
                min: 0,
                max: 1,
                interval: 0.5,
                gridIndex: 1,
                axisLabel: { formatter: (value: number): string => `${value * 100}%` },
            },
        ],
        series: [
            { name: 'Средняя цена, тыс.', type: 'line', data: [120, 135, 112, 150, 140, 165], symbol: 'circle', symbolSize: 5 },
            { name: 'Загрузка, %', type: 'bar', data: [0.55, 0.6, 0.5, 0.78, 0.75, 0.88], xAxisIndex: 1, yAxisIndex: 1 },
        ],
    }),
    card('Гистограмма', {
        xAxis: {
            type: 'category',
            data: HISTOGRAM.map((_: number, index: number): string => String(index)),
            axisLabel: { formatter: histogramLabel },
        },
        yAxis: { type: 'value', min: 0, max: 40, interval: 10 },
        series: [{ name: 'Заявки по длительности', type: 'bar', barCategoryGap: 2, barMaxWidth: 40, data: HISTOGRAM }],
    }),
    {
        name: 'Области стопкой с линиями',
        build: (palette: readonly string[]): EChartsCoreOption => ({
            ...BASE,
            // Пять серий в легенде — две строки: сетка оставляет место под обе.
            grid: { top: 8, right: 0, bottom: 46, left: 0, containLabel: true },
            xAxis: { type: 'category', data: MONTHS, boundaryGap: false },
            yAxis: { type: 'value', min: 0, max: 200, interval: 50 },
            series: [
                { name: 'Прямые', type: 'line', stack: 'sum', data: [40, 45, 44, 55, 58, 60], areaStyle: { opacity: 0.9 } },
                { name: 'Агентства', type: 'line', stack: 'sum', data: [30, 35, 36, 38, 40, 42], areaStyle: { opacity: 0.9 } },
                { name: 'Группы', type: 'line', stack: 'sum', data: [15, 15, 18, 20, 22, 24], areaStyle: { opacity: 0.9 } },
                { name: 'Прогноз', type: 'line', data: [92, 110, 112, 130, 138, 150], lineStyle: { type: 'dashed' } },
                { name: 'Прошлый год', type: 'line', data: [88, 95, 100, 110, 118, 128], color: palette[6] },
            ],
        }),
    },
    card('Круговая', {
        tooltip: { trigger: 'item' },
        series: [
            {
                name: 'Каналы',
                type: 'pie',
                radius: ['54%', '78%'],
                center: ['50%', '42%'],
                padAngle: 1,
                label: { show: false },
                data: [
                    // Сумма в центре кольца — подпись первого сектора, поставленная в центр.
                    {
                        name: 'Прямые',
                        value: 38,
                        label: { show: true, position: 'center', formatter: '100%', fontSize: 14, fontWeight: 600 },
                    },
                    { name: 'Сайт', value: 27 },
                    { name: 'Агентства', value: 18 },
                    { name: 'Звонки', value: 10 },
                    { name: 'Другое', value: 7 },
                ],
            },
        ],
    }),
    card('Тепловая карта', {
        tooltip: { trigger: 'item' },
        legend: { show: false },
        xAxis: { type: 'category', data: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] },
        yAxis: { type: 'category', data: ['Н5', 'Н4', 'Н3', 'Н2', 'Н1'] },
        visualMap: {
            min: 0,
            max: 100,
            orient: 'horizontal',
            left: 0,
            bottom: 0,
            itemHeight: 64,
            itemWidth: 8,
            text: ['100%', '0%'],
            textGap: 6,
        },
        series: [
            {
                name: 'Загрузка',
                type: 'heatmap',
                itemStyle: { borderWidth: 2, borderColor: 'transparent' },
                data: HEAT.flatMap((row: readonly number[], week: number): number[][] =>
                    row.map((value: number, day: number): number[] => [day, HEAT.length - 1 - week, value])
                ),
            },
        ],
    }),
    card('Точки', {
        tooltip: { trigger: 'item' },
        xAxis: { type: 'value', min: 0, max: 100, interval: 25 },
        yAxis: { type: 'value', min: 0, max: 100, interval: 25 },
        series: [
            {
                name: 'Будни',
                type: 'scatter',
                symbolSize: 8,
                data: [
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
                type: 'scatter',
                symbolSize: 8,
                data: [
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
    }),
    {
        name: 'Дерево прямоугольников',
        build: (palette: readonly string[]): EChartsCoreOption => ({
            ...BASE,
            tooltip: { trigger: 'item' },
            // Легенда называет листья в цветах палитры; у дерева своей легенды нет, её рисует пустая серия.
            legend: { data: [...TREEMAP_LEAVES] },
            series: [
                {
                    name: 'Выручка',
                    type: 'treemap',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 46,
                    roam: false,
                    nodeClick: false,
                    breadcrumb: { show: false },
                    label: { show: false },
                    upperLabel: { show: true, height: 16, fontSize: 9, formatter: '{b} {c}%' },
                    levels: [
                        { upperLabel: { show: false }, itemStyle: { gapWidth: 2 } },
                        { itemStyle: { gapWidth: 2, borderWidth: 2 } },
                        { itemStyle: { gapWidth: 2 } },
                    ],
                    data: [
                        {
                            name: 'Проживание',
                            value: 70,
                            children: [
                                { name: ROOMS, value: 40, itemStyle: { color: palette[0] } },
                                { name: 'Апартаменты', value: 15, itemStyle: { color: palette[1] } },
                                { name: 'Виллы', value: 15, itemStyle: { color: palette[2] } },
                            ],
                        },
                        {
                            name: 'Доп. услуги',
                            value: 30,
                            children: [
                                { name: RESTAURANT, value: 15, itemStyle: { color: palette[3] } },
                                { name: 'Спа', value: 8, itemStyle: { color: palette[4] } },
                                { name: 'Трансфер', value: 7, itemStyle: { color: palette[5] } },
                            ],
                        },
                    ],
                },
                ...TREEMAP_LEAVES.map((name: string, index: number): EChartsCoreOption => ({
                    ...legendOnly(name),
                    color: palette[index],
                })),
            ],
        }),
    },
    {
        name: 'Солнечные лучи',
        build: (palette: readonly string[]): EChartsCoreOption => ({
            ...BASE,
            tooltip: { trigger: 'item' },
            legend: { data: [...SUNBURST_GROUPS] },
            series: [
                {
                    name: 'Выручка',
                    type: 'sunburst',
                    center: ['50%', '42%'],
                    radius: ['16%', '78%'],
                    itemStyle: { borderWidth: 2 },
                    label: { show: false },
                    levels: [{}, { r0: '16%', r: '46%' }, { r0: '46%', r: '78%', itemStyle: { opacity: 0.55 } }],
                    data: [
                        { name: ROOMS, children: [{ value: 28 }, { value: 12 }] },
                        { name: RESTAURANT, children: [{ value: 16 }, { value: 9 }] },
                        { name: 'Услуги', children: [{ value: 9 }, { value: 6 }] },
                    ],
                },
                // Строки легенды в цветах групп: служебные серии иначе взяли бы палитру со второго цвета.
                ...SUNBURST_GROUPS.map((name: string, index: number): EChartsCoreOption => ({
                    ...legendOnly(name),
                    color: palette[index],
                })),
            ],
        }),
    },
    card('Пустые данные', {
        xAxis: { type: 'category', data: MONTHS },
        yAxis: { type: 'value' },
        series: [{ name: 'Выручка', type: 'line', data: [] }],
    }),
];
