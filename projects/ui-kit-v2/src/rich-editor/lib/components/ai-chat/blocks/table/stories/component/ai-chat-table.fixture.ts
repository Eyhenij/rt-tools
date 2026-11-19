import { IRtAiChat } from '../../../../rt-ai-chat.model';

/** Случай матрицы: подпись под ячейкой и блоки, которые она рисует. */
export interface IAiChatTableCase {
    readonly name: string;
    readonly blocks: readonly IRtAiChat.Block[];
}

const REVENUE_COLUMNS: readonly IRtAiChat.TableColumn[] = [
    { label: 'Тип номера', type: 'text' },
    { label: 'Брони', type: 'number' },
    { label: 'Выручка', type: 'currency', currency: 'RUB' },
    { label: 'Изменение', type: 'percent' },
];

/** Выручка по типам номеров — данные макета: четыре столбца, три строки и итог. */
export const AI_CHAT_TABLE_REVENUE: IRtAiChat.TableBlock = {
    type: 'table',
    title: 'Выручка по типам номеров',
    columns: REVENUE_COLUMNS,
    rows: [
        ['Апартаменты', 27, 1240000, 0.125],
        ['Виллы', 9, 860000, -0.042],
        ['Номера', 6, 210000, 0],
    ],
    total: ['Итого', 42, 2310000, 0.061],
};

/** Узкая лента: длинное имя строки переносится внутри своей ячейки, числа не переносятся. */
const NARROW: IRtAiChat.TableBlock = {
    ...AI_CHAT_TABLE_REVENUE,
    rows: [
        ['Апартаменты у моря', 27, 1240000, 0.125],
        ['Виллы', 9, 860000, -0.042],
        ['Номера', 6, 210000, 0],
    ],
};

const MONTHS: readonly string[] = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

/** Брони по каналам и месяцам — тринадцать столбцов: таблица шире ленты и прокручивается вбок. */
export const AI_CHAT_TABLE_WIDE: IRtAiChat.TableBlock = {
    type: 'table',
    title: 'Брони по каналам и месяцам',
    columns: [{ label: 'Канал', type: 'text' }, ...MONTHS.map((label: string): IRtAiChat.TableColumn => ({ label, type: 'number' }))],
    rows: [
        ['Сайт', 12, 14, 9, 16, 18, 21, 24, 23, 17, 15, 11, 13],
        ['Партнёры', 8, 7, -3, 6, 9, 11, 12, 10, 8, 7, 5, 6],
        ['Звонки', 3, 4, 4, 5, 6, 6, 7, 7, 5, 4, 3, 3],
    ],
    total: ['Итого', 23, 25, 10, 27, 33, 38, 43, 40, 30, 26, 19, 22],
};

/** Выручка по номерам — девять строк: таблица выше 200 и прокручивается вниз под шапкой. */
export const AI_CHAT_TABLE_TALL: IRtAiChat.TableBlock = {
    type: 'table',
    title: 'Выручка по номерам',
    columns: [
        { label: 'Номер', type: 'text' },
        { label: 'Брони', type: 'number' },
        { label: 'Выручка', type: 'currency', currency: 'RUB' },
    ],
    rows: Array.from({ length: 9 }, (_: unknown, index: number): readonly (string | number)[] => [
        `№ ${index + 8}`,
        ((index * 7) % 5) + 2,
        120000 + index * 15500,
    ]),
};

/** Три коротких числовых столбца: текстового нет, таблица по своему содержимому. */
const ALL_NUMBERS: IRtAiChat.TableBlock = {
    type: 'table',
    columns: [
        { label: 'Брони', type: 'number' },
        { label: 'Ночи', type: 'number' },
        { label: 'Доля', type: 'percent' },
    ],
    rows: [
        [312, 1240, 0.42],
        [356, 1385, 0.47],
        [401, 1512, 0.51],
    ],
};

/** Знаки и пустоты: минус цветом ошибки, ноль без цвета, строка в числовом столбце как пришла. */
const NEGATIVES: IRtAiChat.TableBlock = {
    type: 'table',
    title: 'Изменение к прошлому месяцу',
    columns: [
        { label: 'Объект', type: 'text' },
        { label: 'Брони', type: 'number' },
        { label: 'Выручка', type: 'currency', currency: 'RUB' },
        { label: 'Доля', type: 'percent' },
    ],
    rows: [
        ['Вилла «Море»', -4, -125000, -0.031],
        ['Апартаменты', 0, 0, 0],
        ['Номера', 3, 42000, 0.012],
        ['Новый объект', 'н/д', null, null],
    ],
    total: ['Итого', -1, -83000, -0.019],
};

/** Без итога: последняя строка — обычная строка тела. */
const NO_TOTAL: IRtAiChat.TableBlock = { ...AI_CHAT_TABLE_REVENUE, total: null };

/** Строка разметки в ответе: таблица на тридцать строк — она растёт без предела высоты. */
function markdownRows(count: number): string {
    const rows: string[] = Array.from(
        { length: count },
        (_: unknown, index: number): string => `| № ${index + 1} | ${(index * 3) % 11} | ${index % 4 === 0 ? '-10' : String(index * 2)} |`
    );

    return ['| Номер | Брони | Изменение |', '| :--- | ---: | ---: |', ...rows].join('\n');
}

export const AI_CHAT_TABLE_WIDTH_CASES: readonly IAiChatTableCase[] = [
    { name: 'четыре столбца, 328', blocks: [NARROW] },
    { name: 'три числовых столбца, 328', blocks: [ALL_NUMBERS] },
];

export const AI_CHAT_TABLE_TOTAL_CASES: readonly IAiChatTableCase[] = [
    { name: 'с итогом', blocks: [AI_CHAT_TABLE_REVENUE] },
    { name: 'без итога', blocks: [NO_TOTAL] },
];

export const AI_CHAT_TABLE_NEGATIVE_CASES: readonly IAiChatTableCase[] = [{ name: 'минус, ноль и пустота', blocks: [NEGATIVES] }];

/** Пустые и негодные блоки: шапка без строк, итог из пустых ячеек, блок без столбцов, строки не списком. */
export const AI_CHAT_TABLE_EMPTY_CASES: readonly IAiChatTableCase[] = [
    { name: 'нет строк', blocks: [{ ...AI_CHAT_TABLE_REVENUE, rows: [], total: null }] },
    { name: 'итог из пустых ячеек', blocks: [{ ...ALL_NUMBERS, total: [null, null, null] }] },
];

/** Блок от модели, который схеме не отвечает: столбцы пусты или строки пришли строкой. */
const NO_COLUMNS: IRtAiChat.CustomBlock = { type: 'table', columns: [], rows: [] };
const ROWS_NOT_LIST: IRtAiChat.CustomBlock = { type: 'table', columns: REVENUE_COLUMNS, rows: 'строки' };

export const AI_CHAT_TABLE_INVALID_CASES: readonly IAiChatTableCase[] = [
    { name: 'нет столбцов', blocks: [NO_COLUMNS] },
    { name: 'строки не списком', blocks: [ROWS_NOT_LIST] },
];

/** Блок таблицы рядом с таблицей разметки на тридцать строк в одном ответе. */
export const AI_CHAT_TABLE_MARKDOWN: readonly IRtAiChat.Block[] = [
    {
        type: 'markdown',
        text: 'Чаще всего бронировали апартаменты:\n\n| Тип | Брони | Доля |\n| :--- | ---: | ---: |\n| Апартаменты | 27 | 64 % |\n| Виллы | 9 | 21 % |\n| Номера | 6 | 15 % |',
    },
    AI_CHAT_TABLE_REVENUE,
    { type: 'markdown', text: markdownRows(30) },
];

/** Блок и таблица разметки под `dir="rtl"`: края столбцов зеркалятся. */
export const AI_CHAT_TABLE_RTL: readonly IRtAiChat.Block[] = [
    AI_CHAT_TABLE_REVENUE,
    { type: 'markdown', text: '| Тип | Брони | Доля |\n| :--- | ---: | ---: |\n| Апартаменты | 27 | 64 % |\n| Виллы | 9 | 21 % |' },
];
