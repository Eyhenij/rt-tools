import { IRtAiChat } from '../../../../rt-ai-chat.model';

/** Случай матрицы: подпись под ячейкой, ширина ленты, направление письма и блоки, которые она рисует. */
export interface IAiChatLinkCase {
    readonly name: string;
    readonly width: number;
    readonly blocks: readonly IRtAiChat.Block[];
    readonly dir?: 'rtl';
}

const TITLE: string = 'Продажи за ноябрь';
const SECTION: string = 'Отчёты · Продажи';
const ADDRESS: string = '/reports/sales?month=11';
const REASON: string = 'Нет доступа к разделу «Отчёты»';

function link(part: Partial<IRtAiChat.LinkBlock> = {}): IRtAiChat.LinkBlock {
    return { type: 'link', title: TITLE, url: ADDRESS, section: SECTION, icon: 'chart-bar', ...part };
}

const PENDING: IRtAiChat.LinkBlock = link({ state: 'pending' });
const OPENED: IRtAiChat.LinkBlock = link({ state: 'opened' });
const FAILED: IRtAiChat.LinkBlock = link({ state: 'failed', reason: REASON });

/** Длинные название и раздел макета: название в две строки с многоточием, раздел в одну. */
const LONG: IRtAiChat.LinkBlock = link({
    title: 'Продажи по регионам и каналам за ноябрь 2026 года с разбивкой по менеджерам и точкам',
    section: 'Отчёты · Продажи · Регионы · Детализация по менеджерам и точкам продаж',
    state: 'opened',
});

/**
 * Название и раздел длиннее ряда и в колонке чтения: при 640 название не помещается в две строки,
 * а раздел в одну при любом шрифте, поэтому многоточие видно и в контейнере снимков.
 */
const LONG_WIDE: IRtAiChat.LinkBlock = {
    ...LONG,
    title: `${LONG.title}, с итогами по каждому кварталу, сравнением с прошлым годом, прогнозом на следующий месяц`,
    section: `${LONG.section} · Сравнение с планом · Прошлый год · Прогноз`,
};

/** Четыре карточки макета: открывается, открыта, не открылась, длинное название. */
export const AI_CHAT_LINK_MOCKUP: readonly IRtAiChat.Block[] = [PENDING, OPENED, FAILED, LONG];

/** Три ширины макета: узкая панель 328 и 386, колонка чтения 640. */
export const AI_CHAT_LINK_WIDTH_CASES: readonly IAiChatLinkCase[] = [
    { name: '328 — узкая панель', width: 328, blocks: AI_CHAT_LINK_MOCKUP },
    { name: '386 — узкая панель', width: 386, blocks: AI_CHAT_LINK_MOCKUP },
    { name: '640 — колонка чтения', width: 640, blocks: [PENDING, OPENED, FAILED, LONG_WIDE] },
];

/** Каждый исход открытия и карточка без исхода — по одной в ячейке. */
export const AI_CHAT_LINK_STATE_CASES: readonly IAiChatLinkCase[] = [
    { name: 'pending — открывается', width: 328, blocks: [PENDING] },
    { name: 'opened — открыта', width: 328, blocks: [OPENED] },
    { name: 'failed — с причиной', width: 328, blocks: [FAILED] },
    { name: 'failed — без причины', width: 328, blocks: [link({ state: 'failed' })] },
    { name: 'без исхода', width: 328, blocks: [link()] },
];

/** Необязательные части: без раздела, без значка, длинные название и раздел. */
export const AI_CHAT_LINK_PARTS_CASES: readonly IAiChatLinkCase[] = [
    { name: 'без раздела', width: 328, blocks: [{ type: 'link', title: TITLE, url: ADDRESS, icon: 'chart-bar', state: 'opened' }] },
    { name: 'без значка — link', width: 328, blocks: [{ type: 'link', title: TITLE, url: ADDRESS, section: SECTION }] },
    { name: 'длинное название', width: 328, blocks: [LONG] },
];

/** Испорченные блоки: на их месте заглушка ленты. */
export const AI_CHAT_LINK_INVALID_CASES: readonly IAiChatLinkCase[] = [
    { name: 'без названия', width: 328, blocks: [{ type: 'link', url: ADDRESS }] },
    { name: 'без адреса', width: 328, blocks: [{ type: 'link', title: TITLE }] },
    { name: 'адрес из пробелов', width: 328, blocks: [{ type: 'link', title: TITLE, url: '   ' }] },
];

/** Карточки макета справа налево при 328. */
export const AI_CHAT_LINK_RTL_CASES: readonly IAiChatLinkCase[] = [
    { name: '328 — справа налево', width: 328, blocks: AI_CHAT_LINK_MOCKUP, dir: 'rtl' },
];

/** Темы и наборы: четыре карточки макета при 328. */
export const AI_CHAT_LINK_THEME_CASES: readonly IAiChatLinkCase[] = [AI_CHAT_LINK_WIDTH_CASES[0]];

/** Длинные подписи кнопок при 328: вторая кнопка уходит под первую. */
export const AI_CHAT_LINK_LONG_LABEL_CASES: readonly IAiChatLinkCase[] = [
    { name: '328 — длинные подписи кнопок', width: 328, blocks: [OPENED, PENDING] },
];

/** Адрес страницы, которая в истории чата не открывается, и причина отказа. */
export const AI_CHAT_LINK_REFUSES: string = '/reports/finance';
export const AI_CHAT_LINK_REFUSAL: string = REASON;

/** Ответ ассистента с двумя карточками без исхода — начало истории чата. */
export const AI_CHAT_LINK_MESSAGES: readonly IRtAiChat.Message[] = [
    { id: 'q1', role: 'user', text: 'Где посмотреть продажи и финансы за ноябрь?' },
    {
        id: 'a1',
        role: 'assistant',
        blocks: [
            { type: 'markdown', text: 'Обе страницы — в разделе отчётов:' },
            link(),
            link({ title: 'Финансы за ноябрь', section: 'Отчёты · Финансы', url: AI_CHAT_LINK_REFUSES, icon: 'chart-line' }),
            {
                type: 'section',
                title: 'Ещё по теме',
                // Адрес с пробелами по краям: событие несёт его обрезанным, и исход всё равно находит карточку.
                blocks: [link({ title: 'Остатки на складе', section: 'Склад · Остатки', url: ' /warehouse/stock ', icon: 'box' })],
            },
        ],
        run: { state: 'done', label: 'Answered', meta: '4 s' },
    },
];
