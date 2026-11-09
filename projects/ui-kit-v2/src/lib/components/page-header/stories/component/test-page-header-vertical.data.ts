import { IRtAiChat } from '../../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.model';
import { IRtTag } from '../../../tag/rt-tag.model';
import { IRtPageHeader } from '../../rt-page-header.model';

/** Занятость беседы в поле ввода ассистента, проценты. */
export const ASSISTANT_USAGE: number = 30;

/** Беседа кадров с ассистентом. */
export const ASSISTANT_MESSAGES: readonly IRtAiChat.Message[] = [
    { id: 'q1', role: 'user', text: 'Сколько броней на следующей неделе?', time: '14:02' },
    {
        id: 'a1',
        role: 'assistant',
        text: 'На неделе с 19 по 25 октября подтверждены 6 броней. Две из них — на виллу у моря, четыре — на апартаменты. Ещё 3 заявки ждут ответа.',
        run: {
            state: 'done',
            label: 'Подобрал три варианта',
            meta: '4 шага · 18 с',
            steps: [
                { label: 'Прочитал брони недели', status: 'complete' },
                { label: 'Разделил по объектам', status: 'complete' },
                { label: 'Проверил заявки', status: 'complete' },
                { label: 'Написал ответ', status: 'complete' },
            ],
        },
    },
];

/** Отметка в ячейке таблицы: текст и цвет тега. */
export interface ITestPageMark {
    readonly value: string;
    readonly severity: IRtTag.Severity;
}

/** Строка таблицы страницы. */
export interface ITestPageRow {
    readonly id: number;
    readonly dates: string;
    readonly place: string;
    readonly guest: string;
    readonly contact: string;
    readonly party: string;
    readonly source: ITestPageMark;
    readonly status: ITestPageMark;
    readonly payment: ITestPageMark | null;
    readonly sum: string;
}

const SITE: ITestPageMark = { value: 'Сайт', severity: 'info' };
const AIRBNB: ITestPageMark = { value: 'Airbnb', severity: 'info' };
const BOOKING: ITestPageMark = { value: 'Booking', severity: 'info' };
const AGODA: ITestPageMark = { value: 'Agoda', severity: 'info' };
const DIRECT: ITestPageMark = { value: 'Напрямую', severity: 'info' };
const WAITING: ITestPageMark = { value: 'Ожидает', severity: 'warning' };
const CONFIRMED: ITestPageMark = { value: 'Подтверждена', severity: 'success' };
const REJECTED: ITestPageMark = { value: 'Отклонена', severity: 'danger' };
const CANCELLED: ITestPageMark = { value: 'Отменена', severity: 'info' };
const UNPAID: ITestPageMark = { value: 'Ждёт оплаты', severity: 'warning' };
const PAID: ITestPageMark = { value: 'Оплачено', severity: 'success' };
const REFUNDED: ITestPageMark = { value: 'Возвращено', severity: 'info' };
const EXPIRED: ITestPageMark = { value: 'Истёк', severity: 'neutral' };

const LAGOON: string = 'Вилла «Лагуна»';
const FLATS: string = 'Апартаменты «Риф»';
const SEA_HOUSE: string = 'Дом у моря';

/** Строки кадров: те же значения, что в таблице макета. */
export const PAGE_ROWS: readonly ITestPageRow[] = [
    {
        id: 1,
        dates: '2026-10-24 → 2026-10-27',
        place: LAGOON,
        guest: 'Анна Смирнова',
        contact: 'anna@example.com',
        party: '2 + 1',
        source: SITE,
        status: WAITING,
        payment: UNPAID,
        sum: '48 000 THB',
    },
    {
        id: 2,
        dates: '2026-10-20 → 2026-10-22',
        place: FLATS,
        guest: 'Иван Петров',
        contact: '—',
        party: '2 + 0',
        source: AIRBNB,
        status: CONFIRMED,
        payment: null,
        sum: '21 500 THB',
    },
    {
        id: 3,
        dates: '2026-11-01 → 2026-11-07',
        place: LAGOON,
        guest: 'Мария Козлова',
        contact: 'maria@example.com',
        party: '4 + 2',
        source: BOOKING,
        status: CONFIRMED,
        payment: PAID,
        sum: '96 000 THB',
    },
    {
        id: 4,
        dates: '2026-11-03 → 2026-11-05',
        place: SEA_HOUSE,
        guest: 'Олег Васильев',
        contact: '+66 81 234 5678',
        party: '1 + 0',
        source: DIRECT,
        status: REJECTED,
        payment: null,
        sum: '—',
    },
    {
        id: 5,
        dates: '2026-11-08 → 2026-11-14',
        place: LAGOON,
        guest: 'Елена Новикова',
        contact: 'elena@example.com',
        party: '3 + 1',
        source: SITE,
        status: CONFIRMED,
        payment: REFUNDED,
        sum: '62 300 THB',
    },
    {
        id: 6,
        dates: '2026-11-15 → 2026-11-18',
        place: FLATS,
        guest: 'Сергей Лебедев',
        contact: '—',
        party: '2 + 0',
        source: AGODA,
        status: CANCELLED,
        payment: null,
        sum: '33 900 THB',
    },
    {
        id: 7,
        dates: '2026-11-20 → 2026-11-21',
        place: SEA_HOUSE,
        guest: 'Ольга Морозова',
        contact: 'olga@example.com',
        party: '2 + 2',
        source: SITE,
        status: CANCELLED,
        payment: EXPIRED,
        sum: '9 800 THB',
    },
    {
        id: 8,
        dates: '2026-11-25 → 2026-11-30',
        place: LAGOON,
        guest: 'Дмитрий Соколов',
        contact: '—',
        party: '6 + 0',
        source: AIRBNB,
        status: WAITING,
        payment: null,
        sum: '74 000 THB',
    },
    {
        id: 9,
        dates: '2026-12-01 → 2026-12-04',
        place: SEA_HOUSE,
        guest: 'Татьяна Орлова',
        contact: 'tanya@example.com',
        party: '2 + 0',
        source: SITE,
        status: CONFIRMED,
        payment: PAID,
        sum: '28 400 THB',
    },
    {
        id: 10,
        dates: '2026-12-05 → 2026-12-12',
        place: LAGOON,
        guest: 'Павел Никитин',
        contact: '—',
        party: '5 + 1',
        source: BOOKING,
        status: CONFIRMED,
        payment: null,
        sum: '112 000 THB',
    },
    {
        id: 11,
        dates: '2026-12-14 → 2026-12-16',
        place: FLATS,
        guest: 'Ирина Зайцева',
        contact: 'irina@example.com',
        party: '1 + 0',
        source: SITE,
        status: WAITING,
        payment: UNPAID,
        sum: '14 200 THB',
    },
    {
        id: 12,
        dates: '2026-12-20 → 2026-12-27',
        place: LAGOON,
        guest: 'Алексей Волков',
        contact: '—',
        party: '6 + 2',
        source: AIRBNB,
        status: CONFIRMED,
        payment: null,
        sum: '138 600 THB',
    },
];

const GUESTS_BASE: string = 'База гостей';
const CASH_SHIFTS: string = 'Кассовые смены';

/** Пять вкладок кадров с полосой, где все вкладки встают. */
export const TAB_LABELS_SHORT: readonly string[] = ['Главная', 'Все брони', 'Календарь', GUESTS_BASE, CASH_SHIFTS];

/** Длинный список кадров «Ещё» и прокрутки полосы. */
export const TAB_LABELS_LONG: readonly string[] = [
    'Главная',
    'Все брони',
    'Календарь',
    GUESTS_BASE,
    'Отзывы',
    CASH_SHIFTS,
    'Все счета',
    'Транзакции',
    'Акты сверки',
    'Отчёт по загрузке',
    'Сверка кассы',
    'Склад',
    'Поставщики',
    'Номера',
];

/** Разделы кадров: у «Брони» открыта «Все брони», у «Гости» есть непрочитанное. */
export const PAGE_SECTIONS: ReadonlyArray<IRtPageHeader.Item> = [
    { id: 'home', label: 'Главная', icon: 'home', route: '/home' },
    {
        id: 'bookings',
        label: 'Брони',
        icon: 'calendar',
        columns: [
            {
                id: 'main',
                groups: [
                    {
                        id: 'bookings-group',
                        label: 'Брони',
                        items: [
                            { id: 'all', label: 'Все брони', route: '/', routerLinkActiveExact: true },
                            { id: 'calendar', label: 'Календарь', route: '/calendar' },
                            { id: 'requests', label: 'Заявки', route: '/requests' },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 'places',
        label: 'Объекты',
        icon: 'folder',
        columns: [
            {
                id: 'main',
                groups: [
                    {
                        id: 'places-group',
                        label: 'Объекты',
                        items: [
                            { id: 'places-all', label: 'Все объекты', route: '/places' },
                            { id: 'rooms', label: 'Номера', route: '/rooms' },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 'guests',
        label: 'Гости',
        icon: 'users',
        unread: true,
        columns: [
            {
                id: 'main',
                groups: [
                    {
                        id: 'guests-group',
                        label: 'Гости',
                        items: [
                            { id: 'guests-all', label: GUESTS_BASE, route: '/guests' },
                            { id: 'reviews', label: 'Отзывы', route: '/reviews' },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 'finance',
        label: 'Финансы',
        icon: 'wallet',
        columns: [
            {
                id: 'main',
                groups: [
                    {
                        id: 'accounts',
                        label: 'Счета',
                        items: [
                            { id: 'accounts-all', label: 'Все счета', route: '/accounts' },
                            { id: 'transactions', label: 'Транзакции', route: '/transactions' },
                            { id: 'shifts', label: CASH_SHIFTS, route: '/shifts' },
                        ],
                    },
                    {
                        id: 'documents',
                        label: 'Документы',
                        items: [
                            { id: 'new-transaction', label: 'Создать транзакцию', route: '/transactions/new' },
                            { id: 'statements', label: 'Акты сверки', route: '/statements' },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 'reports',
        label: 'Отчёты',
        icon: 'chart-bar',
        columns: [
            {
                id: 'main',
                groups: [
                    {
                        id: 'reports-group',
                        label: 'Отчёты',
                        items: [
                            { id: 'load', label: 'Отчёт по загрузке', route: '/load' },
                            { id: 'cash', label: 'Сверка кассы', route: '/cash' },
                        ],
                    },
                ],
            },
        ],
    },
    { id: 'settings', label: 'Настройки', icon: 'cog', route: '/settings' },
];

/** Разделов больше, чем встаёт в короткое окно: рейка прокручивает их над подвалом. */
export const PAGE_SECTIONS_MANY: ReadonlyArray<IRtPageHeader.Item> = [
    ...PAGE_SECTIONS,
    { id: 'history', label: 'История', icon: 'history', route: '/history' },
    { id: 'stock', label: 'Склад', icon: 'box', route: '/stock' },
    { id: 'reviews-top', label: 'Отзывы', icon: 'star', route: '/reviews-top' },
    { id: 'files', label: 'Файлы', icon: 'file', route: '/files' },
    { id: 'charts', label: 'Диаграммы', icon: 'chart-pie', route: '/charts' },
    { id: 'find', label: 'Поиск', icon: 'search', route: '/find' },
];

/** Те же разделы с недоступным пунктом: рейка и меню телефона показывают это состояние. */
export const PAGE_SECTIONS_DISABLED: ReadonlyArray<IRtPageHeader.Item> = PAGE_SECTIONS.map(
    (item: IRtPageHeader.Item): IRtPageHeader.Item =>
        item.id === 'reports' ? { id: item.id, label: item.label, icon: item.icon, disabled: true } : item
);
