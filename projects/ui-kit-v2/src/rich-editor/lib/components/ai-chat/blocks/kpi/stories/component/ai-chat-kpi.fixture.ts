import { IRtAiChat } from '../../../../rt-ai-chat.model';

/** Случай матрицы: подпись под ячейкой, ширина ленты и блоки, которые она рисует. */
export interface IAiChatKpiCase {
    readonly name: string;
    readonly width: number;
    readonly blocks: readonly IRtAiChat.Block[];
}

const PERIOD: string = 'ноябрь 2026';

/** Неразрывный пробел: им язык разделяет разряды, и по нему строка не переносится. */
const NBSP: string = String.fromCharCode(0xa0);

/** Четыре карточки макета: рост, падение, ноль и рост показателя, где рост плох. */
const MONTH_ITEMS: readonly IRtAiChat.KpiItem[] = [
    { label: 'Выручка', value: 1240000, format: 'currency', currency: 'RUB', delta: 12.5, base: 'vs LY', period: PERIOD },
    { label: 'Средний чек', value: 8400, format: 'currency', currency: 'RUB', delta: -4, base: 'vs LY', period: PERIOD },
    { label: 'Загрузка', value: 0.78, format: 'percent', delta: 0, deltaUnit: 'points', base: 'vs LM', period: PERIOD },
    { label: 'Отмены', value: 14, delta: 8, growthIsGood: false, base: 'vs LM', period: PERIOD },
];

/** Обзор месяца: четыре карточки с ростом, падением и нулём. */
export const AI_CHAT_KPI_MONTH: IRtAiChat.KpiBlock = { type: 'kpi', items: MONTH_ITEMS };

function kpi(items: readonly IRtAiChat.KpiItem[]): IRtAiChat.KpiBlock {
    return { type: 'kpi', items };
}

/** Три ширины макета: две колонки в узкой панели, четыре в широкой. */
export const AI_CHAT_KPI_WIDTH_CASES: readonly IAiChatKpiCase[] = [
    { name: '328 — две колонки', width: 328, blocks: [AI_CHAT_KPI_MONTH] },
    { name: '386 — две колонки', width: 386, blocks: [AI_CHAT_KPI_MONTH] },
    { name: '728 — четыре колонки', width: 728, blocks: [AI_CHAT_KPI_MONTH] },
];

/** Порог четырёх колонок: 663 — две, 664 — четыре. */
export const AI_CHAT_KPI_THRESHOLD_CASES: readonly IAiChatKpiCase[] = [
    { name: '663 — две колонки', width: 663, blocks: [AI_CHAT_KPI_MONTH] },
    { name: '664 — четыре колонки', width: 664, blocks: [AI_CHAT_KPI_MONTH] },
];

/** Уже 328 — одна колонка. */
export const AI_CHAT_KPI_BELOW_CASES: readonly IAiChatKpiCase[] = [{ name: '280 — одна колонка', width: 280, blocks: [AI_CHAT_KPI_MONTH] }];

/** Дельты: рост, падение, ноль и записанный нулём малый рост — цвет и стрелка по знаку. */
export const AI_CHAT_KPI_DELTA_CASES: readonly IAiChatKpiCase[] = [
    {
        name: 'рост — хорошо',
        width: 386,
        blocks: [
            kpi([
                { label: 'Рост', value: 1200, delta: 12.5, base: 'vs LY', period: PERIOD },
                { label: 'Падение', value: 1100, delta: -4, base: 'vs LY', period: PERIOD },
                { label: 'Ноль', value: 1000, delta: 0, base: 'vs LY', period: PERIOD },
                { label: 'Почти ноль', value: 1000, delta: -0.04, base: 'vs LY', period: PERIOD },
            ]),
        ],
    },
    {
        name: 'рост — плохо',
        width: 386,
        blocks: [
            kpi([
                { label: 'Отмены', value: 14, delta: 8, growthIsGood: false, base: 'vs LM', period: PERIOD },
                { label: 'Возвраты', value: 3, delta: -25, growthIsGood: false, base: 'vs LM', period: PERIOD },
            ]),
        ],
    },
];

/** Короткая форма от миллиона рядом с полной записью и пункты рядом с процентами. */
export const AI_CHAT_KPI_SHORT_CASES: readonly IAiChatKpiCase[] = [
    {
        name: 'короткая и полная запись, 328',
        width: 328,
        blocks: [
            kpi([
                { label: 'Выручка', value: 1240000, format: 'currency', currency: 'RUB', delta: 12.5, base: 'vs LY' },
                { label: 'Средний чек', value: 8400, format: 'currency', currency: 'RUB', delta: -4, base: 'vs LY' },
                { label: 'Гости за год', value: 2500000000, period: '2026' },
                { label: 'Доля прямых', value: 0.42, format: 'percent', delta: 3, deltaUnit: 'points', base: 'vs LY' },
                { label: 'Убыток', value: -123450000000, format: 'currency', currency: 'RUB', delta: -4.2, base: 'vs LY' },
                { label: 'Средняя бронь', value: -999999.4, format: 'currency', currency: 'RUB', delta: 1.45, base: 'vs LY' },
            ]),
        ],
    },
];

/** Карточки без дельты и без периода: строки, которых нет, места не держат. */
export const AI_CHAT_KPI_PARTS_CASES: readonly IAiChatKpiCase[] = [
    {
        name: 'без дельты и периода',
        width: 386,
        blocks: [
            kpi([
                { label: 'Только значение', value: 312 },
                { label: 'С периодом', value: 312, period: PERIOD },
                { label: 'Дельта без базы', value: 312, delta: 5 },
                { label: 'Строка вместо числа', value: 'n/a', base: 'vs LY', period: PERIOD },
            ]),
        ],
    },
];

const NINE: readonly IRtAiChat.KpiItem[] = Array.from({ length: 9 }, (_: unknown, index: number): IRtAiChat.KpiItem => ({
    label: `Объект ${index + 1}`,
    value: 1000 + index * 125,
    delta: index - 4,
    base: 'vs LM',
}));

/** Нечётное число карточек: последний ряд короче и держит ширину колонки. */
export const AI_CHAT_KPI_ODD_CASES: readonly IAiChatKpiCase[] = [
    { name: 'три карточки, 328', width: 328, blocks: [kpi(MONTH_ITEMS.slice(0, 3))] },
    { name: 'три карточки, 386', width: 386, blocks: [kpi(MONTH_ITEMS.slice(0, 3))] },
    { name: 'девять карточек, 728', width: 728, blocks: [kpi(NINE)] },
];

/** Длинные тексты: подпись базы и период переносятся по словам, длинное слово рвётся. */
export const AI_CHAT_KPI_LONG_CASES: readonly IAiChatKpiCase[] = [
    {
        name: 'длинные тексты, 328',
        width: 328,
        blocks: [
            kpi([
                {
                    label: 'Выручка от продажи дополнительных услуг',
                    value: 1240000,
                    format: 'currency',
                    currency: 'RUB',
                    delta: 12.5,
                    base: 'к тому же месяцу прошлого года',
                    period: 'за период с 1 по 30 ноября 2026',
                },
                { label: 'Нераспределённыхпоканаламзаявок', value: ['1', '240', '000', '000 ₽'].join(NBSP), delta: -4, base: 'vs LY' },
                { label: 'Загрузка', value: 0.78, format: 'percent', delta: 0, deltaUnit: 'points', base: 'vs LM' },
                { label: 'Отмены', value: 14, delta: 8, growthIsGood: false, base: 'vs LM' },
            ]),
        ],
    },
];

/** Справа налево: отрицательная сумма и отрицательная дельта читаются в своём порядке — SC-UKV-1474. */
export const AI_CHAT_KPI_RTL: IRtAiChat.KpiBlock = kpi([
    { label: 'Выручка', value: -1240000, format: 'currency', currency: 'RUB', delta: -4.2, base: 'vs LY', period: PERIOD },
    MONTH_ITEMS[1],
]);

/** Испорченные блоки: на их месте заглушка ленты, соседи на месте. */
export const AI_CHAT_KPI_INVALID_CASES: readonly IAiChatKpiCase[] = [
    { name: 'items не список', width: 328, blocks: [{ type: 'kpi', items: 'карточки' }] },
    { name: 'пустой список', width: 328, blocks: [kpi([])] },
    { name: 'все карточки выпали', width: 328, blocks: [{ type: 'kpi', items: [{ label: 'Без значения' }, 'строка'] }] },
];

/** Два блока KPI в одном ответе между абзацами: каждый в своей сетке. */
export const AI_CHAT_KPI_SEVERAL: readonly IRtAiChat.Block[] = [
    { type: 'markdown', text: '**Итоги ноября.** Главное — в карточках.' },
    kpi(MONTH_ITEMS.slice(0, 2)),
    { type: 'markdown', text: 'Загрузка и отмены:' },
    kpi(MONTH_ITEMS.slice(2)),
];

/** Ответ ассистента с блоком KPI — для историй чата в панели и в полноэкранном режиме. */
export const AI_CHAT_KPI_MESSAGES: readonly IRtAiChat.Message[] = [
    { id: 'q1', role: 'user', text: 'Обзор ноября' },
    {
        id: 'a1',
        role: 'assistant',
        blocks: [{ type: 'markdown', text: 'Ноябрь в четырёх цифрах:' }, AI_CHAT_KPI_MONTH],
        run: { state: 'done', label: 'Answered', meta: '9 s' },
    },
];
