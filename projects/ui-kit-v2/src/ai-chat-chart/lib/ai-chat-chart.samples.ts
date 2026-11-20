import { ERtAiChatChartFormat, ERtAiChatChartKind } from './ai-chat-chart.enum';
import { IRtAiChatChart } from './ai-chat-chart.model';

const MONTHS: readonly string[] = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];

function monthly(name: string, values: readonly number[]): IRtAiChatChart.Series {
    return { name, points: values.map((y: number, index: number): IRtAiChatChart.Point => ({ x: MONTHS[index], y })) };
}

/** Образец спецификации на каждый вид — для тестов и витрины. */
export const RT_AI_CHAT_CHART_SAMPLES: Readonly<Record<ERtAiChatChartKind, IRtAiChatChart.Spec>> = {
    [ERtAiChatChartKind.LINE]: {
        kind: ERtAiChatChartKind.LINE,
        title: 'Выручка по месяцам',
        subtitle: 'Октябрь 2026, тыс. ₽',
        xLabel: 'Месяц',
        yLabel: 'тыс. ₽',
        series: [monthly('Выручка', [62, 70, 58, 80, 76, 88]), monthly('Расходы', [40, 45, 52, 48, 60, 57])],
    },
    [ERtAiChatChartKind.BAR]: {
        kind: ERtAiChatChartKind.BAR,
        title: 'Брони по месяцам',
        series: [monthly('Брони', [12, 18, 9, 21, 17, 25])],
    },
    [ERtAiChatChartKind.GROUPED_BAR]: {
        kind: ERtAiChatChartKind.GROUPED_BAR,
        title: 'Прибыль и убыток',
        format: ERtAiChatChartFormat.CURRENCY,
        currency: 'RUB',
        series: [monthly('Прибыль', [40, 25, -10, 30, 0, 45]), monthly('План', [35, 30, 20, 30, 25, 40])],
    },
    [ERtAiChatChartKind.STACKED_BAR]: {
        kind: ERtAiChatChartKind.STACKED_BAR,
        title: 'Брони по каналам',
        series: [monthly('Сайт', [10, 12, 9, 14, 13, 16]), monthly('Партнёры', [5, 6, 4, 7, 8, 9])],
    },
    [ERtAiChatChartKind.PIE]: {
        kind: ERtAiChatChartKind.PIE,
        title: 'Доля броней по типам',
        format: ERtAiChatChartFormat.PERCENT,
        series: [
            {
                name: 'Брони',
                points: [
                    { x: 'Апартаменты', y: 0.64 },
                    { x: 'Виллы', y: 0.24 },
                    { x: 'Комнаты', y: 0.12 },
                ],
            },
        ],
    },
    [ERtAiChatChartKind.HISTOGRAM]: {
        kind: ERtAiChatChartKind.HISTOGRAM,
        title: 'Длительность броней, ночей',
        series: [
            {
                name: 'Брони',
                points: [
                    { x: 1, y: 4 },
                    { x: 3, y: 11 },
                    { x: 5, y: 7 },
                    { x: 7, y: 3 },
                ],
            },
        ],
    },
    [ERtAiChatChartKind.HEATMAP]: {
        kind: ERtAiChatChartKind.HEATMAP,
        title: 'Заезды по дням недели',
        series: [
            {
                name: 'Утро',
                points: [
                    { x: 'Пн', y: 2 },
                    { x: 'Вт', y: 4 },
                    { x: 'Ср', y: 1 },
                ],
            },
            {
                name: 'Вечер',
                points: [
                    { x: 'Пн', y: 5 },
                    { x: 'Вт', y: 0 },
                    { x: 'Ср', y: 3 },
                ],
            },
        ],
    },
    [ERtAiChatChartKind.SCATTER]: {
        kind: ERtAiChatChartKind.SCATTER,
        title: 'Цена и загрузка',
        xLabel: 'Цена, тыс. ₽',
        yLabel: 'Загрузка',
        format: ERtAiChatChartFormat.PERCENT,
        series: [
            {
                name: 'Объекты',
                points: [
                    { x: 4, y: 0.82 },
                    { x: 6, y: 0.71 },
                    { x: 9, y: 0.55 },
                ],
            },
        ],
    },
    [ERtAiChatChartKind.TREEMAP]: {
        kind: ERtAiChatChartKind.TREEMAP,
        title: 'Выручка по районам',
        hierarchy: [
            { path: ['Центр', 'Апартаменты'], value: 120 },
            { path: ['Центр', 'Виллы'], value: 60 },
            { path: ['Побережье', 'Виллы'], value: 90 },
        ],
    },
    [ERtAiChatChartKind.SUNBURST]: {
        kind: ERtAiChatChartKind.SUNBURST,
        title: 'Брони по источникам',
        hierarchy: [
            { path: ['Сайт', 'Прямые'], value: 30 },
            { path: ['Сайт', 'Реклама'], value: 12 },
            { path: ['Партнёры'], value: 18 },
        ],
    },
};
