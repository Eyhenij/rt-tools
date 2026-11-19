import { IRtAiChat } from '../../../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.model';
import { ERtAiChatChartKind } from '../../../../ai-chat-chart.enum';
import { IRtAiChatChart } from '../../../../ai-chat-chart.model';
import { RT_AI_CHAT_CHART_SAMPLES } from '../../../../ai-chat-chart.samples';

/** Случай витрины: подпись ячейки и блок, который приходит во вход. */
export interface IAiChatChartCase {
    readonly name: string;
    readonly block: IRtAiChatChart.Block;
}

function ready(name: string, spec: IRtAiChatChart.Spec): IAiChatChartCase {
    return { name, block: { type: 'chart', spec } };
}

const LINE: IRtAiChatChart.Spec = RT_AI_CHAT_CHART_SAMPLES[ERtAiChatChartKind.LINE];

/** Десять видов по образцу спецификации каждого. */
export const AI_CHAT_CHART_KINDS: readonly IAiChatChartCase[] = Object.values(ERtAiChatChartKind).map(
    (kind: ERtAiChatChartKind): IAiChatChartCase => ready(kind, RT_AI_CHAT_CHART_SAMPLES[kind])
);

/** Состояния блока: ожидание, негодная спецификация, пусто, без заголовка, длинный заголовок. */
export const AI_CHAT_CHART_STATES: readonly IAiChatChartCase[] = [
    { name: 'pending', block: { type: 'chart', pending: true, spec: '{"kind":"line","title":"Выручка по мес' } },
    { name: 'invalid', block: { type: 'chart', spec: '{"kind":"line","series":[{"na' } },
    ready('empty', { kind: ERtAiChatChartKind.BAR, title: 'Выручка по месяцам', series: [{ name: 'Выручка', points: [] }] }),
    ready('zero pie', {
        kind: ERtAiChatChartKind.PIE,
        title: 'Доля броней по типам',
        series: [{ name: 'Брони', points: [{ x: 'Виллы', y: 0 }] }],
    }),
    ready('no title', { kind: LINE.kind, xLabel: LINE.xLabel, yLabel: LINE.yLabel, series: LINE.series }),
    ready('long title', {
        kind: LINE.kind,
        title: 'Выручка, расходы и прибыль по всем подразделениям и каналам продаж за полгода',
        subtitle: 'тыс. ₽',
        series: LINE.series,
    }),
    ready('60 categories', {
        kind: ERtAiChatChartKind.BAR,
        title: 'Брони по неделям',
        series: [
            {
                name: 'Брони',
                points: Array.from({ length: 60 }, (_: unknown, index: number): IRtAiChatChart.Point => ({
                    x: `Н${index + 1}`,
                    y: 10 + ((index * 7) % 23),
                })),
            },
        ],
    }),
];

const MONTHS: readonly string[] = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const CHANNELS: readonly string[] = [
    'Бронирования с сайта',
    'Партнёрские площадки',
    'Звонки в отдел продаж',
    'Корпоративные договоры',
    'Повторные гости по почте',
    'Туроператоры и агентства',
];

const ROOMS: readonly string[] = ['Номера', 'Виллы', 'Апартаменты', 'Люксы', 'Студии', 'Коттеджи', 'Шале', 'Хостел', 'Кемпинг'];

/** Крайние случаи узкой ленты: шесть длинных рядов на двенадцать месяцев, девять секторов, заголовок в 120 знаков. */
export const AI_CHAT_CHART_EDGES: readonly IAiChatChartCase[] = [
    ready('six series', {
        kind: ERtAiChatChartKind.LINE,
        title: 'Брони по каналам',
        series: CHANNELS.map((name: string, row: number): IRtAiChatChart.Series => ({
            name,
            points: MONTHS.map((x: string, index: number): IRtAiChatChart.Point => ({ x, y: 10 + row * 6 + ((index * 5 + row) % 9) })),
        })),
    }),
    ready('nine sectors', {
        kind: ERtAiChatChartKind.PIE,
        title: 'Брони по типам',
        series: [{ name: 'Брони', points: ROOMS.map((x: string, index: number): IRtAiChatChart.Point => ({ x, y: 20 - index * 2 })) }],
    }),
    ready('title 120', {
        kind: LINE.kind,
        title: 'Выручка, расходы и прибыль по всем подразделениям, каналам продаж и типам номеров за первое полугодие 2026 года',
        series: LINE.series,
    }),
];

/** Ширины ленты по макету: узкий экран 360, панель 420 и широкий экран 760 — минус поля ленты. */
export const AI_CHAT_CHART_WIDTHS: readonly string[] = ['328px', '386px', '728px'];

/** Таблица данных по макету: линия, столбики группой с минусом и нулём, дерево прямоугольников. */
export const AI_CHAT_CHART_DATA: readonly IAiChatChartCase[] = [
    ERtAiChatChartKind.LINE,
    ERtAiChatChartKind.GROUPED_BAR,
    ERtAiChatChartKind.TREEMAP,
].map((kind: ERtAiChatChartKind): IAiChatChartCase => ready(kind, RT_AI_CHAT_CHART_SAMPLES[kind]));

/** Случай ширины: блок в ленте заданной ширины. */
export interface IAiChatChartWidthCase extends IAiChatChartCase {
    readonly width: string;
}

/**
 * Таблица в лентах 328, 386 и 728 и шесть рядов в узкой ленте: широкая таблица прокручивается
 * вбок внутри блока — SC-UKV-1391.
 */
export const AI_CHAT_CHART_DATA_WIDTHS: readonly IAiChatChartWidthCase[] = [
    ...AI_CHAT_CHART_WIDTHS.map((width: string): IAiChatChartWidthCase => ({ ...ready(width, LINE), width })),
    { ...AI_CHAT_CHART_EDGES[0], name: 'six series · 328px', width: '328px' },
];

/** Дерево на 200 листьев — предел спецификации: таблица растёт в высоту вместе с блоком. */
export const AI_CHAT_CHART_DATA_LONG: IAiChatChartCase = ready('200 leaves', {
    kind: ERtAiChatChartKind.TREEMAP,
    title: 'Выручка по номерам',
    hierarchy: Array.from({ length: 200 }, (_: unknown, index: number): IRtAiChatChart.Leaf => ({
        path: [ROOMS[index % ROOMS.length], `№ ${index + 1}`],
        value: 10 + ((index * 13) % 90),
    })),
});

/** Ответ ассистента: текст, плашка, текст и график — как его видит человек в беседе. */
export const AI_CHAT_CHART_ANSWER: readonly IRtAiChat.Message[] = [
    { id: 'q1', role: 'user', text: 'Покажи выручку по месяцам', time: '14:02' },
    {
        id: 'a1',
        role: 'assistant',
        run: { state: 'done', label: 'Ответ готов', meta: '4 шага · 18 с' },
        blocks: [
            { type: 'markdown', text: '**Итоги октября.** Подтверждено 42 брони — на 8 больше, чем в сентябре.' },
            { type: 'notice', severity: 'warning', text: '31 октября ещё не закрыт, цифры могут измениться.' },
            { type: 'markdown', text: 'Чаще всего бронировали апартаменты: 27 броней из 42.' },
            { type: 'chart', spec: JSON.stringify(LINE) },
        ],
    },
];
