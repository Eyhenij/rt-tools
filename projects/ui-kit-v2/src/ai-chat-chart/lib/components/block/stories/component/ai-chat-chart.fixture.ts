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

/** Ширины ленты по макету: узкий экран 360, панель 420 и широкий экран 760 — минус поля ленты. */
export const AI_CHAT_CHART_WIDTHS: readonly string[] = ['328px', '386px', '728px'];

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
