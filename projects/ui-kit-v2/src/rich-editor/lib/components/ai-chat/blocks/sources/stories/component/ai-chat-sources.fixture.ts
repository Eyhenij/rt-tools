import { IRtAiChat } from '../../../../rt-ai-chat.model';

/** Случай матрицы: подпись под ячейкой, ширина ленты, раскрыт ли список, направление письма и блоки. */
export interface IAiChatSourcesCase {
    readonly name: string;
    readonly width: number;
    readonly blocks: readonly IRtAiChat.Block[];
    readonly open?: boolean;
    readonly dir?: 'rtl';
}

const SALES: IRtAiChat.SourceItem = {
    title: 'Отчёт «Продажи»',
    detail: 'Ноябрь 2026 · все филиалы',
    icon: 'chart-bar',
    url: '/reports/sales',
};
const BOOKINGS: IRtAiChat.SourceItem = {
    title: 'Таблица броней',
    detail: 'Страница 3 · фильтр: активные',
    icon: 'table',
    url: '/bookings',
};
const CONTRACT: IRtAiChat.SourceItem = { title: 'Договор аренды.pdf', icon: 'file-pdf', url: '/files/contract' };
const STOCK: IRtAiChat.SourceItem = { title: 'Склад (внутренний учёт)', detail: 'Обновлено вчера', icon: 'database' };

/** Длинные название и уточнение макета: оба обрезаются многоточием в одной строке. */
const LONG: IRtAiChat.SourceItem = {
    title: 'Очень длинное название источника, которое не помещается в одну строку блока и в колонке чтения тоже',
    detail: 'Очень длинное уточнение источника: период, фильтры, страница и ещё несколько условий выборки данных',
    icon: 'file',
    url: '/reports/long',
};

function sources(items: readonly IRtAiChat.SourceItem[]): IRtAiChat.SourcesBlock {
    return { type: 'sources', items };
}

const FIVE: IRtAiChat.SourcesBlock = sources([SALES, BOOKINGS, CONTRACT, STOCK, LONG]);
const ONE: IRtAiChat.SourcesBlock = sources([SALES]);

/** Три ширины макета: узкая панель 328 и 386, колонка чтения 640; пять источников, раскрыто. */
export const AI_CHAT_SOURCES_WIDTH_CASES: readonly IAiChatSourcesCase[] = [
    { name: '328 — узкая панель', width: 328, blocks: [FIVE], open: true },
    { name: '386 — узкая панель', width: 386, blocks: [FIVE], open: true },
    { name: '640 — колонка чтения', width: 640, blocks: [FIVE], open: true },
];

/** Свёрнуто и раскрыто, один и пять источников. */
export const AI_CHAT_SOURCES_STATE_CASES: readonly IAiChatSourcesCase[] = [
    { name: 'свёрнут — 5', width: 328, blocks: [FIVE] },
    { name: 'свёрнут — 1', width: 328, blocks: [ONE] },
    { name: 'раскрыт — 1', width: 328, blocks: [ONE], open: true },
    { name: 'раскрыт — 5', width: 328, blocks: [FIVE], open: true },
];

/** Необязательные части: без уточнения, без адреса, значок вне набора, длинные тексты, равные источники. */
export const AI_CHAT_SOURCES_PARTS_CASES: readonly IAiChatSourcesCase[] = [
    { name: 'без уточнения', width: 328, blocks: [sources([CONTRACT])], open: true },
    { name: 'без адреса — текст', width: 328, blocks: [sources([STOCK])], open: true },
    {
        name: 'значок вне набора — file',
        width: 328,
        blocks: [sources([{ title: 'Прочее', icon: 'no-such-icon-name', url: '/other' }])],
        open: true,
    },
    { name: 'длинные название и уточнение', width: 328, blocks: [sources([LONG])], open: true },
    { name: 'равные источники', width: 328, blocks: [sources([STOCK, STOCK])], open: true },
];

/** Испорченные блоки: на их месте заглушка ленты. */
export const AI_CHAT_SOURCES_INVALID_CASES: readonly IAiChatSourcesCase[] = [
    { name: 'без списка', width: 328, blocks: [{ type: 'sources' }] },
    { name: 'пустой список', width: 328, blocks: [{ type: 'sources', items: [] }] },
    { name: 'источник без названия', width: 328, blocks: [{ type: 'sources', items: [{ detail: 'без названия' }, { title: '   ' }] }] },
];

/** Раскрытый список справа налево при 328. */
export const AI_CHAT_SOURCES_RTL_CASES: readonly IAiChatSourcesCase[] = [
    { name: '328 — справа налево', width: 328, blocks: [FIVE], open: true, dir: 'rtl' },
];

/** Темы и наборы: пять источников раскрыто при 328. */
export const AI_CHAT_SOURCES_THEME_CASES: readonly IAiChatSourcesCase[] = [AI_CHAT_SOURCES_WIDTH_CASES[0]];

/** Начало истории чата: ответ с источниками, одним в секции и одним вне. */
export const AI_CHAT_SOURCES_MESSAGES: readonly IRtAiChat.Message[] = [
    { id: 'q1', role: 'user', text: 'Откуда цифры по продажам за ноябрь?' },
    {
        id: 'a1',
        role: 'assistant',
        blocks: [
            { type: 'markdown', text: 'Цифры взяты из двух отчётов:' },
            sources([SALES, STOCK]),
            { type: 'section', title: 'Ещё по теме', blocks: [sources([BOOKINGS])] },
        ],
        run: { state: 'done', label: 'Answered', meta: '4 s' },
    },
];
