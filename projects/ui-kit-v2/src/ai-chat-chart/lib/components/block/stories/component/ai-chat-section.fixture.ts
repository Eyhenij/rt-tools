import { IRtAiChat } from '../../../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.model';
import { ERtAiChatChartKind } from '../../../../ai-chat-chart.enum';
import { IRtAiChatChart } from '../../../../ai-chat-chart.model';

/** Случай матрицы: подпись под ячейкой, ширина ленты, блоки и направление письма. */
export interface IAiChatSectionCase {
    readonly name: string;
    readonly width: number;
    readonly blocks: readonly IRtAiChat.Block[];
    readonly dir?: 'rtl';
}

const PERIOD: string = 'ноябрь 2026';

const OVERVIEW_TITLE: string = 'Обзор ноября';

const SUMMARY: IRtAiChat.NestedBlock = {
    type: 'markdown',
    text: 'Ноябрь закрыт с ростом выручки на **12,5 %** к прошлому году. Средний чек просел, отмен стало больше.',
};

const KPI: IRtAiChat.NestedBlock = {
    type: 'kpi',
    items: [
        { label: 'Выручка', value: 1240000, format: 'currency', currency: 'RUB', delta: 12.5, base: 'vs LY', period: PERIOD },
        { label: 'Средний чек', value: 8400, format: 'currency', currency: 'RUB', delta: -4, base: 'vs LY', period: PERIOD },
        { label: 'Загрузка', value: 0.78, format: 'percent', delta: 0, deltaUnit: 'points', base: 'vs LM', period: PERIOD },
        { label: 'Отмены', value: 14, delta: 8, growthIsGood: false, base: 'vs LM', period: PERIOD },
    ],
};

/** Полгода, которые закрывает ноябрь: оба графика обзора подписаны одинаково и стоят на одной высоте. */
const MONTHS: readonly string[] = ['Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя'];

const HALF_YEAR: string = 'Июнь — ноябрь 2026';

function monthly(name: string, values: readonly number[]): IRtAiChatChart.Series {
    return { name, points: MONTHS.map((x: string, index: number): IRtAiChatChart.Point => ({ x, y: values[index] })) };
}

const REVENUE_SPEC: IRtAiChatChart.Spec = {
    kind: ERtAiChatChartKind.LINE,
    title: 'Выручка по месяцам',
    subtitle: `${HALF_YEAR}, тыс. ₽`,
    xLabel: 'Месяц',
    yLabel: 'тыс. ₽',
    series: [monthly('Выручка', [880, 960, 1010, 940, 1102, 1240]), monthly('Расходы', [610, 640, 700, 660, 720, 760])],
};

const BOOKINGS_SPEC: IRtAiChatChart.Spec = {
    kind: ERtAiChatChartKind.BAR,
    title: 'Брони по месяцам',
    subtitle: HALF_YEAR,
    xLabel: 'Месяц',
    yLabel: 'Брони',
    series: [monthly('Брони', [118, 131, 140, 122, 137, 148])],
};

const REVENUE: IRtAiChat.NestedBlock = { type: 'chart', spec: REVENUE_SPEC };

const BOOKINGS: IRtAiChat.NestedBlock = { type: 'chart', spec: BOOKINGS_SPEC };

const TABLE: IRtAiChat.NestedBlock = {
    type: 'table',
    title: 'Объекты месяца',
    columns: [
        { label: 'Объект', type: 'text' },
        { label: 'Ночи', type: 'number' },
        { label: 'Выручка', type: 'currency', currency: 'RUB' },
    ],
    rows: [
        ['Вилла у моря', 86, 412000],
        ['Дом в горах', 74, 356000],
        ['Апартаменты в центре', 92, 298000],
        ['Шале у озера', 60, 174000],
    ],
    total: ['Итого', 312, 1240000],
};

function section(blocks: readonly IRtAiChat.NestedBlock[], title?: string): IRtAiChat.SectionBlock {
    return title === undefined ? { type: 'section', blocks } : { type: 'section', title, blocks };
}

/** Ответ «обзор месяца»: один список `blocks` с одной секцией — итог, четыре KPI, два графика, таблица. */
export const AI_CHAT_SECTION_OVERVIEW: readonly IRtAiChat.Block[] = [section([SUMMARY, KPI, REVENUE, BOOKINGS, TABLE], OVERVIEW_TITLE)];

function overview(width: number, name: string = String(width)): IAiChatSectionCase {
    return { name, width, blocks: AI_CHAT_SECTION_OVERVIEW };
}

/** Четыре ширины макета: телефон, узкая панель, колонка чтения и полный экран. */
export const AI_CHAT_SECTION_WIDTH_CASES: readonly IAiChatSectionCase[] = [overview(328), overview(386), overview(640), overview(926)];

/** Порог двух колонок: 599 — одна, 600 — две. */
export const AI_CHAT_SECTION_THRESHOLD_CASES: readonly IAiChatSectionCase[] = [overview(599), overview(600)];

/** Три графика: третий стоит один во втором ряду и держит ширину столбца. */
export const AI_CHAT_SECTION_LONE_CASES: readonly IAiChatSectionCase[] = [
    { name: '926 — три графика', width: 926, blocks: [section([REVENUE, BOOKINGS, REVENUE], 'Динамика')] },
];

const SPAN: readonly IRtAiChat.Block[] = [section([{ ...REVENUE, span: 'full' }, { ...TABLE, span: 'column' }, BOOKINGS], 'Свои места')];

/** Блок называет своё место: график на всю строку, таблица в столбец; в одной колонке место не читается. */
export const AI_CHAT_SECTION_SPAN_CASES: readonly IAiChatSectionCase[] = [
    { name: '926 — график full, таблица column', width: 926, blocks: SPAN },
    { name: '386 — одна колонка', width: 386, blocks: SPAN },
];

/** Заголовок: без него, длинный в две строки и одним словом длиннее секции. */
export const AI_CHAT_SECTION_TITLE_CASES: readonly IAiChatSectionCase[] = [
    { name: 'без заголовка', width: 386, blocks: [section([SUMMARY, KPI])] },
    {
        name: 'длинный заголовок',
        width: 386,
        blocks: [section([SUMMARY, KPI], 'Обзор ноября по всем объектам, каналам продаж и сегментам гостей')],
    },
    { name: 'слово длиннее секции', width: 328, blocks: [section([SUMMARY], 'Сверхдлинноеназваниеотчётазаноябрьбезединогопробела')] },
];

/** Блоки, которые секция не рисует сама: секция в секции и блок неизвестного типа — заглушки в столбце. */
export const AI_CHAT_SECTION_PLATE_CASES: readonly IAiChatSectionCase[] = [
    { name: 'секция в секции', width: 926, blocks: [section([{ type: 'section', blocks: [SUMMARY] }, REVENUE], 'Вложенная секция')] },
    { name: 'неизвестный блок', width: 926, blocks: [section([{ type: 'map', place: 'Сочи' }, REVENUE], 'Неизвестный блок')] },
];

/** KPI в столбце секции 640: ячейка 312, уже 328 — карточки в одну колонку. */
export const AI_CHAT_SECTION_KPI_CASES: readonly IAiChatSectionCase[] = [
    { name: '640 — KPI в столбце', width: 640, blocks: [section([{ ...KPI, span: 'column' }, REVENUE], 'KPI в узкой ячейке')] },
];

/**
 * Соседи секции по ленте: текст, другая секция, график и заглушка — каждый в 16 от секции; заглушка
 * и текст после неё — в обычных 8. Секция стоит и первой в ленте.
 */
export const AI_CHAT_SECTION_TWO: readonly IRtAiChat.Block[] = [
    section([KPI], 'Итоги ноября'),
    { type: 'markdown', text: 'Ниже — как менялась выручка и брони.' },
    section([REVENUE, BOOKINGS]),
    section([SUMMARY], 'Коротко'),
    BOOKINGS,
    section([SUMMARY]),
    { type: 'map', place: 'Сочи' },
    { type: 'markdown', text: 'Карту приложение не зарегистрировало.' },
];

/** Обзор под `dir="rtl"`: колонки зеркалятся. */
export const AI_CHAT_SECTION_RTL_CASES: readonly IAiChatSectionCase[] = [{ ...overview(926, '926 — rtl'), dir: 'rtl' }];

/** Секция без блока, который можно нарисовать: на её месте заглушка. */
export const AI_CHAT_SECTION_INVALID_CASES: readonly IAiChatSectionCase[] = [
    { name: 'без blocks', width: 386, blocks: [{ type: 'section', title: OVERVIEW_TITLE }] },
    { name: 'blocks пуст', width: 386, blocks: [{ type: 'section', blocks: [] }] },
    { name: 'blocks без блоков', width: 386, blocks: [{ type: 'section', blocks: [7, null, {}] }] },
];

/** Темы: узкая панель и полный экран. */
export const AI_CHAT_SECTION_THEME_CASES: readonly IAiChatSectionCase[] = [overview(386), overview(926)];

/**
 * Беседа с обзором: ответ выше ленты, поэтому лента прокручивается и полоса прокрутки забирает
 * своё место. Заголовок секции длиннее узкой панели.
 */
export const AI_CHAT_SECTION_MESSAGES: readonly IRtAiChat.Message[] = [
    { id: 'q1', role: 'user', text: OVERVIEW_TITLE },
    {
        id: 'a1',
        role: 'assistant',
        blocks: [
            { type: 'markdown', text: 'Собрал обзор месяца одним ответом.' },
            section([SUMMARY, KPI, REVENUE, BOOKINGS, TABLE], 'Обзор ноября по всем объектам и каналам продаж'),
        ],
        run: { state: 'done', label: 'Answered', meta: '14 s' },
    },
];

/** Беседы для колонки бесед полноэкранного режима. */
export const AI_CHAT_SECTION_THREADS: readonly IRtAiChat.Thread[] = [
    { id: 't1', title: OVERVIEW_TITLE, time: '14:02' },
    { id: 't2', title: 'Брони на лето', time: 'Вчера' },
    { id: 't3', title: 'Какие даты требуют внимания?', time: 'Пн' },
];
